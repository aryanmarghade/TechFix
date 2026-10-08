const db = require('./index');

async function seedMassiveProducts() {
  console.log('--- SEEDING EXPANDED CATALOG & RICH INVENTORY ---');

  // Fetch category IDs map
  const catRes = await db.query('SELECT id, slug FROM categories');
  const catMap = {};
  catRes.rows.forEach(r => { catMap[r.slug] = r.id; });

  const newProducts = [
    // 1. Next-Gen Gaming GPUs & Workstation GPUs (pc-components)
    {
      cat: catMap['pc-components'] || 7,
      name: 'NVIDIA GeForce RTX 4090 OC 24GB GDDR6X Graphics Card',
      slug: 'nvidia-geforce-rtx-4090-24gb-gpu',
      brand: 'ASUS ROG',
      sku: 'GPU-RTX4090-24G',
      price: 184999,
      comp: 199999,
      stock: 6,
      featured: true,
      desc: 'The ultimate GeForce GPU delivering an enormous leap in performance, efficiency, and AI-powered graphics with Ada Lovelace architecture and 24GB G6X memory.',
      short: 'Flagship 24GB GDDR6X GPU for 4K Extreme Gaming & AI Rendering',
      img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&q=80',
      specs: [
        { k: 'VRAM', v: '24GB GDDR6X' },
        { k: 'CUDA Cores', v: '16384' },
        { k: 'Power Consumption', v: '450W TDP' },
        { k: 'Recommended PSU', v: '850W - 1000W' }
      ],
      compData: { type: 'gpu', wattage: 450, gpu_length: 357 }
    },
    {
      cat: catMap['pc-components'] || 7,
      name: 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X Gaming GPU',
      slug: 'nvidia-geforce-rtx-4070-super-12gb-gpu',
      brand: 'Gigabyte',
      sku: 'GPU-RTX4070S-12G',
      price: 59999,
      comp: 66999,
      stock: 14,
      featured: true,
      desc: 'Supercharged 1440p High Refresh Rate and Ray Tracing performance with DLSS 3.5 frame generation.',
      short: 'Sweet Spot 1440p Gaming GPU with 12GB GDDR6X & DLSS 3',
      img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=700&q=80',
      specs: [
        { k: 'VRAM', v: '12GB GDDR6X' },
        { k: 'Memory Bus', v: '192-bit' },
        { k: 'TDP', v: '220W' }
      ],
      compData: { type: 'gpu', wattage: 220, gpu_length: 261 }
    },
    {
      cat: catMap['pc-components'] || 7,
      name: 'AMD Radeon RX 7800 XT 16GB GDDR6 Graphics Card',
      slug: 'amd-radeon-rx-7800-xt-16gb-gpu',
      brand: 'Sapphire',
      sku: 'GPU-RX7800XT-16G',
      price: 49999,
      comp: 54999,
      stock: 10,
      featured: true,
      desc: 'High performance gaming with 16GB VRAM, RDNA 3 architecture, and AMD HYPR-RX technology for ultra fluid frame rates.',
      short: '16GB GDDR6 High-FPS 1440p Gaming GPU with RDNA 3',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&q=80',
      specs: [
        { k: 'VRAM', v: '16GB GDDR6' },
        { k: 'Memory Bus', v: '256-bit' },
        { k: 'TDP', v: '263W' }
      ],
      compData: { type: 'gpu', wattage: 263, gpu_length: 280 }
    },

    // 2. Next-Gen CPUs (pc-components)
    {
      cat: catMap['pc-components'] || 7,
      name: 'AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor (AM5)',
      slug: 'amd-ryzen-7-7800x3d-processor',
      brand: 'AMD',
      sku: 'CPU-AMD-7800X3D',
      price: 38999,
      comp: 44999,
      stock: 12,
      featured: true,
      desc: 'The world’s fastest gaming processor featuring revolutionary AMD 3D V-Cache technology with 104MB cache.',
      short: 'King of Gaming CPUs with 3D V-Cache & 5.0GHz Boost',
      img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=700&q=80',
      specs: [
        { k: 'Socket', v: 'AM5' },
        { k: 'Cores / Threads', v: '8 Cores / 16 Threads' },
        { k: 'L3 Cache', v: '96MB (104MB total)' },
        { k: 'TDP', v: '120W' }
      ],
      compData: { type: 'cpu', socket: 'AM5', wattage: 120 }
    },
    {
      cat: catMap['pc-components'] || 7,
      name: 'Intel Core i7-14700K 20-Core 28-Thread Processor (LGA1700)',
      slug: 'intel-core-i7-14700k-processor',
      brand: 'Intel',
      sku: 'CPU-INT-14700K',
      price: 37999,
      comp: 42999,
      stock: 15,
      featured: true,
      desc: '14th Gen Intel processor with 20 cores (8 P-cores + 12 E-cores) reaching up to 5.6 GHz turbo for heavy multitasking and gaming.',
      short: '20-Core Unlocked Processor up to 5.6GHz for Creators & Gamers',
      img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&q=80',
      specs: [
        { k: 'Socket', v: 'LGA1700' },
        { k: 'Cores / Threads', v: '20 Cores / 28 Threads' },
        { k: 'Max Turbo Frequency', v: '5.60 GHz' },
        { k: 'TDP', v: '125W Base (253W Turbo)' }
      ],
      compData: { type: 'cpu', socket: 'LGA1700', wattage: 253 }
    },
    {
      cat: catMap['pc-components'] || 7,
      name: 'AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Processor',
      slug: 'amd-ryzen-5-7600x-processor',
      brand: 'AMD',
      sku: 'CPU-AMD-7600X',
      price: 19499,
      comp: 23999,
      stock: 20,
      featured: false,
      desc: 'High-speed 6-core Zen 4 desktop processor built on 5nm process with PCIe 5.0 and DDR5 memory support.',
      short: 'Zen 4 High Performance AM5 Processor with 5.3GHz Boost',
      img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=700&q=80',
      specs: [
        { k: 'Socket', v: 'AM5' },
        { k: 'Cores / Threads', v: '6 Cores / 12 Threads' },
        { k: 'Base / Boost Clock', v: '4.7 GHz / 5.3 GHz' },
        { k: 'TDP', v: '105W' }
      ],
      compData: { type: 'cpu', socket: 'AM5', wattage: 105 }
    },

    // 3. Motherboards (pc-components)
    {
      cat: catMap['pc-components'] || 7,
      name: 'ASUS ROG STRIX B650E-F Gaming WiFi Motherboard (AM5, DDR5)',
      slug: 'asus-rog-strix-b650e-f-gaming-wifi-motherboard',
      brand: 'ASUS',
      sku: 'MB-ASUS-B650EF',
      price: 26999,
      comp: 29999,
      stock: 9,
      featured: true,
      desc: 'Premium AM5 gaming motherboard with PCIe 5.0 GPU and M.2 support, 12+2 power stages, WiFi 6E, and SupremeFX audio.',
      short: 'PCIe 5.0 AM5 ATX Motherboard with WiFi 6E & Robust VRMs',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80',
      specs: [
        { k: 'Socket', v: 'AM5' },
        { k: 'RAM Support', v: 'DDR5 up to 6400MHz+(OC)' },
        { k: 'Form Factor', v: 'ATX' },
        { k: 'M.2 Slots', v: '3x M.2 (1x PCIe 5.0)' }
      ],
      compData: { type: 'motherboard', socket: 'AM5', ram_type: 'DDR5', form_factor: 'ATX', wattage: 50, m2_slots: 3 }
    },
    {
      cat: catMap['pc-components'] || 7,
      name: 'MSI MAG Z790 TOMAHAWK MAX WIFI Motherboard (LGA1700, DDR5)',
      slug: 'msi-mag-z790-tomahawk-max-wifi-motherboard',
      brand: 'MSI',
      sku: 'MB-MSI-Z790TH',
      price: 28499,
      comp: 32999,
      stock: 8,
      featured: false,
      desc: 'Heavy-duty Z790 board engineered for 14th Gen Intel Core CPUs with Wi-Fi 7, 16+1+1 Duet Rail Power System, and 4x M.2 Gen4.',
      short: 'Wi-Fi 7 Z790 Motherboard for 14th Gen Intel Processors',
      img: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=700&q=80',
      specs: [
        { k: 'Socket', v: 'LGA1700' },
        { k: 'RAM Support', v: 'DDR5 up to 7800MHz+(OC)' },
        { k: 'Form Factor', v: 'ATX' },
        { k: 'Wireless', v: 'Wi-Fi 7 + Bluetooth 5.4' }
      ],
      compData: { type: 'motherboard', socket: 'LGA1700', ram_type: 'DDR5', form_factor: 'ATX', wattage: 55, m2_slots: 4 }
    },

    // 4. Gen5 / Ultra Fast Storage (internal-ssds)
    {
      cat: catMap['internal-ssds'] || 3,
      name: 'Crucial T700 2TB PCIe Gen5 NVMe M.2 SSD (12,400 MB/s)',
      slug: 'crucial-t700-2tb-gen5-nvme-ssd',
      brand: 'Crucial',
      sku: 'SSD-CRU-T700-2TB',
      price: 24999,
      comp: 29999,
      stock: 11,
      featured: true,
      desc: 'Blazing next-gen PCIe 5.0 read speeds up to 12,400MB/s and write speeds up to 11,800MB/s with Microsoft DirectStorage optimization.',
      short: 'Blazing Fast PCIe 5.0 SSD with 12,400 MB/s Read Speeds',
      img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=80',
      specs: [
        { k: 'Interface', v: 'PCIe Gen 5.0 x4, NVMe 2.0' },
        { k: 'Sequential Read', v: '12,400 MB/s' },
        { k: 'Sequential Write', v: '11,800 MB/s' },
        { k: 'Form Factor', v: 'M.2 2280' }
      ],
      compData: { type: 'ssd', wattage: 10, storage_interface: 'NVMe PCIe 5.0' }
    },
    {
      cat: catMap['internal-ssds'] || 3,
      name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD with Heatsink',
      slug: 'samsung-990-pro-2tb-heatsink-nvme-ssd',
      brand: 'Samsung',
      sku: 'SSD-SAM-990P-2TB-HS',
      price: 18499,
      comp: 21999,
      stock: 18,
      featured: true,
      desc: 'Ultimate PCIe 4.0 speed with built-in thermal heatsink, perfectly compatible with PS5 and high-end desktop gaming rigs.',
      short: 'Pro Grade 7,450 MB/s Gen4 SSD with Heatsink (PS5 Ready)',
      img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=700&q=80',
      specs: [
        { k: 'Capacity', v: '2TB' },
        { k: 'Interface', v: 'PCIe Gen 4.0 x4, NVMe 2.0' },
        { k: 'Sequential Read', v: '7,450 MB/s' },
        { k: 'Heatsink', v: 'Integrated Low-Profile Aluminum' }
      ],
      compData: { type: 'ssd', wattage: 8, storage_interface: 'NVMe PCIe 4.0' }
    },

    // 5. High Refresh Gaming & OLED Monitors (monitors)
    {
      cat: catMap['monitors'] || 13,
      name: 'LG UltraGear 27GR95QE 27" QHD 240Hz 0.03ms OLED Gaming Monitor',
      slug: 'lg-ultragear-27gr95qe-oled-240hz-monitor',
      brand: 'LG',
      sku: 'MON-LG-27OLED-240',
      price: 69999,
      comp: 79999,
      stock: 7,
      featured: true,
      desc: 'Breathtaking 240Hz OLED gaming monitor with true 0.03ms GtG response time, 1,500,000:1 contrast ratio, and 98.5% DCI-P3 color gamut.',
      short: '27-inch 240Hz 0.03ms QHD OLED Display with G-Sync & FreeSync',
      img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&q=80',
      specs: [
        { k: 'Panel Type', v: 'OLED (Anti-Glare)' },
        { k: 'Resolution', v: 'QHD (2560 x 1440)' },
        { k: 'Refresh Rate', v: '240 Hz' },
        { k: 'Response Time', v: '0.03ms (GtG)' }
      ],
      compData: { type: 'monitor', wattage: 45 }
    },
    {
      cat: catMap['monitors'] || 13,
      name: 'Dell 24" UltraSharp U2424H 120Hz IPS Color-Accurate Office Monitor',
      slug: 'dell-ultrasharp-u2424h-120hz-ips-monitor',
      brand: 'Dell',
      sku: 'MON-DELL-U2424H',
      price: 18999,
      comp: 22499,
      stock: 15,
      featured: false,
      desc: 'Pro-grade 120Hz IPS display with 100% sRGB, 85% DCI-P3, ambient light sensor, and ultra-thin infinity bezel for developers & creators.',
      short: '24-inch 120Hz IPS Display with 100% sRGB & USB-C Hub',
      img: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=700&q=80',
      specs: [
        { k: 'Panel Type', v: 'IPS (ComfortView Plus)' },
        { k: 'Resolution', v: 'Full HD (1920 x 1080)' },
        { k: 'Refresh Rate', v: '120 Hz' },
        { k: 'Color Accuracy', v: 'Delta E < 2' }
      ],
      compData: { type: 'monitor', wattage: 20 }
    },

    // 6. Mechanical Keyboards (keyboards)
    {
      cat: catMap['keyboards'] || 14,
      name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard (Hot-Swap)',
      slug: 'keychron-q1-pro-wireless-custom-keyboard',
      brand: 'Keychron',
      sku: 'KB-KEY-Q1PRO',
      price: 16999,
      comp: 19999,
      stock: 12,
      featured: true,
      desc: 'Full CNC aluminum body, QMK/VIA programmable, Bluetooth 5.1 & Type-C wired, hot-swappable switches, and south-facing RGB.',
      short: 'CNC Aluminum Wireless Hot-Swap Mechanical Keyboard with Rotary Knob',
      img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=80',
      specs: [
        { k: 'Layout', v: '75% Layout (81 Keys + Knob)' },
        { k: 'Switch Type', v: 'Keychron K Pro Red (Lubed)' },
        { k: 'Connectivity', v: 'Bluetooth 5.1 & USB-C' },
        { k: 'Battery', v: '4000 mAh' }
      ],
      compData: { type: 'keyboard', wattage: 2 }
    },
    {
      cat: catMap['keyboards'] || 14,
      name: 'Logitech MX Mechanical Wireless Illuminated Performance Keyboard',
      slug: 'logitech-mx-mechanical-wireless-keyboard',
      brand: 'Logitech',
      sku: 'KB-LOG-MXMECH',
      price: 14499,
      comp: 17999,
      stock: 16,
      featured: false,
      desc: 'Low-profile tactile switches engineered for productivity and quiet typing with smart backlighting and multi-device Easy-Switch.',
      short: 'Low-Profile Tactile Quiet Wireless Keyboard with Multi-Device Pairing',
      img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=80',
      specs: [
        { k: 'Switch Type', v: 'Low Profile Tactile Quiet' },
        { k: 'Battery Life', v: 'Up to 15 days (10 months backlighting off)' },
        { k: 'Compatibility', v: 'Windows, macOS, Linux, ChromeOS' }
      ],
      compData: { type: 'keyboard', wattage: 1 }
    },

    // 7. High-End Laptops (laptops & linux-laptops)
    {
      cat: catMap['laptops'] || 1,
      name: 'Lenovo Legion Pro 7i Gen 9 Gaming Laptop (i9-14900HX / RTX 4080 / 32GB)',
      slug: 'lenovo-legion-pro-7i-gen-9-laptop',
      brand: 'Lenovo',
      sku: 'LAP-LEN-L7I-4080',
      price: 239999,
      comp: 269999,
      stock: 5,
      featured: true,
      desc: 'Flagship AI-tuned gaming laptop with Intel Core i9-14900HX, NVIDIA RTX 4080 12GB (175W TGP), 32GB DDR5-5600MHz RAM, and 16" 240Hz PureSight Gaming display.',
      short: 'Intel Core i9-14900HX, RTX 4080 12GB, 32GB DDR5, 1TB Gen4 SSD, 240Hz QHD',
      img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&q=80',
      specs: [
        { k: 'Processor', v: 'Intel Core i9-14900HX (24 Cores / 32 Threads)' },
        { k: 'Graphics', v: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (175W)' },
        { k: 'Memory', v: '32GB DDR5 5600MHz (2x 16GB)' },
        { k: 'Display', v: '16" WQXGA (2560x1600) 240Hz 500nits 100% DCI-P3' }
      ]
    },
    {
      cat: catMap['linux-laptops'] || 11,
      name: 'TechFix DevBook Ultra 16 (Arch Linux / Fedora Pre-Installed)',
      slug: 'techfix-devbook-ultra-16-linux-laptop',
      brand: 'TechFix',
      sku: 'LAP-TF-DEV16-LINUX',
      price: 89999,
      comp: 99999,
      stock: 8,
      featured: true,
      desc: 'Purpose-built developer laptop engineered for 100% out-of-the-box Linux kernel compatibility, Ryzen 7 8845HS with AI NPU, 32GB RAM, 1TB Gen4 NVMe, and full driver support.',
      short: 'Ryzen 7 8845HS, 32GB DDR5, 1TB NVMe, 2.8K 120Hz OLED, Pre-configured Linux',
      img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&q=80',
      specs: [
        { k: 'Operating System', v: 'Arch Linux or Fedora 40 Workstation (Customer Choice)' },
        { k: 'CPU', v: 'AMD Ryzen 7 8845HS 8-Core with Ryzen AI' },
        { k: 'RAM', v: '32GB LPDDR5X-6400MHz' },
        { k: 'Display', v: '16.0" 2.8K (2880x1800) OLED 120Hz 100% DCI-P3' }
      ]
    },

    // 8. Custom Pre-Built Gaming Rig (pre-built-pcs)
    {
      cat: catMap['pre-built-pcs'] || 5,
      name: 'TechFix Apex Beast Gaming Desktop (Ryzen 7 7800X3D / RTX 4080 Super / 32GB DDR5)',
      slug: 'techfix-apex-beast-rtx4080s-gaming-pc',
      brand: 'TechFix Custom',
      sku: 'PC-TF-APEX-4080S',
      price: 219999,
      comp: 239999,
      stock: 4,
      featured: true,
      desc: 'Pre-assembled, stress-tested, and plug-and-play gaming monster tuned for 4K ray-traced gaming, streaming, and content creation. Includes 3-year doorstep onsite warranty.',
      short: 'Ryzen 7 7800X3D, RTX 4080 Super 16GB, 32GB DDR5 RGB, 2TB Gen4 SSD, 360mm AIO',
      img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=700&q=80',
      specs: [
        { k: 'CPU', v: 'AMD Ryzen 7 7800X3D 8-Core 3D V-Cache' },
        { k: 'GPU', v: 'GeForce RTX 4080 Super 16GB GDDR6X' },
        { k: 'Cooler', v: '360mm ARGB Liquid Cooler' },
        { k: 'RAM', v: '32GB (2x16GB) DDR5 6000MHz CL30 RGB' },
        { k: 'Power Supply', v: '850W 80+ Gold Fully Modular ATX 3.0' }
      ]
    }
  ];

  for (const item of newProducts) {
    try {
      const existing = await db.query('SELECT id FROM products WHERE slug = $1', [item.slug]);
      let prodId;
      if (existing.rowCount > 0) {
        prodId = existing.rows[0].id;
        await db.query(`
          UPDATE products
          SET name = $1, brand = $2, sku = $3, price = $4, compare_at_price = $5,
              stock_quantity = $6, description = $7, short_description = $8,
              image_url = $9, featured = $10, active = true
          WHERE id = $11
        `, [
          item.name, item.brand, item.sku, item.price, item.comp,
          item.stock, item.desc, item.short, item.img, item.featured, prodId
        ]);
        console.log(`Updated product: ${item.name}`);
      } else {
        const ins = await db.query(`
          INSERT INTO products (
            category_id, name, slug, brand, sku, description, short_description,
            price, compare_at_price, stock_quantity, image_url, featured, active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
          RETURNING id
        `, [
          item.cat, item.name, item.slug, item.brand, item.sku, item.desc,
          item.short, item.price, item.comp, item.stock, item.img, item.featured
        ]);
        prodId = ins.rows[0].id;
        console.log(`+ Inserted new product: ${item.name}`);
      }

      // Specs
      if (item.specs && item.specs.length > 0) {
        await db.query('DELETE FROM product_specs WHERE product_id = $1', [prodId]);
        for (const s of item.specs) {
          await db.query('INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES ($1, $2, $3)', [prodId, s.k, s.v]);
        }
      }

      // Component linkage for PC builder
      if (item.compData) {
        const cd = item.compData;
        const compExist = await db.query('SELECT id FROM components WHERE product_id = $1', [prodId]);
        if (compExist.rowCount > 0) {
          await db.query(`
            UPDATE components
            SET component_type = $1, socket = $2, ram_type = $3, form_factor = $4,
                wattage = $5, gpu_length = $6, storage_interface = $7, m2_slots = $8, active = true
            WHERE product_id = $9
          `, [
            cd.type, cd.socket || null, cd.ram_type || null, cd.form_factor || null,
            cd.wattage || 0, cd.gpu_length || 0, cd.storage_interface || null, cd.m2_slots || 0, prodId
          ]);
        } else {
          await db.query(`
            INSERT INTO components (
              product_id, component_type, socket, ram_type, form_factor, wattage, gpu_length, storage_interface, m2_slots, active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
          `, [
            prodId, cd.type, cd.socket || null, cd.ram_type || null, cd.form_factor || null,
            cd.wattage || 0, cd.gpu_length || 0, cd.storage_interface || null, cd.m2_slots || 0
          ]);
        }
      }
    } catch (err) {
      console.error(`Error processing product ${item.name}:`, err.message);
    }
  }

  // Seed helpful initial verified customer reviews
  const reviewData = [
    {
      slug: 'nvidia-geforce-rtx-4070-super-12gb-gpu',
      author: 'Rohit Sharma',
      rating: 5,
      review: 'Runs Cyberpunk 2077 with Path Tracing at 1440p easily over 90 FPS with DLSS 3.5. Temperatures stay below 64°C in Mumbai summer!'
    },
    {
      slug: 'amd-ryzen-7-7800x3d-processor',
      author: 'Vikram Joshi',
      rating: 5,
      review: 'Fastest gaming CPU I have ever owned. 1% lows in Valorant and Warzone are insanely smooth. Works flawlessly with my AM5 DDR5 motherboard.'
    },
    {
      slug: 'lg-ultragear-27gr95qe-oled-240hz-monitor',
      author: 'Sameer Sen',
      rating: 5,
      review: 'Once you experience 240Hz on an OLED panel with instantaneous 0.03ms response, there is no going back. Blacks are pitch black.'
    },
    {
      slug: 'crucial-t700-2tb-gen5-nvme-ssd',
      author: 'Aditya Mehta',
      rating: 5,
      review: 'Benchmark clocked 12,350 MB/s sequential read speed on my PCIe 5.0 slot! Massive 4K video exports finish in seconds.'
    },
    {
      slug: 'techfix-devbook-ultra-16-linux-laptop',
      author: 'Kunal Verma',
      rating: 5,
      review: 'Received with pre-configured Fedora 40. Wi-Fi, audio, Bluetooth, and GPU hardware acceleration worked out of the box without any kernel tweaks!'
    }
  ];

  for (const r of reviewData) {
    try {
      const p = await db.query('SELECT id FROM products WHERE slug = $1', [r.slug]);
      if (p.rowCount > 0) {
        const prodId = p.rows[0].id;
        const revExist = await db.query('SELECT id FROM product_reviews WHERE product_id = $1 AND author_name = $2', [prodId, r.author]);
        if (revExist.rowCount === 0) {
          await db.query(`
            INSERT INTO product_reviews (product_id, author_name, rating, review, approved)
            VALUES ($1, $2, $3, $4, true)
          `, [prodId, r.author, r.rating, r.review]);
        }
      }
    } catch (e) {
      console.error('Review seed error:', e.message);
    }
  }

  console.log('--- MASSIVE EXPANDED SEED COMPLETE ---');
  process.exit(0);
}

seedMassiveProducts().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
