const db = require('./index');

async function syncAllBuilderComponents() {
  console.log('--- SYNCING RICH GAMING & NON-GAMING BUILDER COMPONENTS ---');

  // 1. Monitors
  const monitors = await db.query(`
    SELECT p.id, p.name FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = 'monitors' AND p.id NOT IN (SELECT product_id FROM components WHERE component_type = 'monitor')
  `);
  for (const m of monitors.rows) {
    await db.query(`
      INSERT INTO components (product_id, component_type, wattage, active)
      VALUES ($1, 'monitor', 35, true)
    `, [m.id]);
    console.log(`+ Linked Monitor to Builder: ${m.name}`);
  }

  // 2. Keyboards
  const keyboards = await db.query(`
    SELECT p.id, p.name FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = 'keyboards' AND p.id NOT IN (SELECT product_id FROM components WHERE component_type = 'keyboard')
  `);
  for (const k of keyboards.rows) {
    await db.query(`
      INSERT INTO components (product_id, component_type, wattage, active)
      VALUES ($1, 'keyboard', 2, true)
    `, [k.id]);
    console.log(`+ Linked Keyboard to Builder: ${k.name}`);
  }

  // 3. Mice (Gaming & Normal Office)
  const mice = await db.query(`
    SELECT p.id, p.name FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug IN ('gaming-mice', 'normal-mice') AND p.id NOT IN (SELECT product_id FROM components WHERE component_type = 'mouse')
  `);
  for (const m of mice.rows) {
    await db.query(`
      INSERT INTO components (product_id, component_type, wattage, active)
      VALUES ($1, 'mouse', 2, true)
    `, [m.id]);
    console.log(`+ Linked Mouse to Builder: ${m.name}`);
  }

  // 4. Add additional specific office / non-gaming budget items and extreme gaming items
  const richItems = [
    // Non-Gaming / Office Budget CPUS
    {
      type: 'cpu',
      cat: 7,
      name: 'Intel Pentium Gold G7400 Dual-Core Budget Office Processor',
      slug: 'intel-pentium-gold-g7400-cpu',
      brand: 'Intel',
      sku: 'CPU-INT-G7400',
      price: 5499,
      comp: 6499,
      stock: 25,
      socket: 'LGA1700',
      watt: 46,
      desc: '2 Cores, 4 Threads up to 3.7GHz with Intel UHD 710 Graphics. Ideal ultra-budget office, billing & study desktop. Socket LGA1700.',
      img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80'
    },
    {
      type: 'cpu',
      cat: 7,
      name: 'AMD Ryzen 3 4100 Quad-Core Desktop Processor',
      slug: 'amd-ryzen-3-4100-cpu',
      brand: 'AMD',
      sku: 'CPU-AMD-4100',
      price: 5999,
      comp: 7499,
      stock: 20,
      socket: 'AM4',
      watt: 65,
      desc: '4 Cores, 8 Threads up to 4.0GHz. Reliable everyday office workstation & student PC. Socket AM4.',
      img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80'
    },
    // Non-Gaming Silent Office Cabinets & High-End Gaming Cabinets
    {
      type: 'cabinet',
      cat: 7,
      name: 'Frontech Supreme Micro-ATX Silent Office Cabinet with SMPS',
      slug: 'frontech-supreme-matx-office-cabinet',
      brand: 'Frontech',
      sku: 'CAB-FRO-SUP',
      price: 1699,
      comp: 2199,
      stock: 30,
      ff: 'Micro-ATX,Mini-ITX',
      gpu_len: 260,
      cool_ht: 145,
      desc: 'Sleek black professional office chassis with front audio & USB 2.0/3.0. Non-RGB quiet office build.',
      img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80'
    },
    {
      type: 'cabinet',
      cat: 7,
      name: 'Lian Li O11 Dynamic EVO Panoramic Dual-Chamber Gaming Case',
      slug: 'lian-li-o11-dynamic-evo-case',
      brand: 'Lian Li',
      sku: 'CAB-LIAN-O11D',
      price: 13999,
      comp: 16999,
      stock: 10,
      ff: 'ATX,Micro-ATX,Mini-ITX',
      gpu_len: 420,
      cool_ht: 167,
      desc: 'Showcase dual tempered glass aquarium design, reversible chassis, supports up to 3x 360mm radiators.',
      img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80'
    },
    // Non-Gaming / Budget Entry GPU vs High-End GPUs
    {
      type: 'gpu',
      cat: 7,
      name: 'ASUS GeForce GT 710 2GB DDR5 Silent Multi-Display Office Card',
      slug: 'asus-geforce-gt-710-2gb-silent',
      brand: 'ASUS',
      sku: 'GPU-ASUS-GT710',
      price: 3499,
      comp: 4299,
      stock: 25,
      length: 170,
      watt: 19,
      desc: '0dB Silent Passive Cooling | Multi-Monitor Display Support (HDMI, DVI, VGA) | Low Profile Bracket Included.',
      img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80'
    },
    {
      type: 'gpu',
      cat: 7,
      name: 'NVIDIA RTX 4090 24GB GDDR6X Ultimate Beast Graphics Card',
      slug: 'nvidia-rtx-4090-24gb-gddr6x',
      brand: 'ASUS',
      sku: 'GPU-ASUS-4090',
      price: 189999,
      comp: 209999,
      stock: 4,
      length: 348,
      watt: 450,
      desc: '24GB G6X 384-bit, 16384 CUDA Cores, Ada Lovelace flagship for unmatched 4K 240FPS gaming and AI LLM training.',
      img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80'
    },
    // Stock / Quiet Air Coolers
    {
      type: 'cooler',
      cat: 7,
      name: 'Intel Original LGA1700 Laminar Stealth Stock CPU Cooler',
      slug: 'intel-laminar-stealth-stock-cooler',
      brand: 'Intel',
      sku: 'CLR-INT-STEALTH',
      price: 599,
      comp: 899,
      stock: 40,
      socket: 'LGA1700',
      ht: 47,
      watt: 2,
      desc: 'Low-profile quiet 47mm stock air cooler with pre-applied thermal compound for Intel 12th/13th/14th Gen.',
      img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80'
    },
    {
      type: 'cooler',
      cat: 7,
      name: 'AMD Wraith Stealth AM4/AM5 Compact Stock Cooler',
      slug: 'amd-wraith-stealth-cooler',
      brand: 'AMD',
      sku: 'CLR-AMD-STEALTH',
      price: 649,
      comp: 999,
      stock: 35,
      socket: 'AM4,AM5',
      ht: 54,
      watt: 2,
      desc: 'Authentic AMD compact silent cooler for 65W Ryzen desktop processors.',
      img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80'
    }
  ];

  for (const item of richItems) {
    const existing = await db.query('SELECT id FROM products WHERE slug = $1', [item.slug]);
    let pId;
    if (existing.rowCount > 0) {
      pId = existing.rows[0].id;
    } else {
      const pRes = await db.query(`
        INSERT INTO products (category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, false)
        RETURNING id
      `, [item.cat, item.name, item.slug, item.brand, item.sku, item.desc, item.desc.split('.')[0], item.price, item.comp, item.stock, item.img]);
      pId = pRes.rows[0].id;
    }

    await db.query(`
      INSERT INTO components (product_id, component_type, socket, ram_type, form_factor, wattage, gpu_length, cooler_height, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      ON CONFLICT DO NOTHING
    `, [pId, item.type, item.socket || null, item.ram_type || null, item.ff || null, item.watt || 0, item.length || item.gpu_len || 0, item.ht || item.cool_ht || 0]);
    console.log(`+ Synced Rich Component [${item.type}]: ${item.name}`);
  }

  const compStats = await db.query('SELECT component_type, count(*) FROM components GROUP BY component_type ORDER BY count DESC');
  console.log('\n--- UPDATED COMPONENT COUNTS IN BUILDER ---');
  console.table(compStats.rows);
  console.log('✅ Sync Completed Successfully!');
}

syncAllBuilderComponents()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
