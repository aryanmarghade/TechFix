const { Client } = require('pg');
require('dotenv').config();

async function seedMassiveCatalog() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'aryan',
    database: 'techfix_db'
  });

  await client.connect();
  console.log('Connected to PostgreSQL for massive catalog & PC builder expansion...');

  // 1. Ensure all 16 categories exist with correct slugs and labels
  const categories = [
    { id: 1, name: 'Laptops', slug: 'laptops', desc: 'Laptops for students, programmers, creators & gamers.', icon: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', sort: 1 },
    { id: 2, name: 'Pre-Built PCs', slug: 'pre-built-pcs', desc: 'Assembled, tuned & stress-tested desktop systems.', icon: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80', sort: 2 },
    { id: 3, name: 'Pen Drives', slug: 'pen-drives', desc: 'High-speed USB 3.2 flash drives and OTG storage.', icon: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=600&auto=format&fit=crop&q=80', sort: 3 },
    { id: 4, name: 'Internal SSDs', slug: 'internal-ssds', desc: 'SATA and NVMe PCIe 4.0 / 5.0 solid state drives.', icon: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80', sort: 4 },
    { id: 5, name: 'External SSDs', slug: 'external-ssds', desc: 'Portable rugged external solid state drives with USB-C.', icon: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80', sort: 5 },
    { id: 6, name: 'OS Pen Drives', slug: 'os-pen-drives', desc: 'Bootable installer USB flash media for clean OS setup.', icon: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80', sort: 6 },
    { id: 7, name: 'PC Components', slug: 'components', desc: 'Individual PC hardware for builders and upgrades.', icon: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80', sort: 7 },
    { id: 8, name: 'Linux Laptops', slug: 'linux-laptops', desc: 'Laptops with pre-installed Ubuntu, Fedora, Debian & Linux Mint.', icon: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80', sort: 8 },
    { id: 9, name: 'Linux Pen Drives', slug: 'linux-pen-drives', desc: 'Bootable live USB media for GNU/Linux distributions.', icon: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80', sort: 9 },
    { id: 10, name: 'Gaming Mice', slug: 'gaming-mice', desc: 'High-DPI optical sensor RGB gaming mice.', icon: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', sort: 10 },
    { id: 11, name: 'Normal / Office Mice', slug: 'normal-mice', desc: 'Ergonomic silent-click wireless and wired office mice.', icon: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', sort: 11 },
    { id: 12, name: 'Keyboards', slug: 'keyboards', desc: 'Mechanical, wireless, and spill-resistant office keyboards.', icon: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', sort: 12 },
    { id: 13, name: 'Gaming Chairs', slug: 'gaming-chairs', desc: 'High-resilience foam gaming chairs with lumbar support.', icon: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&auto=format&fit=crop&q=80', sort: 13 },
    { id: 14, name: 'Office Chairs', slug: 'office-chairs', desc: 'Breathable ergonomic mesh executive chairs.', icon: 'https://images.unsplash.com/photo-1580481077197-25e2e88a38db?w=600&auto=format&fit=crop&q=80', sort: 14 },
    { id: 15, name: 'Mouse Pads', slug: 'mouse-pads', desc: 'Extended desk mats and micro-woven mouse pads.', icon: 'https://images.unsplash.com/photo-1616763355548-1b606f43848c?w=600&auto=format&fit=crop&q=80', sort: 15 },
    { id: 16, name: 'Monitors', slug: 'monitors', desc: 'High refresh rate Fast IPS gaming & productivity monitors.', icon: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', sort: 16 }
  ];

  for (const c of categories) {
    await client.query(
      `INSERT INTO categories (id, name, slug, description, image_url, sort_order, active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url`,
      [c.id, c.name, c.slug, c.desc, c.icon, c.sort]
    );
  }
  console.log('Categories synced (16 categories verified)');

  // 2. Helper to insert product safely
  async function addProduct(p) {
    const existing = await client.query('SELECT id FROM products WHERE slug = $1 OR sku = $2', [p.slug, p.sku]);
    if (existing.rowCount > 0) {
      const pId = existing.rows[0].id;
      await client.query(
        `UPDATE products SET 
           category_id = $1, name = $2, brand = $3, price = $4, compare_at_price = $5,
           stock_quantity = $6, short_description = $7, description = $8, image_url = $9, featured = $10,
           active = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11`,
        [p.category_id, p.name, p.brand, p.price, p.compare_at_price, p.stock_quantity, p.short_description, p.description, p.image_url, p.featured || false, pId]
      );
      return pId;
    }

    const res = await client.query(
      `INSERT INTO products (category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
       RETURNING id`,
      [p.category_id, p.name, p.slug, p.brand, p.sku, p.description, p.short_description, p.price, p.compare_at_price, p.stock_quantity, p.image_url, p.featured || false]
    );
    return res.rows[0].id;
  }

  // 3. Helper to insert component safely
  async function addComponent(productId, comp) {
    await client.query(
      `INSERT INTO components (product_id, component_type, socket, ram_type, form_factor, wattage, gpu_length, cooler_height, storage_interface, m2_slots, power_connectors, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
       ON CONFLICT DO NOTHING`,
      [productId, comp.type, comp.socket || null, comp.ram_type || null, comp.form_factor || null, comp.wattage || 0, comp.gpu_length || 0, comp.cooler_height || 0, comp.storage_interface || null, comp.m2_slots || 0, comp.power_connectors || null]
    );
  }

  console.log('Inserting expanded Products and Components catalog...');

  // ==========================================
  // A. CPUS (Components & Catalog)
  // ==========================================
  const cpus = [
    { name: 'Intel Core i3-12100 Quad-Core Processor', slug: 'intel-core-i3-12100-cpu', brand: 'Intel', sku: 'CPU-INT-12100', price: 8499, comp: 10499, stock: 20, socket: 'LGA1700', watt: 60, desc: '4 Cores, 8 Threads, up to 4.3GHz with Intel UHD 730 Graphics. Socket LGA1700.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Intel Core i5-12400F 6-Core Gaming Processor', slug: 'intel-core-i5-12400f-cpu', brand: 'Intel', sku: 'CPU-INT-12400F', price: 11499, comp: 14999, stock: 25, socket: 'LGA1700', watt: 65, desc: '6 Cores, 12 Threads, up to 4.4GHz. Incredible budget esports gaming CPU. Socket LGA1700.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Intel Core i5-13400 10-Core Processor', slug: 'intel-core-i5-13400-cpu', brand: 'Intel', sku: 'CPU-INT-13400', price: 18499, comp: 21999, stock: 18, socket: 'LGA1700', watt: 65, desc: '10 Cores (6P + 4E), 16 Threads, up to 4.6GHz with Intel UHD 730. Socket LGA1700.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Intel Core i5-14600K 14-Core Unlocked Processor', slug: 'intel-core-i5-14600k-cpu', brand: 'Intel', sku: 'CPU-INT-14600K', price: 27999, comp: 31999, stock: 15, socket: 'LGA1700', watt: 125, desc: '14 Cores (6P + 8E), 20 Threads, up to 5.3GHz Unlocked. High FPS gaming & productivity. LGA1700.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Intel Core i7-13700 16-Core Processor', slug: 'intel-core-i7-13700-cpu', brand: 'Intel', sku: 'CPU-INT-13700', price: 32999, comp: 37999, stock: 12, socket: 'LGA1700', watt: 65, desc: '16 Cores (8P + 8E), 24 Threads, up to 5.2GHz. Excellent for rendering and heavy multitasking. LGA1700.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Intel Core i7-14700K 20-Core Unlocked Processor', slug: 'intel-core-i7-14700k-cpu', brand: 'Intel', sku: 'CPU-INT-14700K', price: 37999, comp: 42999, stock: 14, socket: 'LGA1700', watt: 125, desc: '20 Cores (8P + 12E), 28 Threads, up to 5.6GHz. Supreme 4K gaming & creative workstation power. LGA1700.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Intel Core i9-14900K 24-Core Flagship Processor', slug: 'intel-core-i9-14900k-cpu', brand: 'Intel', sku: 'CPU-INT-14900K', price: 52999, comp: 59999, stock: 8, socket: 'LGA1700', watt: 125, desc: '24 Cores (8P + 16E), 32 Threads, up to 6.0GHz Thermal Velocity Boost. The ultimate desktop CPU. LGA1700.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    
    // AMD AM4
    { name: 'AMD Ryzen 5 4600G 6-Core APU with Radeon Graphics', slug: 'amd-ryzen-5-4600g-apu', brand: 'AMD', sku: 'CPU-AMD-4600G', price: 8999, comp: 11499, stock: 25, socket: 'AM4', watt: 65, desc: '6 Cores, 12 Threads with built-in Radeon Vega 7 Graphics. Perfect budget PC without GPU. Socket AM4.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'AMD Ryzen 5 5600 6-Core Gaming Processor', slug: 'amd-ryzen-5-5600-cpu', brand: 'AMD', sku: 'CPU-AMD-5600', price: 11999, comp: 14499, stock: 30, socket: 'AM4', watt: 65, desc: '6 Cores, 12 Threads, 35MB Cache, PCIe 4.0 support. Incredible AM4 gaming value. Socket AM4.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'AMD Ryzen 7 5700X 8-Core Processor', slug: 'amd-ryzen-7-5700x-cpu', brand: 'AMD', sku: 'CPU-AMD-5700X', price: 16999, comp: 20999, stock: 15, socket: 'AM4', watt: 65, desc: '8 Cores, 16 Threads, up to 4.6GHz. High core count workstation on affordable AM4. Socket AM4.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'AMD Ryzen 7 5800X3D 8-Core 3D V-Cache Processor', slug: 'amd-ryzen-7-5800x3d-cpu', brand: 'AMD', sku: 'CPU-AMD-5800X3D', price: 26999, comp: 31999, stock: 10, socket: 'AM4', watt: 105, desc: '8 Cores, 16 Threads with 96MB 3D V-Cache. Peak AM4 gaming performance. Socket AM4.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },

    // AMD AM5
    { name: 'AMD Ryzen 5 7600 6-Core AM5 Processor', slug: 'amd-ryzen-5-7600-cpu', brand: 'AMD', sku: 'CPU-AMD-7600', price: 18499, comp: 21999, stock: 20, socket: 'AM5', watt: 65, desc: '6 Cores, 12 Threads, up to 5.1GHz with RDNA 2 Graphics. Next-gen DDR5 gaming. Socket AM5.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'AMD Ryzen 7 7700X 8-Core AM5 Processor', slug: 'amd-ryzen-7-7700x-cpu', brand: 'AMD', sku: 'CPU-AMD-7700X', price: 28999, comp: 33999, stock: 15, socket: 'AM5', watt: 105, desc: '8 Cores, 16 Threads, up to 5.4GHz. High-speed Zen 4 architecture for coding & gaming. Socket AM5.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'AMD Ryzen 7 7800X3D 8-Core Gaming King Processor', slug: 'amd-ryzen-7-7800x3d-cpu', brand: 'AMD', sku: 'CPU-AMD-7800X3D', price: 38999, comp: 43999, stock: 12, socket: 'AM5', watt: 120, desc: '8 Cores, 16 Threads with 104MB 3D V-Cache. The world’s top rated esports & AAA gaming processor. Socket AM5.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'AMD Ryzen 9 7950X 16-Core 32-Thread AM5 Processor', slug: 'amd-ryzen-9-7950x-cpu', brand: 'AMD', sku: 'CPU-AMD-7950X', price: 51999, comp: 58999, stock: 8, socket: 'AM5', watt: 170, desc: '16 Cores, 32 Threads, up to 5.7GHz. Heavy-duty 3D rendering and compilation titan. Socket AM5.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const c of cpus) {
    const pId = await addProduct({
      category_id: 7,
      name: c.name,
      slug: c.slug,
      brand: c.brand,
      sku: c.sku,
      price: c.price,
      compare_at_price: c.comp,
      stock_quantity: c.stock,
      short_description: `${c.socket} Socket | ${c.watt}W TDP | ${c.desc.split('.')[0]}`,
      description: c.desc,
      image_url: c.img,
      featured: true
    });
    await addComponent(pId, { type: 'cpu', socket: c.socket, wattage: c.watt });
  }

  // ==========================================
  // B. MOTHERBOARDS (Intel LGA1700, AMD AM4, AMD AM5)
  // ==========================================
  const motherboards = [
    // Intel LGA1700 DDR4
    { name: 'ASUS Prime H610M-E D4 Motherboard (LGA1700, DDR4)', slug: 'asus-prime-h610m-e-d4-motherboard', brand: 'ASUS', sku: 'MB-ASUS-H610D4', price: 6499, comp: 7999, stock: 20, socket: 'LGA1700', ram_type: 'DDR4', ff: 'Micro-ATX', m2: 2, desc: 'Intel LGA1700 socket, 2x DDR4 slots, 2x M.2 NVMe slots, PCIe 4.0 x16, Realtek 1Gb LAN.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'MSI PRO B760M-P DDR4 Motherboard (LGA1700, DDR4)', slug: 'msi-pro-b760m-p-ddr4-motherboard', brand: 'MSI', sku: 'MB-MSI-B760D4', price: 9999, comp: 11999, stock: 18, socket: 'LGA1700', ram_type: 'DDR4', ff: 'Micro-ATX', m2: 2, desc: 'Intel B760 chipset, 4x DDR4 slots up to 128GB, dual PCIe 4.0 M.2 slots, HDMI + DP outputs.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Gigabyte B760 DS3H DDR4 ATX Motherboard (LGA1700, DDR4)', slug: 'gigabyte-b760-ds3h-ddr4-motherboard', brand: 'Gigabyte', sku: 'MB-GB-B760D4', price: 12499, comp: 14499, stock: 14, socket: 'LGA1700', ram_type: 'DDR4', ff: 'ATX', m2: 2, desc: 'Full ATX motherboard, 4x DDR4, 2x Gen4 M.2, 2.5GbE LAN, RGB Fusion 2.0.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    
    // Intel LGA1700 DDR5
    { name: 'ASUS TUF Gaming B760-PLUS Wi-Fi DDR5 Motherboard', slug: 'asus-tuf-gaming-b760-plus-wifi-ddr5', brand: 'ASUS', sku: 'MB-ASUS-B760D5', price: 17499, comp: 19999, stock: 15, socket: 'LGA1700', ram_type: 'DDR5', ff: 'ATX', m2: 3, desc: 'Intel B760 ATX, 4x DDR5 slots up to 7200MHz+, Wi-Fi 6E, 3x Gen4 M.2 slots, 12+1 DrMOS power stages.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'MSI MAG Z790 TOMAHAWK WIFI DDR5 Motherboard', slug: 'msi-mag-z790-tomahawk-wifi-ddr5', brand: 'MSI', sku: 'MB-MSI-Z790D5', price: 26999, comp: 30999, stock: 10, socket: 'LGA1700', ram_type: 'DDR5', ff: 'ATX', m2: 4, desc: 'Intel Z790 flagship, 4x DDR5, 4x M.2 Gen4 with Shield Frozr, Wi-Fi 6E, 16+1+1 Duet Rail VRM.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },

    // AMD AM4 DDR4
    { name: 'Gigabyte A520M K V2 Ultra Durable AM4 Motherboard', slug: 'gigabyte-a520m-k-v2-am4-motherboard', brand: 'Gigabyte', sku: 'MB-GB-A520M', price: 4799, comp: 5999, stock: 25, socket: 'AM4', ram_type: 'DDR4', ff: 'Micro-ATX', m2: 1, desc: 'AMD AM4 socket, 2x DDR4 slots up to 64GB, 1x PCIe 3.0 NVMe slot, Realtek GbE LAN.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'MSI B450M PRO-VDH MAX AM4 Motherboard', slug: 'msi-b450m-pro-vdh-max-am4', brand: 'MSI', sku: 'MB-MSI-B450M', price: 5699, comp: 6999, stock: 20, socket: 'AM4', ram_type: 'DDR4', ff: 'Micro-ATX', m2: 1, desc: 'AMD B450 chipset, 4x DDR4 slots, Turbo M.2, Audio Boost, Core Boost for Ryzen 3000/4000/5000.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'ASUS TUF Gaming B550-PLUS Wi-Fi II AM4 ATX Motherboard', slug: 'asus-tuf-gaming-b550-plus-wifi-ii', brand: 'ASUS', sku: 'MB-ASUS-B550W', price: 13999, comp: 16499, stock: 16, socket: 'AM4', ram_type: 'DDR4', ff: 'ATX', m2: 2, desc: 'AMD B550 ATX, PCIe 4.0 support, Wi-Fi 6, 2x M.2 slots, 2.5Gb LAN, 8+2 DrMOS VRM stages.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },

    // AMD AM5 DDR5
    { name: 'MSI PRO A620M-E DDR5 AM5 Motherboard', slug: 'msi-pro-a620m-e-ddr5-am5', brand: 'MSI', sku: 'MB-MSI-A620M', price: 7999, comp: 9499, stock: 22, socket: 'AM5', ram_type: 'DDR5', ff: 'Micro-ATX', m2: 1, desc: 'Entry AM5 socket, 2x DDR5 slots up to 6400+MHz OC, PCIe 4.0 x16 steel armor, 1x Gen4 M.2.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'ASUS Prime B650M-A Wi-Fi II DDR5 AM5 Motherboard', slug: 'asus-prime-b650m-a-wifi-ii-ddr5', brand: 'ASUS', sku: 'MB-ASUS-B650M', price: 14499, comp: 16999, stock: 18, socket: 'AM5', ram_type: 'DDR5', ff: 'Micro-ATX', m2: 2, desc: 'AMD B650 chipset, 4x DDR5 slots up to 128GB, Wi-Fi 6, 2x M.2 PCIe 5.0/4.0 slots, 2.5Gb LAN.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Gigabyte B650 AORUS ELITE AX AM5 ATX Motherboard', slug: 'gigabyte-b650-aorus-elite-ax-am5', brand: 'Gigabyte', sku: 'MB-GB-B650AX', price: 21999, comp: 24999, stock: 12, socket: 'AM5', ram_type: 'DDR5', ff: 'ATX', m2: 3, desc: 'Full ATX AM5 board, 14+2+1 twin digital VRM, 3x M.2 slots (1x Gen5), Wi-Fi 6E, EZ-Latch.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const m of motherboards) {
    const pId = await addProduct({
      category_id: 7,
      name: m.name,
      slug: m.slug,
      brand: m.brand,
      sku: m.sku,
      price: m.price,
      compare_at_price: m.comp,
      stock_quantity: m.stock,
      short_description: `${m.socket} | ${m.ram_type} Support | ${m.ff} Form Factor | ${m.m2}x M.2 NVMe`,
      description: m.desc,
      image_url: m.img,
      featured: true
    });
    await addComponent(pId, { type: 'motherboard', socket: m.socket, ram_type: m.ram_type, form_factor: m.ff, m2_slots: m.m2, wattage: 25 });
  }

  // ==========================================
  // C. RAM MODULES (DDR4 & DDR5)
  // ==========================================
  const rams = [
    // DDR4
    { name: 'Crucial 8GB DDR4 3200MHz Desktop RAM', slug: 'crucial-8gb-ddr4-3200mhz-ram', brand: 'Crucial', sku: 'RAM-CRU-8D4', price: 1499, comp: 1999, stock: 40, ram_type: 'DDR4', desc: '8GB DDR4 3200MHz CL22 1.2V desktop memory module for standard desktops.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz RAM Kit', slug: 'corsair-vengeance-lpx-16gb-ddr4-3200', brand: 'Corsair', sku: 'RAM-COR-16D4', price: 3499, comp: 4299, stock: 35, ram_type: 'DDR4', desc: '16GB (2x8GB) Dual Channel DDR4 3200MHz CL16 with pure aluminum heat spreader.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'G.Skill Ripjaws V 16GB DDR4 3600MHz High-Speed RAM', slug: 'gskill-ripjaws-v-16gb-ddr4-3600', brand: 'G.Skill', sku: 'RAM-GSK-16D4', price: 3899, comp: 4699, stock: 25, ram_type: 'DDR4', desc: '16GB DDR4 3600MHz CL18 high performance memory for AMD Ryzen and Intel builds.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz Kit', slug: 'corsair-vengeance-32gb-ddr4-3200', brand: 'Corsair', sku: 'RAM-COR-32D4', price: 6499, comp: 7999, stock: 20, ram_type: 'DDR4', desc: '32GB Dual Channel kit for heavy video editing, CAD, and virtual machines on DDR4 platforms.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },

    // DDR5
    { name: 'Crucial 16GB DDR5 4800MHz Desktop RAM', slug: 'crucial-16gb-ddr5-4800mhz-ram', brand: 'Crucial', sku: 'RAM-CRU-16D5', price: 3999, comp: 4999, stock: 30, ram_type: 'DDR5', desc: '16GB DDR5 4800MHz CL40 with on-die ECC and dual 32-bit subchannels.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair Vengeance 16GB DDR5 5200MHz RAM', slug: 'corsair-vengeance-16gb-ddr5-5200', brand: 'Corsair', sku: 'RAM-COR-16D5', price: 4699, comp: 5699, stock: 25, ram_type: 'DDR5', desc: '16GB DDR5 5200MHz with Intel XMP 3.0 and AMD EXPO profile support.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'G.Skill Flare X5 32GB (2x16GB) DDR5 6000MHz AMD EXPO Kit', slug: 'gskill-flare-x5-32gb-ddr5-6000-expo', brand: 'G.Skill', sku: 'RAM-GSK-32D5', price: 9499, comp: 11499, stock: 20, ram_type: 'DDR5', desc: '32GB (2x16GB) DDR5 6000MHz CL30 tuned specifically for AMD AM5 Ryzen 7000/8000/9000.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6600MHz', slug: 'corsair-dominator-titanium-32gb-ddr5-6600', brand: 'Corsair', sku: 'RAM-COR-DOM32', price: 14999, comp: 17999, stock: 12, ram_type: 'DDR5', desc: 'Premium luxury forged aluminum heat spreaders with 11 ultra-bright CAPELLIX RGB LEDs.', img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const r of rams) {
    const pId = await addProduct({
      category_id: 7,
      name: r.name,
      slug: r.slug,
      brand: r.brand,
      sku: r.sku,
      price: r.price,
      compare_at_price: r.comp,
      stock_quantity: r.stock,
      short_description: `${r.ram_type} Generation | ${r.desc.split('.')[0]}`,
      description: r.desc,
      image_url: r.img,
      featured: true
    });
    await addComponent(pId, { type: 'ram', ram_type: r.ram_type, wattage: 10 });
  }

  // ==========================================
  // D. GRAPHICS CARDS / GPUS
  // ==========================================
  const gpus = [
    { name: 'Zotac Gaming GeForce GTX 1650 4GB GDDR6', slug: 'zotac-gtx-1650-4gb-gddr6-gpu', brand: 'Zotac', sku: 'GPU-ZOT-1650', price: 11999, comp: 14499, stock: 15, length: 151, watt: 75, rec_psu: 350, desc: 'Compact dual-slot GTX 1650 4GB. No external 6-pin power cable needed. 151mm compact length.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'MSI GeForce RTX 3050 Ventus 2X 6GB GDDR6', slug: 'msi-rtx-3050-ventus-2x-6gb', brand: 'MSI', sku: 'GPU-MSI-3050', price: 16999, comp: 19999, stock: 18, length: 205, watt: 115, rec_psu: 450, desc: '6GB GDDR6 Ray Tracing and DLSS support with dual TORX Fan 3.0 cooling. 205mm length.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'ASUS Dual Radeon RX 6600 8GB GDDR6 Graphics Card', slug: 'asus-dual-radeon-rx-6600-8gb', brand: 'ASUS', sku: 'GPU-ASUS-6600', price: 19999, comp: 23999, stock: 16, length: 243, watt: 132, rec_psu: 450, desc: '8GB GDDR6, 1080p Ultra gaming beast with AMD FSR 3.0 Frame Generation support. 243mm length.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Gigabyte GeForce RTX 4060 WINDFORCE OC 8GB GDDR6', slug: 'gigabyte-rtx-4060-windforce-oc-8gb', brand: 'Gigabyte', sku: 'GPU-GB-4060', price: 28499, comp: 32999, stock: 20, length: 242, watt: 115, rec_psu: 450, desc: 'Ada Lovelace architecture, DLSS 3 Frame Generation, 8GB GDDR6, 2x 80mm unique blade fans.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Zotac Gaming GeForce RTX 4060 Ti Twin Edge 8GB', slug: 'zotac-rtx-4060-ti-twin-edge-8gb', brand: 'Zotac', sku: 'GPU-ZOT-4060TI', price: 36999, comp: 41999, stock: 12, length: 225, watt: 160, rec_psu: 500, desc: '8GB GDDR6 with IceStorm 2.0 advanced cooling for high FPS 1080p & 1440p esports. 225mm length.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Sapphire Pulse Radeon RX 7700 XT 12GB GDDR6', slug: 'sapphire-pulse-rx-7700-xt-12gb', brand: 'Sapphire', sku: 'GPU-SAP-7700XT', price: 42999, comp: 48999, stock: 10, length: 280, watt: 245, rec_psu: 650, desc: '12GB high-speed GDDR6 on 192-bit bus. Supreme 1440p AAA gaming with Dual-X cooling. 280mm length.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'ASUS TUF Gaming GeForce RTX 4070 Super 12GB OC', slug: 'asus-tuf-rtx-4070-super-12gb-oc', brand: 'ASUS', sku: 'GPU-ASUS-4070S', price: 62999, comp: 69999, stock: 8, length: 301, watt: 220, rec_psu: 650, desc: '12GB GDDR6X, Axial-tech fans, military-grade capacitors, DLSS 3.5 Ray Reconstruction. 301mm length.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'MSI GeForce RTX 4080 Super 16GB GAMING X SLIM', slug: 'msi-rtx-4080-super-16gb-gaming-slim', brand: 'MSI', sku: 'GPU-MSI-4080S', price: 104999, comp: 119999, stock: 5, length: 322, watt: 320, rec_psu: 750, desc: '16GB GDDR6X 256-bit monster for 4K Max Settings Ray Tracing with TRI FROZR 3. 322mm length.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const g of gpus) {
    const pId = await addProduct({
      category_id: 7,
      name: g.name,
      slug: g.slug,
      brand: g.brand,
      sku: g.sku,
      price: g.price,
      compare_at_price: g.comp,
      stock_quantity: g.stock,
      short_description: `${g.watt}W Power Draw | ${g.length}mm Length | Rec PSU: ${g.rec_psu}W+`,
      description: g.desc,
      image_url: g.img,
      featured: true
    });
    await addComponent(pId, { type: 'gpu', wattage: g.watt, gpu_length: g.length });
  }

  // ==========================================
  // E. POWER SUPPLIES (PSUS)
  // ==========================================
  const psus = [
    { name: 'Ant Esports VS450L 450W Non-Modular Power Supply', slug: 'ant-esports-vs450l-450w-psu', brand: 'Ant Esports', sku: 'PSU-ANT-450W', price: 1899, comp: 2499, stock: 35, watt: 450, desc: '450W Continuous power with 120mm silent fan and black flat cables.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair CV550 550W 80 PLUS Bronze Power Supply', slug: 'corsair-cv550-550w-80-bronze-psu', brand: 'Corsair', sku: 'PSU-COR-550W', price: 3799, comp: 4499, stock: 30, watt: 550, desc: '550W 80 PLUS Bronze certified efficiency, 120mm thermally controlled low-noise cooling fan.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Deepcool PK650D 650W 80 PLUS Bronze Power Supply', slug: 'deepcool-pk650d-650w-bronze-psu', brand: 'Deepcool', sku: 'PSU-DEP-650W', price: 4499, comp: 5299, stock: 25, watt: 650, desc: '650W 80 Plus Bronze efficiency with reliable DC-DC design and flat black ribbon cables.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Cooler Master MWE 750 V2 750W 80 PLUS Bronze PSU', slug: 'cooler-master-mwe-750-v2-bronze', brand: 'Cooler Master', sku: 'PSU-CM-750W', price: 6299, comp: 7499, stock: 20, watt: 750, desc: '750W 80 PLUS Bronze with 2x EPS connectors, HDB fan, and DC-to-DC circuit topology.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair RM750e 750W 80 PLUS Gold Fully Modular ATX 3.0 PSU', slug: 'corsair-rm750e-750w-gold-modular', brand: 'Corsair', sku: 'PSU-COR-750G', price: 9299, comp: 10999, stock: 15, watt: 750, desc: '750W 80 PLUS Gold certified, Cybenetics Platinum noise level, native PCIe 5.0 12VHPWR cable.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'MSI MAG A850GL PCIE5 850W 80 PLUS Gold Modular PSU', slug: 'msi-mag-a850gl-850w-gold-pcie5', brand: 'MSI', sku: 'PSU-MSI-850G', price: 10999, comp: 12999, stock: 14, watt: 850, desc: '850W ATX 3.0 & PCIe 5.0 ready, full modular, 80 PLUS Gold, dual-color 16-pin connector.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair RM1000x 1000W 80 PLUS Gold Fully Modular Power Supply', slug: 'corsair-rm1000x-1000w-gold-modular', brand: 'Corsair', sku: 'PSU-COR-1000G', price: 15999, comp: 18999, stock: 10, watt: 1000, desc: '1000W 80 PLUS Gold, 100% Japanese 105°C capacitors, Zero RPM fan mode for ultra-quiet operation.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const p of psus) {
    const pId = await addProduct({
      category_id: 7,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      sku: p.sku,
      price: p.price,
      compare_at_price: p.comp,
      stock_quantity: p.stock,
      short_description: `${p.watt}W Continuous Output | ${p.desc.split(',')[0]}`,
      description: p.desc,
      image_url: p.img,
      featured: true
    });
    await addComponent(pId, { type: 'psu', wattage: p.watt });
  }

  // ==========================================
  // F. CABINETS / CHASSIS
  // ==========================================
  const cabinets = [
    { name: 'Ant Esports ICE-110 Mid Tower Gaming Cabinet', slug: 'ant-esports-ice-110-mid-tower', brand: 'Ant Esports', sku: 'CAB-ANT-110', price: 2999, comp: 3799, stock: 25, ff: 'ATX,Micro-ATX,Mini-ITX', gpu_len: 310, cool_ht: 155, desc: 'Transparent acrylic side panel, mesh front panel with 3x 120mm auto-RGB front fans pre-installed.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Deepcool Matrexx 40 3FS Micro-ATX Cabinet', slug: 'deepcool-matrexx-40-3fs-matx', brand: 'Deepcool', sku: 'CAB-DEP-M40', price: 3499, comp: 4299, stock: 20, ff: 'Micro-ATX,Mini-ITX', gpu_len: 320, cool_ht: 165, desc: 'Compact Micro-ATX chassis with high airflow front mesh, tempered glass side and 3x tri-color LED fans.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Montech AIR 100 ARGB Micro-ATX Mini Tower', slug: 'montech-air-100-argb-matx', brand: 'Montech', sku: 'CAB-MON-A100', price: 4499, comp: 5499, stock: 18, ff: 'Micro-ATX,Mini-ITX', gpu_len: 330, cool_ht: 161, desc: 'Tool-free swivel tempered glass side door, 4x 120mm addressable RGB fans with dedicated LED controller.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Lian Li Lancool 216 ARGB High-Airflow Mid Tower', slug: 'lian-li-lancool-216-argb-cabinet', brand: 'Lian Li', sku: 'CAB-LIAN-216', price: 7999, comp: 9499, stock: 15, ff: 'ATX,Micro-ATX,Mini-ITX', gpu_len: 392, cool_ht: 180, desc: 'High airflow all-around mesh, 2x 160mm massive front ARGB PWM fans, 1x 140mm rear fan. Supports 360mm radiators.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'NZXT H5 Flow Compact ATX Mid-Tower Cabinet', slug: 'nzxt-h5-flow-compact-atx', brand: 'NZXT', sku: 'CAB-NZXT-H5', price: 7499, comp: 8999, stock: 14, ff: 'ATX,Micro-ATX,Mini-ITX', gpu_len: 365, cool_ht: 165, desc: 'Dedicated bottom GPU fan angle duct, perforated PSU shroud, tempered glass panel and clean cable routing channels.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Corsair 4000D Airflow Tempered Glass Mid-Tower', slug: 'corsair-4000d-airflow-tempered-glass', brand: 'Corsair', sku: 'CAB-COR-4000D', price: 6999, comp: 8499, stock: 18, ff: 'ATX,Micro-ATX,Mini-ITX', gpu_len: 360, cool_ht: 170, desc: 'Optimized high-airflow front steel grill, Corsair RapidRoute cable management system, 2x 120mm AirGuide fans.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const cb of cabinets) {
    const pId = await addProduct({
      category_id: 7,
      name: cb.name,
      slug: cb.slug,
      brand: cb.brand,
      sku: cb.sku,
      price: cb.price,
      compare_at_price: cb.comp,
      stock_quantity: cb.stock,
      short_description: `Supports: ${cb.ff} | Max GPU: ${cb.gpu_len}mm | Max Cooler: ${cb.cool_ht}mm`,
      description: cb.desc,
      image_url: cb.img,
      featured: true
    });
    await addComponent(pId, { type: 'cabinet', form_factor: cb.ff, gpu_length: cb.gpu_len, cooler_height: cb.cool_ht });
  }

  // ==========================================
  // G. CPU COOLERS (Air & AIO Liquid)
  // ==========================================
  const coolers = [
    { name: 'Deepcool AG400 ARGB Single Tower CPU Cooler', slug: 'deepcool-ag400-argb-cpu-cooler', brand: 'Deepcool', sku: 'CLR-DEP-AG400', price: 1899, comp: 2499, stock: 30, socket: 'LGA1700,AM4,AM5,LGA1200', ht: 150, watt: 5, desc: '4 direct contact 6mm copper heatpipes, 120mm PWM hydro bearing ARGB fan, up to 220W TDP cooling capacity.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Deepcool AK620 Dual Tower High Performance Cooler', slug: 'deepcool-ak620-dual-tower-cooler', brand: 'Deepcool', sku: 'CLR-DEP-AK620', price: 5499, comp: 6499, stock: 20, socket: 'LGA1700,AM4,AM5,LGA1200', ht: 160, watt: 8, desc: 'Twin tower heatsink with 6 copper heatpipes and 2x 120mm FDB silent fans. 260W TDP capacity.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Cooler Master MasterLiquid 240L Core ARGB 240mm AIO', slug: 'cooler-master-masterliquid-240l-core-argb', brand: 'Cooler Master', sku: 'CLR-CM-240L', price: 5999, comp: 7299, stock: 15, socket: 'LGA1700,AM4,AM5,LGA1200', ht: 52, watt: 12, desc: 'Dual-chamber Gen S pump, 240mm radiator with 2x 120mm ARGB fans. Liquid cooling perfection.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Deepcool LT720 360mm High-Performance Liquid Cooler', slug: 'deepcool-lt720-360mm-liquid-cooler', brand: 'Deepcool', sku: 'CLR-DEP-LT720', price: 9999, comp: 11999, stock: 12, socket: 'LGA1700,AM4,AM5,LGA1200', ht: 52, watt: 15, desc: 'Multidimensional infinity mirror pump design, 4th gen water pump, 360mm aluminum radiator, 3x FK120 fans.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const cl of coolers) {
    const pId = await addProduct({
      category_id: 7,
      name: cl.name,
      slug: cl.slug,
      brand: cl.brand,
      sku: cl.sku,
      price: cl.price,
      compare_at_price: cl.comp,
      stock_quantity: cl.stock,
      short_description: `Sockets: ${cl.socket} | Height: ${cl.ht}mm | TDP: ${cl.desc.includes('TDP') ? cl.desc.match(/(\d+W TDP)/)[0] : 'High Airflow'}`,
      description: cl.desc,
      image_url: cl.img,
      featured: true
    });
    await addComponent(pId, { type: 'cooler', socket: cl.socket, cooler_height: cl.ht, wattage: cl.watt });
  }

  // ==========================================
  // H. OPERATING SYSTEMS
  // ==========================================
  const oss = [
    { name: 'Microsoft Windows 11 Home 64-Bit Digital License', slug: 'windows-11-home-digital-license', brand: 'Microsoft', sku: 'OS-WIN11-HM', price: 7999, comp: 9999, stock: 50, desc: 'Official digital product activation key for Windows 11 Home 64-bit Edition.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Microsoft Windows 11 Pro 64-Bit Digital License', slug: 'windows-11-pro-digital-license', brand: 'Microsoft', sku: 'OS-WIN11-PRO', price: 11999, comp: 14999, stock: 40, desc: 'Includes BitLocker encryption, Remote Desktop, and Windows Sandbox for developers & power users.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { name: 'Ubuntu 24.04 LTS Desktop (Free Installation & Tuning)', slug: 'ubuntu-2404-lts-free-install', brand: 'LinuxTech', sku: 'OS-UB-FREE', price: 0, comp: 499, stock: 100, desc: 'Official open-source Ubuntu 24.04 LTS installation, kernel optimization and stress testing by TechFix engineers.', img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const o of oss) {
    const pId = await addProduct({
      category_id: 7,
      name: o.name,
      slug: o.slug,
      brand: o.brand,
      sku: o.sku,
      price: o.price,
      compare_at_price: o.comp,
      stock_quantity: o.stock,
      short_description: o.price === 0 ? 'Free Open-Source OS Pre-Installation' : 'Official Digital License Key',
      description: o.desc,
      image_url: o.img,
      featured: true
    });
    await addComponent(pId, { type: 'os', wattage: 0 });
  }

  // ==========================================
  // I. MASSIVE GENERAL CATALOG EXPANSION (Laptops, PCs, SSDs, Pen Drives, Mice, Keyboards, Chairs, Pads, Monitors)
  // ==========================================
  const generalProducts = [
    // LAPTOPS (Cat 1)
    { cat: 1, name: 'Lenovo IdeaPad Slim 3 15" Intel Core i5 12th Gen', slug: 'lenovo-ideapad-slim-3-i5-12th', brand: 'Lenovo', sku: 'LAP-LEN-SL3', price: 46999, comp: 52999, stock: 15, short: 'Core i5 1235U | 16GB RAM | 512GB SSD | 15.6" FHD Anti-Glare', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
    { cat: 1, name: 'HP Pavilion 14 AMD Ryzen 5 7530U Ultrabook', slug: 'hp-pavilion-14-ryzen5-7530u', brand: 'HP', sku: 'LAP-HP-PAV14', price: 51999, comp: 58999, stock: 12, short: 'Ryzen 5 7530U | 16GB DDR4 | 512GB NVMe SSD | Backlit Kbd | 1.4kg', img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80' },
    { cat: 1, name: 'Dell Inspiron 15 3520 Intel Core i3 12th Gen', slug: 'dell-inspiron-15-3520-i3-12th', brand: 'Dell', sku: 'LAP-DEL-3520', price: 36999, comp: 41999, stock: 18, short: 'Core i3 1215U | 8GB RAM | 512GB SSD | 15.6" 120Hz Display', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
    { cat: 1, name: 'ASUS Vivobook 16X Creator Intel Core i7 12th Gen', slug: 'asus-vivobook-16x-creator-i7', brand: 'ASUS', sku: 'LAP-ASUS-V16X', price: 68999, comp: 79999, stock: 8, short: 'Core i7 12650H | 16GB DDR4 | 512GB SSD | 16.0" WUXGA 300 nits', img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80' },
    { cat: 1, name: 'Acer Nitro V 15 Intel Core i5 13th Gen RTX 4050', slug: 'acer-nitro-v-15-i5-rtx4050', brand: 'Acer', sku: 'LAP-ACER-NV15', price: 74999, comp: 84999, stock: 10, short: 'Core i5 13420H | RTX 4050 6GB | 16GB DDR5 | 512GB Gen4 | 144Hz', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80' },
    { cat: 1, name: 'MSI Thin 15 Intel Core i7 12th Gen RTX 3050 Gaming Laptop', slug: 'msi-thin-15-i7-rtx3050', brand: 'MSI', sku: 'LAP-MSI-TH15', price: 59999, comp: 69999, stock: 12, short: 'Core i7 12650H | RTX 3050 4GB | 16GB RAM | 512GB SSD | 144Hz FHD', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80' },

    // PRE-BUILT PCS (Cat 2)
    { cat: 2, name: 'TechFix MicroStudio Mini Core i5 Desktop PC', slug: 'techfix-microstudio-mini-i5-pc', brand: 'TechFix System', sku: 'PC-STU-MINI', price: 34999, comp: 39999, stock: 10, short: 'Core i5 12400 | 16GB DDR4 | 1TB NVMe SSD | Ultra-Compact SFF Case', img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80' },
    { cat: 2, name: 'TechFix Valorant Pro Esports Gaming PC (144+ FPS)', slug: 'techfix-valorant-pro-esports-pc', brand: 'TechFix System', sku: 'PC-GAM-VAL', price: 49999, comp: 56999, stock: 8, short: 'Ryzen 5 5600 | GTX 1650 4GB | 16GB DDR4 3600MHz | 512GB Gen4 SSD', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
    { cat: 2, name: 'TechFix CyberTitan RTX 4070 Super Workstation', slug: 'techfix-cybertitan-rtx4070s-pc', brand: 'TechFix System', sku: 'PC-GAM-TITAN', price: 139999, comp: 154999, stock: 5, short: 'Core i7 14700F | RTX 4070 Super 12GB | 32GB DDR5 | 2TB Gen4 | 750W Gold', img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80' },

    // PEN DRIVES (Cat 3)
    { cat: 3, name: 'SanDisk Ultra Flair 64GB USB 3.0 Metal Pen Drive', slug: 'sandisk-ultra-flair-64gb-usb3', brand: 'SanDisk', sku: 'USB-SAN-64M', price: 449, comp: 699, stock: 50, short: '64GB USB 3.0 | 150MB/s Read | Sleek Durable Metal Casing', img: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80' },
    { cat: 3, name: 'SanDisk Ultra Dual Drive Luxe 128GB Type-C & Type-A', slug: 'sandisk-ultra-dual-luxe-128gb-type-c', brand: 'SanDisk', sku: 'USB-SAN-128C', price: 1099, comp: 1499, stock: 40, short: '128GB 2-in-1 Dual USB Type-C & Type-A Flash Drive for Android & Mac', img: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80' },
    { cat: 3, name: 'Kingston DataTraveler Exodia 64GB USB 3.2 Pen Drive', slug: 'kingston-datatraveler-exodia-64gb', brand: 'Kingston', sku: 'USB-KNG-64G', price: 399, comp: 599, stock: 60, short: '64GB USB 3.2 Gen 1 | Protective Cap & Keyring Loop', img: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80' },

    // INTERNAL SSDS (Cat 4)
    { cat: 4, name: 'Crucial BX500 500GB 2.5" SATA III Internal SSD', slug: 'crucial-bx500-500gb-sata-ssd', brand: 'Crucial', sku: 'SSD-CRU-500S', price: 2899, comp: 3499, stock: 35, short: '500GB 2.5" SATA 6Gb/s | 540MB/s Read | Instant Laptop Upgrade', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
    { cat: 4, name: 'Crucial P3 Plus 1TB PCIe 4.0 3D NAND NVMe M.2 SSD', slug: 'crucial-p3-plus-1tb-pcie4-nvme', brand: 'Crucial', sku: 'SSD-CRU-1TBP4', price: 5799, comp: 6999, stock: 30, short: '1TB M.2 2280 NVMe Gen4 | Up to 5000MB/s Sequential Read Speed', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
    { cat: 4, name: 'Samsung 980 Pro 1TB PCIe Gen4 NVMe M.2 Gaming SSD', slug: 'samsung-980-pro-1tb-gen4-nvme', brand: 'Samsung', sku: 'SSD-SAM-980P1', price: 8999, comp: 10999, stock: 25, short: '1TB M.2 Gen4 NVMe | 7000MB/s Read | DRAM Cache | PS5 Compatible', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
    { cat: 4, name: 'WD Blue SN580 1TB NVMe PCIe 4.0 M.2 SSD', slug: 'wd-blue-sn580-1tb-nvme-ssd', brand: 'WD', sku: 'SSD-WD-SN580', price: 5499, comp: 6499, stock: 28, short: '1TB M.2 PCIe 4.0 | 4150MB/s Read | nCache 4.0 High-Speed Burst', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
    { cat: 4, name: 'Kingston NV2 2TB PCIe 4.0 NVMe M.2 Solid State Drive', slug: 'kingston-nv2-2tb-pcie4-nvme-ssd', brand: 'Kingston', sku: 'SSD-KNG-2TB', price: 9999, comp: 11999, stock: 15, short: '2TB High Capacity M.2 2280 | Up to 3500MB/s Read | 3-Year Warranty', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },

    // EXTERNAL SSDS (Cat 5)
    { cat: 5, name: 'Samsung T7 Shield 1TB Rugged Portable External SSD', slug: 'samsung-t7-shield-1tb-portable-ssd', brand: 'Samsung', sku: 'SSD-SAM-T7S1', price: 9499, comp: 11999, stock: 20, short: '1TB Rugged IP65 Water & Dust Resistant | 1050MB/s USB 3.2 Gen2 Type-C', img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80' },
    { cat: 5, name: 'SanDisk Extreme 1TB Portable SSD 1050MB/s', slug: 'sandisk-extreme-1tb-portable-ssd', brand: 'SanDisk', sku: 'SSD-SAN-EXT1', price: 8999, comp: 10999, stock: 22, short: '1TB Tough Silicone Shell | 1050MB/s Read | Drop Protection up to 2m', img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80' },
    { cat: 5, name: 'Crucial X6 500GB Portable USB-C External SSD', slug: 'crucial-x6-500gb-portable-ssd', brand: 'Crucial', sku: 'SSD-CRU-X6', price: 4499, comp: 5499, stock: 30, short: '500GB Ultra-Compact 40g Body | Up to 800MB/s Read | PC, Mac, iPad Ready', img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80' },

    // GAMING & OFFICE MICE (Cat 10 & 11)
    { cat: 10, name: 'Razer DeathAdder Essential Gaming Mouse (6400 DPI)', slug: 'razer-deathadder-essential-gaming-mouse', brand: 'Razer', sku: 'ACC-RAZ-DAE', price: 1299, comp: 1999, stock: 35, short: '6400 DPI Optical Sensor | 5 Hyperesponse Buttons | Ergonomic Form Factor', img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80' },
    { cat: 10, name: 'Logitech G102 Lightsync RGB 8000 DPI Gaming Mouse', slug: 'logitech-g102-lightsync-rgb-mouse', brand: 'Logitech', sku: 'ACC-LOG-G102', price: 1499, comp: 1999, stock: 40, short: '8000 DPI Gaming Grade Sensor | Custom Color Wave RGB | 6 Buttons', img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80' },
    { cat: 11, name: 'Logitech M221 Silent Wireless Mouse with USB Nano', slug: 'logitech-m221-silent-wireless-mouse', brand: 'Logitech', sku: 'ACC-LOG-M221', price: 799, comp: 1099, stock: 50, short: '90% Noise Reduction Silent Clicks | 18-Month Battery | 10m Wireless Range', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80' },
    { cat: 11, name: 'HP 150 Wireless Optical Mouse (1600 DPI)', slug: 'hp-150-wireless-optical-mouse', brand: 'HP', sku: 'ACC-HP-150', price: 499, comp: 799, stock: 45, short: '2.4GHz Wireless USB Dongle | 1600 DPI Smooth Tracking | Ambidextrous', img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80' },

    // KEYBOARDS (Cat 12)
    { cat: 12, name: 'Redragon K552 Kumara Tenkeyless Mechanical RGB Keyboard', slug: 'redragon-k552-kumara-mechanical-keyboard', brand: 'Redragon', sku: 'ACC-RED-K552', price: 2499, comp: 3499, stock: 25, short: 'Compact 87-Key TKL | Outemu Red Linear Switches | Rainbow RGB Backlit', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80' },
    { cat: 12, name: 'Logitech K120 Spill-Resistant Wired USB Keyboard', slug: 'logitech-k120-usb-office-keyboard', brand: 'Logitech', sku: 'ACC-LOG-K120', price: 499, comp: 699, stock: 60, short: 'Full Layout with Number Pad | Spill-Resistant Drainage | 10M Keypress Life', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80' },
    { cat: 12, name: 'Logitech K380 Multi-Device Bluetooth Wireless Keyboard', slug: 'logitech-k380-bluetooth-keyboard', brand: 'Logitech', sku: 'ACC-LOG-K380', price: 2699, comp: 3299, stock: 20, short: 'Connect up to 3 Devices (PC, Tablet, Phone) | 2-Year Battery | Slim & Quiet', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80' },

    // CHAIRS (Cat 13 & 14)
    { cat: 13, name: 'Green Soul Monster Ultimate Ergonomic Gaming Chair', slug: 'green-soul-monster-ultimate-gaming-chair', brand: 'Green Soul', sku: 'ACC-GS-MONSTER', price: 16999, comp: 19999, stock: 8, short: 'Internal Metal Frame | Breathable Spandex Fabric | 4D Armrests | 180° Recline', img: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&auto=format&fit=crop&q=80' },
    { cat: 14, name: 'Featherlite Astro High Back Mesh Ergonomic Chair', slug: 'featherlite-astro-high-back-mesh-chair', brand: 'Featherlite', sku: 'ACC-FL-ASTRO', price: 10499, comp: 12999, stock: 12, short: 'Self-Calibrating Lumbar Support | Synchro-Tilt Mechanism | Korean Mesh Back', img: 'https://images.unsplash.com/photo-1580481077197-25e2e88a38db?w=800&auto=format&fit=crop&q=80' },

    // MOUSE PADS (Cat 15)
    { cat: 15, name: 'Razer Gigantus V2 Large Cloth Gaming Mouse Pad (450x400mm)', slug: 'razer-gigantus-v2-large-mousepad', brand: 'Razer', sku: 'ACC-RAZ-GIG2', price: 1199, comp: 1599, stock: 30, short: '450 x 400 x 3mm | Micro-Weave Cloth Surface | High-Density Rubber Foam', img: 'https://images.unsplash.com/photo-1616763355548-1b606f43848c?w=800&auto=format&fit=crop&q=80' },
    { cat: 15, name: 'Redragon P010 Aurora RGB LED Hard Gaming Mouse Pad', slug: 'redragon-p010-aurora-rgb-mousepad', brand: 'Redragon', sku: 'ACC-RED-P010', price: 1499, comp: 1999, stock: 25, short: 'Hard Micro-Textured Low-Friction Surface | 9 RGB Modes | Non-Slip Rubber Base', img: 'https://images.unsplash.com/photo-1616763355548-1b606f43848c?w=800&auto=format&fit=crop&q=80' },

    // MONITORS (Cat 16)
    { cat: 16, name: 'LG UltraGear 24" Fast IPS FHD 180Hz Gaming Monitor', slug: 'lg-ultragear-24-180hz-fast-ips-monitor', brand: 'LG', sku: 'ACC-LG-24GN', price: 10999, comp: 13999, stock: 15, short: '24" FHD (1920x1080) | 180Hz | 1ms GtG | AMD FreeSync | HDR10 | sRGB 99%', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80' },
    { cat: 16, name: 'Acer Nitro VG271U 27" 2K 180Hz IPS Gaming Monitor', slug: 'acer-nitro-vg271u-27-2k-180hz-monitor', brand: 'Acer', sku: 'ACC-ACER-27Q', price: 16499, comp: 19999, stock: 12, short: '27" WQHD (2560x1440) | 180Hz | 0.5ms | 95% DCI-P3 | Stereo Speakers', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80' },
    { cat: 16, name: 'Samsung 24" Essential FHD 75Hz Bezel-less Monitor', slug: 'samsung-24-essential-fhd-75hz-monitor', brand: 'Samsung', sku: 'ACC-SAM-24E', price: 6999, comp: 8999, stock: 20, short: '24" IPS Full HD | 75Hz | AMD FreeSync | Eye Saver Mode | HDMI & D-Sub', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80' }
  ];

  for (const gp of generalProducts) {
    await addProduct({
      category_id: gp.cat,
      name: gp.name,
      slug: gp.slug,
      brand: gp.brand,
      sku: gp.sku,
      price: gp.price,
      compare_at_price: gp.comp,
      stock_quantity: gp.stock,
      short_description: gp.short,
      description: `${gp.name} with full official manufacturer warranty, doorstep Cash on Delivery, and technical support by TechFix.`,
      image_url: gp.img,
      featured: false
    });
  }

  // Additional Storage Components for PC Builder
  const extraBuilderParts = [
      { type: 'ssd', name: 'Kingston A400 240GB 2.5" SATA SSD', slug: 'kingston-a400-240gb-sata-ssd', brand: 'Kingston', sku: 'SSD-KNG-240S', price: 1699, comp: 2199, stock: 40, watt: 4, desc: '240GB 2.5" SATA III 6Gb/s internal solid state drive.', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
      { type: 'ssd', name: 'Crucial P3 500GB PCIe 3.0 3D NAND NVMe M.2 SSD', slug: 'crucial-p3-500gb-nvme-ssd', brand: 'Crucial', sku: 'SSD-CRU-500P3', price: 3499, comp: 4299, stock: 35, watt: 5, desc: '500GB M.2 2280 NVMe Gen3 | 3500MB/s Read.', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
      { type: 'ssd', name: 'WD Black SN770 1TB PCIe Gen4 NVMe Gaming SSD', slug: 'wd-black-sn770-1tb-gen4-nvme', brand: 'WD', sku: 'SSD-WD-SN770', price: 6999, comp: 8499, stock: 25, watt: 6, desc: '1TB M.2 Gen4 NVMe | 5150MB/s Read | Gaming Mode 2.0.', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
      { type: 'ssd', name: 'Samsung 990 Pro 2TB PCIe 4.0 NVMe M.2 SSD with Heatsink', slug: 'samsung-990-pro-2tb-heatsink-nvme', brand: 'Samsung', sku: 'SSD-SAM-990P2', price: 18999, comp: 22999, stock: 15, watt: 8, desc: '2TB PCIe 4.0 NVMe | 7450MB/s Read | Integrated Aluminum Heatsink for PS5 & PC.', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
      { type: 'hdd', name: 'WD Blue 1TB 3.5" 7200RPM Internal Hard Drive', slug: 'wd-blue-1tb-35-hdd', brand: 'WD', sku: 'HDD-WD-1TB', price: 3799, comp: 4499, stock: 30, watt: 10, desc: '1TB 3.5" SATA 6Gb/s desktop HDD for massive file storage.', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
      { type: 'hdd', name: 'Seagate IronWolf 4TB NAS & Desktop Hard Drive', slug: 'seagate-ironwolf-4tb-nas-hdd', brand: 'Seagate', sku: 'HDD-SEA-4TB', price: 8999, comp: 10999, stock: 18, watt: 12, desc: '4TB 3.5" 5400RPM SATA III with AgileArray firmware for 24/7 reliability.', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
      { type: 'fans', name: 'Cooler Master SickleFlow 120 ARGB Case Fan (Single Pack)', slug: 'cooler-master-sickleflow-120-argb', brand: 'Cooler Master', sku: 'FAN-CM-120A', price: 899, comp: 1199, stock: 45, watt: 3, desc: '120mm Air Balance fan blades with rifle bearing and frosted acrylic ARGB.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' },
      { type: 'fans', name: 'Corsair iCUE AF120 RGB Elite 120mm PWM Fan (Triple Kit)', slug: 'corsair-icue-af120-rgb-elite-triple', brand: 'Corsair', sku: 'FAN-COR-AF120', price: 4999, comp: 6299, stock: 20, watt: 10, desc: '3x 120mm Fluid Dynamic Bearing fans with AirGuide technology and iCUE Lighting Node Core.', img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80' }
    ];

    for (const ep of extraBuilderParts) {
      const pId = await addProduct({
        category_id: 7,
        name: ep.name,
        slug: ep.slug,
        brand: ep.brand,
        sku: ep.sku,
        price: ep.price,
        compare_at_price: ep.comp,
        stock_quantity: ep.stock,
        short_description: ep.desc,
        description: ep.desc,
        image_url: ep.img,
        featured: false
      });
      await addComponent(pId, { type: ep.type, wattage: ep.watt });
    }

  // Final verification counts
  const finalCat = await client.query('SELECT count(*) FROM categories');
  const finalProd = await client.query('SELECT count(*) FROM products');
  const finalComp = await client.query('SELECT count(*) FROM components');

  console.log(`\n=================================================`);
  console.log(`🎉 MASSIVE EXPANSION COMPLETED SUCCESSFULLY`);
  console.log(`Categories: ${finalCat.rows[0].count}`);
  console.log(`Products: ${finalProd.rows[0].count}`);
  console.log(`PC Components in Builder: ${finalComp.rows[0].count}`);
  console.log(`=================================================\n`);

  await client.end();
}

seedMassiveCatalog().catch(console.error);
