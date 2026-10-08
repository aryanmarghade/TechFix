const express = require('express');
const db = require('../db');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/builder/components?type=cpu
router.get('/components', async (req, res) => {
  try {
    const { type } = req.query;

    let queryText = `
      SELECT c.*, p.name, p.slug, p.brand, p.price, p.image_url, p.short_description, p.stock_quantity
      FROM components c
      JOIN products p ON c.product_id = p.id
      WHERE c.active = true AND p.active = true AND p.stock_quantity > 0
    `;
    const params = [];

    if (type) {
      queryText += ' AND c.component_type = $1';
      params.push(type);
    }

    queryText += ' ORDER BY p.price ASC';

    const result = await db.query(queryText, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch builder components error:', error);
    res.status(500).json({ success: false, message: 'Failed to load PC components.' });
  }
});

// POST /api/builder/validate (COMPATIBILITY ENGINE)
router.post('/validate', async (req, res) => {
  try {
    const { parts } = req.body; // { cpu, motherboard, ram, gpu, ssd, psu, cooler, cabinet, os }
    const errors = [];
    const warnings = [];
    let estimatedWattage = 50; // base system wattage

    if (!parts || typeof parts !== 'object') {
      return res.json({ success: true, valid: true, errors: [], warnings: [], estimatedWattage: 50 });
    }

    // Fetch full component data for provided IDs
    const partKeys = Object.keys(parts).filter(k => parts[k]);
    const componentMap = {};

    for (const key of partKeys) {
      const partObj = parts[key];
      const compId = (partObj && typeof partObj === 'object') ? (partObj.id || partObj.component_id || partObj.product_id) : partObj;
      const compType = (partObj && typeof partObj === 'object' && partObj.component_type) ? partObj.component_type : key;

      const compRes = await db.query(`
        SELECT c.*, p.name, p.price, p.image_url
        FROM components c
        JOIN products p ON c.product_id = p.id
        WHERE (c.id = $1 OR c.product_id = $1)
        ORDER BY CASE WHEN c.component_type = $2 THEN 0 ELSE 1 END, c.id ASC
        LIMIT 1
      `, [compId, compType]);

      if (compRes.rowCount > 0) {
        componentMap[key] = compRes.rows[0];
      }
    }

    const cpu = componentMap.cpu;
    const mb = componentMap.motherboard;
    const ram = componentMap.ram;
    const gpu = componentMap.gpu;
    const psu = componentMap.psu;
    const cooler = componentMap.cooler;
    const cabinet = componentMap.cabinet;

    // 1. Calculate Estimated Wattage
    if (cpu && cpu.wattage) estimatedWattage += parseInt(cpu.wattage, 10);
    if (mb && mb.wattage) estimatedWattage += parseInt(mb.wattage, 10);
    if (ram && ram.wattage) estimatedWattage += parseInt(ram.wattage, 10);
    if (gpu && gpu.wattage) estimatedWattage += parseInt(gpu.wattage, 10);
    if (cooler && cooler.wattage) estimatedWattage += parseInt(cooler.wattage, 10);

    // 2. CPU <-> Motherboard Socket Validation
    if (cpu && mb) {
      if (cpu.socket && mb.socket && cpu.socket.trim() !== mb.socket.trim()) {
        errors.push({
          type: 'SOCKET_MISMATCH',
          message: `Incompatible Socket: Selected CPU (${cpu.name}) uses socket ${cpu.socket}, but motherboard (${mb.name}) has socket ${mb.socket}.`
        });
      }
    }

    // 3. RAM <-> Motherboard Generation Validation (DDR4 vs DDR5)
    if (ram && mb) {
      if (ram.ram_type && mb.ram_type && ram.ram_type.trim() !== mb.ram_type.trim()) {
        errors.push({
          type: 'RAM_TYPE_MISMATCH',
          message: `Incompatible RAM Generation: Motherboard (${mb.name}) supports ${mb.ram_type}, but selected RAM is ${ram.ram_type}.`
        });
      }
    }

    // 4. Motherboard <-> Cabinet Form Factor
    if (mb && cabinet) {
      if (cabinet.form_factor && mb.form_factor) {
        const supportedFactors = cabinet.form_factor.split(',').map(s => s.trim().toLowerCase());
        if (!supportedFactors.includes(mb.form_factor.trim().toLowerCase())) {
          errors.push({
            type: 'FORM_FACTOR_MISMATCH',
            message: `Chassis Size Incompatible: Cabinet (${cabinet.name}) does not support ${mb.form_factor} motherboard size.`
          });
        }
      }
    }

    // 5. GPU Physical Length <-> Cabinet Clearance
    if (gpu && cabinet && gpu.gpu_length && cabinet.gpu_length) {
      if (gpu.gpu_length > cabinet.gpu_length) {
        errors.push({
          type: 'GPU_CLEARANCE_EXCEEDED',
          message: `Physical Dimension Issue: GPU length (${gpu.gpu_length}mm) exceeds maximum cabinet clearance (${cabinet.gpu_length}mm).`
        });
      }
    }

    // 6. CPU Cooler Height <-> Cabinet Max Cooler Clearance
    if (cooler && cabinet && cooler.cooler_height && cabinet.cooler_height) {
      if (cooler.cooler_height > cabinet.cooler_height) {
        errors.push({
          type: 'COOLER_CLEARANCE_EXCEEDED',
          message: `Cooler Height Issue: Air cooler height (${cooler.cooler_height}mm) exceeds cabinet clearance (${cabinet.cooler_height}mm).`
        });
      }
    }

    // 7. CPU Cooler Socket Support
    if (cpu && cooler && cooler.socket && cpu.socket) {
      const supportedSockets = cooler.socket.split(',').map(s => s.trim().toUpperCase());
      if (!supportedSockets.includes(cpu.socket.trim().toUpperCase())) {
        errors.push({
          type: 'COOLER_SOCKET_MISMATCH',
          message: `Cooler Incompatibility: CPU Cooler does not include mounting brackets for socket ${cpu.socket}.`
        });
      }
    }

    // 8. PSU Wattage Headroom Check (Warning if headroom < 20%)
    if (psu && psu.wattage) {
      const recommendedPsu = Math.ceil(estimatedWattage * 1.25 / 50) * 50;
      if (psu.wattage < estimatedWattage) {
        errors.push({
          type: 'INSUFFICIENT_PSU_POWER',
          message: `Critical Power Deficiency: System estimated power draw is ~${estimatedWattage}W, but selected PSU only provides ${psu.wattage}W.`
        });
      } else if (psu.wattage < recommendedPsu) {
        warnings.push({
          type: 'LOW_PSU_HEADROOM',
          message: `Power Headroom Recommendation: System load is ~${estimatedWattage}W. A ${recommendedPsu}W+ power supply is recommended for peak transients and efficiency.`
        });
      }
    }

    const isValid = errors.length === 0;

    res.json({
      success: true,
      valid: isValid,
      errors,
      warnings,
      estimatedWattage,
      recommendedPsuWattage: Math.ceil(estimatedWattage * 1.25 / 50) * 50
    });
  } catch (error) {
    console.error('PC Builder validation error:', error);
    res.status(500).json({ success: false, message: 'Failed to run compatibility check.' });
  }
});

// POST /api/builder/save-build (SAVE CUSTOM BUILD TO ACCOUNT)
router.post('/save-build', authenticateToken, async (req, res) => {
  try {
    const { name, configuration, total_price, assembly_fee = 999.00 } = req.body;

    if (!configuration || !total_price) {
      return res.status(400).json({ success: false, message: 'Configuration and total price are required.' });
    }

    const saved = await db.query(
      `INSERT INTO custom_builds (user_id, name, assembly_fee, total_price, status, configuration)
       VALUES ($1, $2, $3, $4, 'saved', $5)
       RETURNING *`,
      [req.user.id, name || 'My Custom PC Build', assembly_fee, total_price, JSON.stringify(configuration)]
    );

    res.status(201).json({ success: true, message: 'Custom PC build saved to your account!', data: saved.rows[0] });
  } catch (error) {
    console.error('Save build error:', error);
    res.status(500).json({ success: false, message: 'Failed to save custom PC build.' });
  }
});

// GET /api/builder/my-builds
router.get('/my-builds', authenticateToken, async (req, res) => {
  try {
    const builds = await db.query(
      'SELECT * FROM custom_builds WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: builds.rows });
  } catch (error) {
    console.error('Fetch my builds error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch saved builds.' });
  }
});

module.exports = router;
