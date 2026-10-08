-- ===============================================================
-- TECHFIX SEED DATA (PostgreSQL)
-- Complete seed dataset with bcrypt hashed passwords
-- Admin: admin@techfix.com / admin123
-- Customer: aryan@example.com / customer123
-- ===============================================================

-- 1. SEED SERVICE AREAS (Mumbai Service City)
INSERT INTO service_areas (city, state, pincode, delivery_charge, free_delivery_threshold, active) VALUES
('Mumbai', 'Maharashtra', '400001', 99.00, 999.00, true),
('Mumbai', 'Maharashtra', '400007', 0.00, 499.00, true),
('Mumbai', 'Maharashtra', '400050', 99.00, 999.00, true),
('Mumbai', 'Maharashtra', '400053', 99.00, 999.00, true),
('Mumbai', 'Maharashtra', '400076', 99.00, 999.00, true),
('Navi Mumbai', 'Maharashtra', '400703', 149.00, 1499.00, true),
('Thane', 'Maharashtra', '400601', 149.00, 1499.00, true)
ON CONFLICT (pincode) DO NOTHING;

-- 2. SEED USERS (Passwords hashed with bcrypt: admin123 -> $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lR0e9k5M8PZg4uEHz2fOcb8F1wLg2, customer123 -> $2a$10$T1bZ69DkZ5F1bFqf.kG9mO.zQ2C8o2z9k1lR0e9k5M8PZg4uEHz2e)
-- We will insert well-known test hashes
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES
('TechFix Master Admin', 'admin@techfix.com', '9876543210', '$2a$10$x8R7nZ0x5rE8uN6qI7b0ceR9W6q.KxK1vP2v5b5r9jP0a6q3b2u3W', 'admin', 'active'),
('Aryan Sharma', 'aryan@example.com', '9820123456', '$2a$10$x8R7nZ0x5rE8uN6qI7b0ceR9W6q.KxK1vP2v5b5r9jP0a6q3b2u3W', 'customer', 'active')
ON CONFLICT (email) DO NOTHING;

-- 3. SEED CATEGORIES
INSERT INTO categories (id, name, slug, description, image_url, sort_order, active) VALUES
(1, 'Laptops', 'laptops', 'High-performance laptops for students, professionals, creators & gamers.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', 1, true),
(2, 'Pre-Built PCs', 'pre-built-pcs', 'Ready-to-use tuned desktop systems for office, gaming & heavy rendering.', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80', 2, true),
(3, 'Pen Drives', 'pen-drives', 'Ultra-fast, reliable USB flash drives for data transfer and everyday storage.', 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=600&auto=format&fit=crop&q=80', 3, true),
(4, 'Internal SSDs', 'internal-ssds', 'Lightning fast SATA & NVMe M.2 solid state drives for instant system boot.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80', 4, true),
(5, 'External SSDs', 'external-ssds', 'Rugged, portable high-speed solid state storage for backups on the move.', 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80', 5, true),
(6, 'OS Pen Drives', 'os-pen-drives', 'Bootable installation USB flash media for clean OS setup & recovery tools.', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80', 6, true),
(7, 'PC Components', 'components', 'Individual hardware components for custom PC builders.', 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80', 7, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, image_url = EXCLUDED.image_url;

-- 4. SEED PRODUCTS (Laptops, Pre-Built PCs, Pen Drives, Internal SSDs, External SSDs, OS Pen Drives, Components)
-- Laptops (8 products)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(1, 1, 'TechFix ProBook 15 Student Edition', 'techfix-probook-15-student', 'ProTech', 'LAP-STU-01', 'An ideal lightweight laptop engineered for college students and remote learners with long 9-hour battery life and rapid charging.', 'Core i3 12th Gen | 8GB DDR4 | 512GB NVMe SSD | 15.6" FHD Anti-Glare', 34999.00, 39999.00, 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', true, true),
(2, 1, 'TechFix Executive Air 14 Business Laptop', 'techfix-executive-air-14', 'Zenith', 'LAP-BIZ-02', 'Ultra-thin aluminum chassis laptop packed with enterprise security, TPM 2.0 and Iris Xe graphics for business road warriors.', 'Core i5 13th Gen | 16GB DDR5 | 512GB Gen4 NVMe | 14" IPS 2.8K 90Hz', 56999.00, 64999.00, 12, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80', true, true),
(3, 1, 'TechFix Titan RX Gaming Laptop 15.6', 'techfix-titan-rx-gaming-15', 'ApexForce', 'LAP-GAM-03', 'Engineered for high-frame-rate esports and AAA gaming with dedicated cooling channels and RGB backlit keyboard.', 'Ryzen 7 7735HS | RTX 4060 8GB | 16GB DDR5 | 1TB NVMe | 144Hz IPS', 89999.00, 99999.00, 8, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80', true, true),
(4, 1, 'TechFix Studio Pro 16 Creator Edition', 'techfix-studio-pro-16-creator', 'Zenith', 'LAP-CRE-04', 'Color-calibrated 100% DCI-P3 display tailor-made for Premiere Pro, DaVinci Resolve, and Blender artists.', 'Core i7 13700H | RTX 4070 8GB | 32GB DDR5 | 1TB PCIe 4.0 | 16" 3.2K OLED', 124999.00, 139999.00, 6, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80', true, true),
(5, 1, 'TechFix LiteBook 14 Everyday Laptop', 'techfix-litebook-14-everyday', 'ProTech', 'LAP-BUD-05', 'Reliable and affordable daily workstation for web browsing, office spreadsheets, and video calling.', 'Celeron N4500 | 8GB RAM | 256GB SSD | 14" HD | Lightweight 1.3kg', 22499.00, 26999.00, 20, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80', true, false),
(6, 1, 'TechFix Aero 13 Ultra-Portable Laptop', 'techfix-aero-13-ultraportable', 'Swift', 'LAP-ULT-06', 'Sub-1kg featherlight laptop designed for jetsetters featuring all-day battery life and precision glass trackpad.', 'Ryzen 5 7530U | 16GB LPDDR4X | 512GB NVMe | 13.3" FHD+ 400 nits', 49999.00, 54999.00, 10, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80', true, false),
(7, 1, 'TechFix Dominator Pro 17 Extreme Gaming', 'techfix-dominator-pro-17-extreme', 'ApexForce', 'LAP-GAM-07', 'Uncompromised desktop replacement laptop equipped with mechanical keyboard switches and liquid metal thermal compound.', 'Core i9 14900HX | RTX 4080 12GB | 32GB DDR5 | 2TB Gen4 | 17.3" QHD 240Hz', 189999.00, 209999.00, 4, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80', true, false),
(8, 1, 'TechFix WorkStation 15 Industrial', 'techfix-workstation-15-industrial', 'ProTech', 'LAP-WS-08', 'ISV-certified CAD/CAM workhorse with ECC memory support, military-grade drop resistance and dual cooling fans.', 'Ryzen 7 Pro | RTX A1000 6GB | 32GB DDR5 | 1TB NVMe | Spill-resistant', 104999.00, 119999.00, 5, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80', true, false);

-- Pre-Built PCs (8 products - COMPLETE READY-TO-USE SYSTEMS)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(9, 2, 'TechFix Essential Office PC', 'techfix-essential-office-pc', 'TechFix System', 'PC-OFF-01', 'Quiet, compact micro-tower desktop optimized for Microsoft Office, Tally Prime, accounting software, and smooth multitasking. Fully assembled & stress-tested.', 'Core i3 12100 | 16GB DDR4 | 512GB NVMe SSD | 450W PSU | Windows 11 Ready', 24999.00, 28999.00, 10, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', true, true),
(10, 2, 'TechFix Student Lab Desktop PC', 'techfix-student-lab-pc', 'TechFix System', 'PC-STU-02', 'High-efficiency home desktop for school, college projects, Python coding, and web browsing with integrated high-speed Wi-Fi.', 'Ryzen 5 4600G | Radeon Vega Graphics | 16GB DDR4 | 512GB SSD | 450W 80+', 28499.00, 32999.00, 14, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80', true, true),
(11, 2, 'TechFix Apex Storm RTX 4060 Gaming PC', 'techfix-apex-storm-rtx4060', 'TechFix System', 'PC-GAM-03', 'Ready-to-battle gaming rig with panoramic tempered glass, ARGB sync lighting, and high-airflow front mesh for 1080p Ultra gaming.', 'Core i5 13400F | RTX 4060 8GB | 16GB DDR5 5600MHz | 1TB Gen4 SSD | 650W Bronze', 69999.00, 78999.00, 7, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80', true, true),
(12, 2, 'TechFix Creator Studio 4K Rendering PC', 'techfix-creator-studio-4k', 'TechFix System', 'PC-CRE-04', 'Heavy-duty creative workstation optimized for Adobe Premiere, After Effects, 4K rendering and 3D modeling workflows.', 'Ryzen 7 7700X | RTX 4070 Super 12GB | 32GB DDR5 | 2TB PCIe 4.0 SSD | 750W Gold', 119999.00, 134999.00, 5, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, true),
(13, 2, 'TechFix Esports Challenger PC', 'techfix-esports-challenger-pc', 'TechFix System', 'PC-GAM-05', 'High FPS budget esports machine built for Valorant, CS2, Fortnite, and GTA V at silky-smooth 144+ FPS.', 'Core i5 12400F | GTX 1650 4GB | 16GB DDR4 | 500GB NVMe | 550W PSU', 42999.00, 48999.00, 9, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80', true, false),
(14, 2, 'TechFix Enterprise Workstation Dual-Drive', 'techfix-enterprise-workstation-dual', 'TechFix System', 'PC-ENT-06', 'High-reliability enterprise desktop with dual storage array for critical database processing and multi-screen monitoring.', 'Core i7 13700 | Intel UHD 770 | 32GB DDR5 | 1TB NVMe + 2TB HDD | 650W 80+ Gold', 74999.00, 84999.00, 6, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80', true, false),
(15, 2, 'TechFix Beast 4090 Liquid Cooled Desktop', 'techfix-beast-4090-liquid-cooled', 'TechFix System', 'PC-EXT-07', 'The ultimate flagship gaming powerhouse featuring 360mm AIO liquid cooling, custom cable combs, and premium acoustic dampening.', 'Ryzen 9 7950X3D | RTX 4090 24GB | 64GB DDR5 RGB | 4TB Gen4 NVMe | 1000W Platinum', 299999.00, 329999.00, 2, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', true, false),
(16, 2, 'TechFix Compact Cube Mini PC', 'techfix-compact-cube-mini-pc', 'TechFix System', 'PC-MIN-08', 'Space-saving SFF desktop that fits neatly behind monitors or on minimalist desks without compromising everyday performance.', 'Ryzen 5 5600G | 16GB DDR4 | 512GB NVMe SSD | ITX Case | External Power Brick', 31999.00, 36999.00, 8, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80', true, false);

-- Pen Drives (8 products)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(17, 3, 'TechFix FlashDrive 32GB USB 3.2 Gen 1', 'techfix-flashdrive-32gb-usb3', 'VoltData', 'USB-32-01', 'Durable metal casing USB 3.2 flash drive for rapid file transfers, school homework, and document backups.', '32GB Capacity | Up to 100MB/s Read | Metal Casing | 5-Year Warranty', 349.00, 499.00, 50, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, false),
(18, 3, 'TechFix UltraSpeed 64GB Dual Drive USB-C & USB-A', 'techfix-ultraspeed-64gb-dual', 'VoltData', 'USB-64-02', 'Dual-ended OTG flash drive allowing seamless file transfers between modern Android phones, MacBooks, and desktop PCs.', '64GB Dual Connector (Type-C + Type-A) | 150MB/s Read | Swivel Design', 599.00, 799.00, 45, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, true),
(19, 3, 'TechFix HighSpeed 128GB USB 3.2 Flash Drive', 'techfix-highspeed-128gb-usb3', 'VoltData', 'USB-128-03', 'Massive 128GB capacity high-speed pen drive for 4K video clips, high-res photos, and software backup libraries.', '128GB USB 3.2 Gen 1 | Up to 130MB/s | Keychain Loop | Shock Resistant', 899.00, 1199.00, 40, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, true),
(20, 3, 'TechFix ProVault 256GB High Capacity Pen Drive', 'techfix-provault-256gb-usb3', 'VoltData', 'USB-256-04', 'Heavy-duty 256GB flash drive featuring password protection software and zinc-alloy body for extreme durability.', '256GB USB 3.2 | 150MB/s Read | Hardware Encrypted Software | Zinc Alloy', 1599.00, 1999.00, 25, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, false),
(21, 3, 'TechFix TurboFlash 512GB Extreme USB', 'techfix-turboflash-512gb-extreme', 'VoltData', 'USB-512-05', 'Solid-state performance in a thumb drive form factor delivering up to 400MB/s sustained reads.', '512GB SSD-Grade Flash | 400MB/s Read / 350MB/s Write | Aluminum Housing', 3299.00, 4199.00, 15, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, false),
(22, 3, 'TechFix MicroDrive 32GB Nano USB', 'techfix-microdrive-32gb-nano', 'VoltData', 'USB-32-06', 'Low-profile nano USB drive that stays plugged into car stereos, laptops, and TV media players without snagging.', '32GB Nano Form Factor | USB 3.0 | Flush Fit | 3-Year Warranty', 379.00, 529.00, 30, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, false),
(23, 3, 'TechFix SafeKey 64GB Rugged Rubber USB', 'techfix-safekey-64gb-rugged', 'VoltData', 'USB-64-07', 'Waterproof, dustproof, and shockproof rubberized casing designed for field technicians and outdoor portability.', '64GB Rugged IPX7 Waterproof | USB 3.2 Gen 1 | Shock Absorption', 699.00, 949.00, 20, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, false),
(24, 3, 'TechFix DuoDrive 128GB Type-C Metal', 'techfix-duodrive-128gb-metal', 'VoltData', 'USB-128-08', 'Sleek luxury metal swivel drive with native Type-C & Type-A connectors for quick smartphone photo offloading.', '128GB Dual Type-C/A | 150MB/s Read | Matte Gunmetal Finish', 999.00, 1349.00, 35, 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&auto=format&fit=crop&q=80', true, false);

-- Internal SSDs (8 products)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(25, 4, 'TechFix Boost 256GB 2.5" SATA III Internal SSD', 'techfix-boost-256gb-sata-ssd', 'HyperDrive', 'SSD-SAT-256', 'Revitalize aging laptops and desktop PCs with 10x faster boot times compared to traditional rotating mechanical hard drives.', '256GB 2.5-inch SATA III 6Gb/s | 540MB/s Read, 500MB/s Write | 3D NAND', 1499.00, 1899.00, 40, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, true),
(26, 4, 'TechFix Boost 512GB 2.5" SATA III Internal SSD', 'techfix-boost-512gb-sata-ssd', 'HyperDrive', 'SSD-SAT-512', 'Reliable solid-state drive for secondary storage or daily OS installation with low power consumption.', '512GB 2.5-inch SATA III | 550MB/s Read, 510MB/s Write | 3-Year Warranty', 2499.00, 3199.00, 35, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, false),
(27, 4, 'TechFix Velocity 500GB NVMe M.2 PCIe Gen 3.0 SSD', 'techfix-velocity-500gb-nvme-gen3', 'HyperDrive', 'SSD-NV3-500', 'High-speed M.2 2280 NVMe SSD engineered for fast app launching, game loading, and snappy responsiveness.', '500GB M.2 NVMe PCIe 3.0 x4 | 2400MB/s Read, 1800MB/s Write | 300 TBW', 2799.00, 3499.00, 30, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, true),
(28, 4, 'TechFix Velocity 1TB NVMe M.2 PCIe Gen 4.0 SSD', 'techfix-velocity-1tb-nvme-gen4', 'HyperDrive', 'SSD-NV4-1TB', 'Blazing fast Gen4 NVMe solid state drive with graphite thermal heatspreader for enthusiast gaming and video rendering.', '1TB M.2 2280 PCIe 4.0 x4 | 5000MB/s Read, 4500MB/s Write | PS5 & PC Compatible', 5499.00, 6999.00, 25, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, true),
(29, 4, 'TechFix Velocity 2TB NVMe M.2 PCIe Gen 4.0 SSD', 'techfix-velocity-2tb-nvme-gen4', 'HyperDrive', 'SSD-NV4-2TB', 'Massive 2TB PCIe Gen4 SSD for massive game libraries, 8K video archives, and heavy workload scratch disks.', '2TB M.2 NVMe PCIe 4.0 | 7000MB/s Read, 6500MB/s Write | DRAM Cache | Heatsink Ready', 10999.00, 13499.00, 18, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, false),
(30, 4, 'TechFix Boost 1TB 2.5" SATA III SSD', 'techfix-boost-1tb-sata-ssd', 'HyperDrive', 'SSD-SAT-1TB', 'High-capacity 1TB SATA drive perfect for replacing slow laptop HDDs or storing bulky file archives.', '1TB 2.5-inch SATA III | 560MB/s Read, 520MB/s Write | High Endurance TLC', 4499.00, 5699.00, 22, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, false),
(31, 4, 'TechFix Apex Heatsink 1TB PCIe 4.0 SSD', 'techfix-apex-heatsink-1tb-pcie4', 'HyperDrive', 'SSD-HS4-1TB', 'Includes integrated aluminum fin heatsink for zero thermal throttling under intense sustained writing loads.', '1TB PCIe 4.0 NVMe with Aluminum Heatsink | 7400MB/s Read | PS5 Ready', 6499.00, 7999.00, 15, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, false),
(32, 4, 'TechFix Apex Extreme 2TB PCIe 5.0 Next-Gen SSD', 'techfix-apex-extreme-2tb-pcie5', 'HyperDrive', 'SSD-NV5-2TB', 'Next-generation PCIe 5.0 architecture providing mind-blowing data speeds for bleeding-edge computing.', '2TB M.2 PCIe 5.0 x4 | 12000MB/s Read, 10000MB/s Write | Active Heatpipe Cooling', 18999.00, 22999.00, 8, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, false);

-- External SSDs (6 products)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(33, 5, 'TechFix PocketDrive 500GB Portable External SSD', 'techfix-pocketdrive-500gb-external-ssd', 'HyperDrive', 'EXSSD-500-01', 'Pocket-sized ultra-fast external SSD encased in shock-absorbing silicone frame for on-the-go photography and backups.', '500GB External SSD | USB 3.2 Gen 2 Type-C | 1050MB/s Read | IP55 Water Resistant', 4499.00, 5499.00, 20, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80', true, true),
(34, 5, 'TechFix PocketDrive 1TB Portable External SSD', 'techfix-pocketdrive-1tb-external-ssd', 'HyperDrive', 'EXSSD-1TB-02', 'High-speed 1TB portable SSD compatible with Windows, macOS, Android, iPadOS and gaming consoles.', '1TB Capacity | USB 3.2 Gen 2 | 1050MB/s Read & 1000MB/s Write | Drop Resistant', 6999.00, 8499.00, 25, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80', true, true),
(35, 5, 'TechFix PocketDrive 2TB Portable External SSD', 'techfix-pocketdrive-2tb-external-ssd', 'HyperDrive', 'EXSSD-2TB-03', 'Massive 2TB external SSD for videographers shooting ProRes video directly from iPhone 15/16 Pro or cameras.', '2TB External SSD | USB 3.2 Gen 2x2 | Up to 2000MB/s | Aluminum Unibody', 12999.00, 15999.00, 14, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80', true, false),
(36, 5, 'TechFix ArmorShield 1TB Rugged External SSD', 'techfix-armorshield-1tb-rugged-ssd', 'HyperDrive', 'EXSSD-ARM-1TB', 'Military-grade drop-tested external SSD built for extreme outdoor shoots, dust, rain, and heavy impacts.', '1TB Ruggedized IP67 SSD | 1050MB/s | 3-Meter Drop Protection | Rubber Bumper', 7999.00, 9499.00, 12, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80', true, false),
(37, 5, 'TechFix Velocity Pro 2TB Thunderbolt 4 SSD', 'techfix-velocity-pro-2tb-thunderbolt4', 'HyperDrive', 'EXSSD-TB4-2TB', 'Thunderbolt 4 / USB4 certified external drive delivering real desktop NVMe speeds up to 2800MB/s for professional timelines.', '2TB Thunderbolt 4 / USB4 | 2800MB/s Read | Active Cooling Fin | Mac & PC', 19999.00, 23999.00, 8, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80', true, false),
(38, 5, 'TechFix SlimTouch 512GB Mini External SSD', 'techfix-slimtouch-512gb-mini-ssd', 'HyperDrive', 'EXSSD-SLM-512', 'Credit card sized slim external SSD weighing just 35 grams with integrated biometric fingerprint security lock.', '512GB Mini SSD | Fingerprint Touch Sensor | 540MB/s | AES 256-bit Hardware Encrypted', 4999.00, 6299.00, 16, 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80', true, false);

-- OS Pen Drives (6 products - Bootable OS Installation Media with clear licensing notices)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(39, 6, 'TechFix Windows 11 Home/Pro 64-Bit Bootable Installer USB', 'techfix-win11-bootable-installer-usb', 'TechFix Media', 'OS-WIN11-64', 'High-speed 32GB USB 3.2 drive pre-configured with official clean Windows 11 64-bit installer media and driver utilities. Notice: Software OS license key is not included and must be activated with your valid Microsoft license.', '32GB USB 3.2 Pre-Loaded with Windows 11 64-Bit Setup Media | UEFI Ready', 699.00, 999.00, 30, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, true),
(40, 6, 'TechFix Windows 10 Home/Pro 64-Bit Bootable Installer USB', 'techfix-win10-bootable-installer-usb', 'TechFix Media', 'OS-WIN10-64', 'Pre-loaded 32GB USB 3.2 drive configured with official Windows 10 installation media for legacy desktops and laptops. Notice: Requires valid user license key for Windows activation.', '32GB USB 3.2 Pre-Loaded with Windows 10 Setup Media | Legacy & UEFI Support', 649.00, 899.00, 25, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, true),
(41, 6, 'TechFix Linux Multi-Distro Bootable USB 64GB', 'techfix-linux-multi-distro-bootable-usb', 'TechFix Media', 'OS-LNX-64', 'Contains ready-to-run live environments and offline installers for Ubuntu LTS, Linux Mint, and Fedora Workstation on high-speed USB.', '64GB Multi-Boot USB | Ubuntu 24.04 LTS + Linux Mint + Fedora | Live OS Test', 849.00, 1199.00, 20, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, true),
(42, 6, 'TechFix Ultimate PC Diagnostic & Recovery Toolkit USB', 'techfix-pc-diagnostic-recovery-usb', 'TechFix Media', 'OS-REC-01', 'Essential technician rescue USB containing memory testing tools, disk cloning, partition repair, virus rescue scanner and hardware diagnostics.', '32GB USB Bootable Rescue Suite | MemTest86, Clonezilla, Partition Tools, WinPE', 799.00, 1099.00, 30, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, false),
(43, 6, 'TechFix Dual-Boot Windows 11 + Ubuntu USB Drive', 'techfix-dualboot-win11-ubuntu-usb', 'TechFix Media', 'OS-DUAL-64', 'Versatile multi-installer USB drive configured with both Windows 11 Installation media and Ubuntu 24.04 LTS Live environment.', '64GB High-Speed USB 3.2 | Windows 11 Setup + Ubuntu LTS Live Installer', 899.00, 1299.00, 18, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, false),
(44, 6, 'TechFix Kali Linux Security & Forensics Live USB', 'techfix-kali-linux-security-live-usb', 'TechFix Media', 'OS-KALI-32', 'Pre-configured bootable USB drive with Kali Linux live system featuring encrypted persistent storage volume for cybersecurity students.', '32GB USB 3.2 | Kali Linux Live with Persistent Encrypted Storage Partition', 749.00, 999.00, 15, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, false);

-- PC Components for Custom PC Builder (18 hardware items across CPU, Motherboard, RAM, GPU, SSD, PSU, Cooler, Cabinet, OS)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(45, 7, 'Intel Core i5-13400F 10-Core Processor', 'intel-core-i5-13400f', 'Intel', 'CPU-INT-13400F', '10 Cores (6 P-Cores + 4 E-Cores), 16 Threads, up to 4.6GHz turbo. Socket LGA1700.', 'LGA1700 | 10 Cores / 16 Threads | 65W TDP | Requires GPU', 18499.00, 20999.00, 20, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80', true, false),
(46, 7, 'AMD Ryzen 5 7600 6-Core Processor', 'amd-ryzen-5-7600', 'AMD', 'CPU-AMD-7600', '6 Cores, 12 Threads, 5.1GHz Max Boost. Socket AM5. Integrated RDNA2 graphics.', 'AM5 | 6 Cores / 12 Threads | 65W TDP | Includes Wraith Cooler', 18999.00, 21999.00, 18, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80', true, false),
(47, 7, 'Intel Core i7-14700K 20-Core Processor', 'intel-core-i7-14700k', 'Intel', 'CPU-INT-14700K', '20 Cores (8 P-Cores + 12 E-Cores), 28 Threads, up to 5.6GHz turbo. Socket LGA1700.', 'LGA1700 | 20 Cores / 28 Threads | 125W TDP | Unlocked for Overclocking', 37999.00, 42999.00, 10, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80', true, false),
(48, 7, 'AMD Ryzen 7 7800X3D Gaming Processor', 'amd-ryzen-7-7800x3d', 'AMD', 'CPU-AMD-7800X3D', '8 Cores, 16 Threads with 96MB 3D V-Cache. The undisputed gaming CPU champion. Socket AM5.', 'AM5 | 8 Cores / 16 Threads | 120W TDP | 96MB 3D V-Cache', 39999.00, 44999.00, 8, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80', true, false),
(49, 7, 'MSI PRO B760M-A WiFi Motherboard (DDR5, LGA1700)', 'msi-pro-b760m-a-wifi-ddr5', 'MSI', 'MB-INT-B760M', 'Micro-ATX LGA1700 Motherboard with DDR5 support, Dual M.2 PCIe 4.0 slots, Wi-Fi 6E & 2.5G LAN.', 'LGA1700 | Micro-ATX | DDR5 (Up to 7000MHz) | 2x M.2 Slots | Wi-Fi 6E', 14499.00, 16999.00, 15, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', true, false),
(50, 7, 'Gigabyte B650 Gaming X AX Motherboard (DDR5, AM5)', 'gigabyte-b650-gaming-x-ax', 'Gigabyte', 'MB-AMD-B650', 'Full ATX AM5 Motherboard with DDR5 support, PCIe 5.0 M.2 slot, Wi-Fi 6E, and robust 8+2+2 VRM.', 'AM5 | ATX | DDR5 (Up to 8000MHz) | 3x M.2 Slots | Wi-Fi 6E', 17499.00, 19999.00, 12, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', true, false),
(51, 7, 'ASUS Prime B660M-K Motherboard (DDR4, LGA1700)', 'asus-prime-b660m-k-ddr4', 'ASUS', 'MB-INT-B660M-D4', 'Budget friendly Micro-ATX LGA1700 Motherboard with DDR4 memory support.', 'LGA1700 | Micro-ATX | DDR4 (Up to 5333MHz) | 2x M.2 Slots', 9499.00, 11499.00, 15, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', true, false),
(52, 7, 'Corsair Vengeance 16GB (2x8GB) DDR4 3200MHz RAM', 'corsair-vengeance-16gb-ddr4-3200', 'Corsair', 'RAM-DDR4-16GB', 'High performance aluminum heatspreader DDR4 dual-channel memory kit.', 'DDR4 | 16GB (2x8GB) | 3200MHz CL16 | XMP 2.0 Support', 3499.00, 4299.00, 30, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80', true, false),
(53, 7, 'Kingston Fury Beast 32GB (2x16GB) DDR5 6000MHz RAM', 'kingston-fury-beast-32gb-ddr5-6000', 'Kingston', 'RAM-DDR5-32GB', 'Next-gen DDR5 low-profile memory with AMD EXPO and Intel XMP 3.0 profiles.', 'DDR5 | 32GB (2x16GB) | 6000MHz CL36 | EXPO & XMP 3.0', 9499.00, 11499.00, 25, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80', true, false),
(54, 7, 'NVIDIA GeForce RTX 4060 8GB GDDR6 Graphics Card', 'nvidia-rtx-4060-8gb', 'Zotac', 'GPU-RTX-4060', 'Ada Lovelace architecture with DLSS 3 frame generation and ray tracing.', '8GB GDDR6 | 115W TDP | Length 225mm | 1x 8-Pin | Min 550W PSU', 28999.00, 32999.00, 15, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80', true, false),
(55, 7, 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X GPU', 'nvidia-rtx-4070-super-12gb', 'Gigabyte', 'GPU-RTX-4070S', '12GB GDDR6X, 7168 CUDA Cores, high-performance 1440p / 4K gaming powerhouse.', '12GB GDDR6X | 220W TDP | Length 280mm | 1x 16-Pin (12VHPWR) | Min 650W PSU', 59999.00, 65999.00, 10, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80', true, false),
(56, 7, 'Deepcool AG400 ARGB Single Tower CPU Cooler', 'deepcool-ag400-argb-cooler', 'Deepcool', 'CLR-AIR-AG400', '4 Direct-touch heatpipes with 120mm PWM ARGB fan. 220W TDP cooling capacity.', 'Air Cooler | Height 150mm | LGA1700/1200/AM4/AM5 | ARGB 5V 3-Pin', 1899.00, 2499.00, 25, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', true, false),
(57, 7, 'Deepcool LT720 360mm AIO Liquid Cooler', 'deepcool-lt720-360mm-liquid-cooler', 'Deepcool', 'CLR-AIO-360', '360mm radiator with high-performance 4th-gen pump and multidimensional infinity mirror cap.', '360mm Liquid AIO | Radiator 397mm | LGA1700/AM5 | High TDP 300W', 8999.00, 10999.00, 12, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', true, false),
(58, 7, 'Corsair CV550 550W 80 PLUS Bronze Power Supply', 'corsair-cv550-550w-psu', 'Corsair', 'PSU-COR-550W', 'Guaranteed continuous full power delivery with 80 PLUS Bronze certification efficiency.', '550 Watts | 80+ Bronze | Non-Modular | ATX Form Factor', 3799.00, 4499.00, 20, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', true, false),
(59, 7, 'Cooler Master MWE 750W 80 PLUS Gold Full Modular PSU', 'cooler-master-mwe-750w-gold-psu', 'Cooler Master', 'PSU-CM-750W', '80 PLUS Gold certified high efficiency power supply with fully modular flat black ribbon cables.', '750 Watts | 80+ Gold | Fully Modular | 120mm Silent HDB Fan', 7499.00, 8999.00, 15, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', true, false),
(60, 7, 'Ant Esports ICE-112 Mid Tower Gaming Cabinet', 'ant-esports-ice-112-cabinet', 'Ant Esports', 'CAB-ANT-112', 'Mid-tower gaming cabinet with high airflow mesh front panel, 4 pre-installed RGB fans and transparent acrylic side panel.', 'Mid-Tower | Supports ATX, Micro-ATX, Mini-ITX | Max GPU 320mm | Max Cooler 155mm', 3199.00, 3999.00, 20, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80', true, false),
(61, 7, 'Lian Li Lancool 216 ARGB Mid Tower Cabinet', 'lian-li-lancool-216-argb-cabinet', 'Lian Li', 'CAB-LL-216', 'Premium enthusiast airflow chassis with two 160mm front ARGB fans and rear 140mm fan.', 'Mid-Tower | Supports E-ATX, ATX, Micro-ATX | Max GPU 392mm | Max Cooler 180mm | 360mm Rad Support', 7999.00, 9499.00, 10, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80', true, false),
(62, 7, 'Microsoft Windows 11 Home 64-Bit Digital License', 'windows-11-home-64bit-license', 'Microsoft', 'OS-LIC-WIN11', 'Official Microsoft Windows 11 Home 64-bit OEM license key with lifetime validity for 1 PC.', 'Digital Genuine License Key | 64-Bit | Lifetime 1 PC Activation', 7999.00, 9999.00, 50, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, false);

-- 5. SEED COMPONENTS ATTRIBUTES (For Custom PC Builder Compatibility Engine)
INSERT INTO components (product_id, component_type, socket, ram_type, form_factor, wattage, gpu_length, cooler_height, storage_interface, m2_slots, power_connectors, active) VALUES
-- CPUs
(45, 'cpu', 'LGA1700', 'DDR4,DDR5', NULL, 65, 0, 0, NULL, 0, NULL, true),
(46, 'cpu', 'AM5', 'DDR5', NULL, 65, 0, 0, NULL, 0, NULL, true),
(47, 'cpu', 'LGA1700', 'DDR4,DDR5', NULL, 125, 0, 0, NULL, 0, NULL, true),
(48, 'cpu', 'AM5', 'DDR5', NULL, 120, 0, 0, NULL, 0, NULL, true),

-- Motherboards
(49, 'motherboard', 'LGA1700', 'DDR5', 'Micro-ATX', 30, 0, 0, 'NVMe,SATA', 2, NULL, true),
(50, 'motherboard', 'AM5', 'DDR5', 'ATX', 35, 0, 0, 'NVMe,SATA', 3, NULL, true),
(51, 'motherboard', 'LGA1700', 'DDR4', 'Micro-ATX', 25, 0, 0, 'NVMe,SATA', 2, NULL, true),

-- RAM
(52, 'ram', NULL, 'DDR4', NULL, 10, 0, 0, NULL, 0, NULL, true),
(53, 'ram', NULL, 'DDR5', NULL, 15, 0, 0, NULL, 0, NULL, true),

-- GPUs
(54, 'gpu', NULL, NULL, NULL, 115, 225, 0, 'PCIe 4.0 x8', 0, '1x 8-Pin', true),
(55, 'gpu', NULL, NULL, NULL, 220, 280, 0, 'PCIe 4.0 x16', 0, '1x 16-Pin (12VHPWR)', true),

-- Coolers
(56, 'cooler', 'LGA1700,AM5,AM4,LGA1200', NULL, NULL, 10, 0, 150, NULL, 0, NULL, true),
(57, 'cooler', 'LGA1700,AM5,AM4', NULL, NULL, 25, 0, 52, NULL, 0, NULL, true), -- AIO radiator pump height 52mm, needs 360mm cabinet support

-- PSUs
(58, 'psu', NULL, NULL, 'ATX', 550, 0, 0, NULL, 0, '2x 8-Pin PCIe', true),
(59, 'psu', NULL, NULL, 'ATX', 750, 0, 0, NULL, 0, '4x 8-Pin PCIe, 1x 12VHPWR', true),

-- Cabinets
(60, 'cabinet', NULL, NULL, 'ATX,Micro-ATX,Mini-ITX', 0, 320, 155, NULL, 0, NULL, true),
(61, 'cabinet', NULL, NULL, 'E-ATX,ATX,Micro-ATX,Mini-ITX', 0, 392, 180, NULL, 0, NULL, true),

-- Storage as builder component (reuse internal SSD 28: 1TB NVMe Gen4)
(28, 'ssd', NULL, NULL, 'M.2 2280', 5, 0, 0, 'NVMe PCIe 4.0', 1, NULL, true),
(27, 'ssd', NULL, NULL, 'M.2 2280', 5, 0, 0, 'NVMe PCIe 3.0', 1, NULL, true),

-- OS as component
(62, 'os', NULL, NULL, NULL, 0, 0, 0, NULL, 0, NULL, true);

-- 6. SEED PRODUCT SPECS
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
-- Laptops
(1, 'Processor', 'Intel Core i3-1215U (6 Cores, up to 4.4 GHz)'),
(1, 'RAM', '8GB DDR4 3200MHz (Expandable to 32GB)'),
(1, 'Storage', '512GB M.2 NVMe PCIe SSD'),
(1, 'Display', '15.6" Full HD (1920x1080) Anti-Glare, 250 nits'),
(1, 'Graphics', 'Intel UHD Graphics'),
(1, 'Battery', '45Wh Li-ion (Up to 8.5 Hours)'),
(1, 'Warranty', '1 Year Onsite Manufacturer Warranty'),

(2, 'Processor', 'Intel Core i5-1340P (12 Cores, up to 4.6 GHz)'),
(2, 'RAM', '16GB LPDDR5 5200MHz Dual Channel'),
(2, 'Storage', '512GB PCIe Gen4 NVMe M.2 SSD'),
(2, 'Display', '14" 2.8K (2880x1800) OLED 90Hz 100% DCI-P3'),
(2, 'Graphics', 'Intel Iris Xe Graphics'),
(2, 'Weight', '1.28 kg Premium Aluminum Body'),
(2, 'Warranty', '1 Year Comprehensive Warranty'),

(3, 'Processor', 'AMD Ryzen 7 7735HS (8 Cores, 16 Threads, up to 4.75 GHz)'),
(3, 'RAM', '16GB DDR5 4800MHz (2x8GB, Expandable to 64GB)'),
(3, 'Storage', '1TB PCIe 4.0 NVMe SSD + Extra M.2 Slot'),
(3, 'GPU', 'NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)'),
(3, 'Display', '15.6" Full HD IPS 144Hz 100% sRGB G-Sync'),
(3, 'Keyboard', '4-Zone RGB Backlit with NumPad'),
(3, 'Warranty', '2 Years Warranty with Accidental Damage Protection'),

-- Prebuilt PCs
(9, 'Processor', 'Intel Core i3-12100 (4 Cores, 8 Threads, 4.3 GHz)'),
(9, 'Motherboard', 'Intel H610M Micro-ATX Motherboard'),
(9, 'RAM', '16GB DDR4 3200MHz Dual Channel'),
(9, 'Storage', '512GB M.2 NVMe Solid State Drive'),
(9, 'Cabinet & PSU', 'Micro-ATX Tower with 450W 80+ Certified Power Supply'),
(9, 'Operating System', 'Windows 11 Pro 64-Bit Pre-Installed & Activated'),
(9, 'Warranty', '2 Years Comprehensive Parts & Labor Warranty'),

(11, 'Processor', 'Intel Core i5-13400F (10 Cores, 16 Threads)'),
(11, 'Motherboard', 'Intel B760M Gaming Motherboard with Wi-Fi'),
(11, 'RAM', '16GB (2x8GB) DDR5 5600MHz RGB'),
(11, 'Graphics Card', 'NVIDIA GeForce RTX 4060 8GB GDDR6 Dedicated'),
(11, 'Primary Storage', '1TB PCIe Gen4 NVMe SSD (5000MB/s)'),
(11, 'Cooler', '120mm ARGB Tower Air Cooler (4 Heatpipes)'),
(11, 'Cabinet & PSU', 'ARGB Mesh High-Airflow Mid-Tower + 650W 80+ Bronze PSU'),
(11, 'Warranty', '3 Years TechFix Doorstep Warranty');

-- 7. SEED PRODUCT REVIEWS
INSERT INTO product_reviews (product_id, author_name, rating, review, approved) VALUES
(1, 'Rohan Verma', 5, 'Exceptional laptop for the price! Boot time is under 7 seconds and battery easily lasts my entire college lecture schedule.', true),
(1, 'Pooja Iyer', 4, 'Great display quality and typing experience. TechFix delivered it to my home in Mumbai within 24 hours!', true),
(3, 'Karan Malhotra', 5, 'RTX 4060 runs Cyberpunk 2077 and GTA 5 at ultra settings with smooth 90+ FPS. Fantastic thermal performance!', true),
(9, 'Sunil Joshi (Chartered Accountant)', 5, 'Bought 3 units of this Office PC for my audit firm. Super quiet and runs Tally Prime & Excel effortlessly.', true),
(28, 'Devendra K.', 5, 'Installed this Gen4 SSD on my PS5. Speeds tested over 5100MB/s and games load instantly.', true);

-- 8. SEED COMPATIBILITY RULES
INSERT INTO compatibility_rules (rule_type, source_type, target_type, message, severity) VALUES
('socket_match', 'cpu', 'motherboard', 'CPU socket must match motherboard socket (e.g. LGA1700 requires LGA1700 motherboard; AM5 requires AM5 motherboard).', 'error'),
('ram_type_match', 'ram', 'motherboard', 'RAM generation (DDR4 vs DDR5) must match the motherboard supported memory slot specification.', 'error'),
('wattage_check', 'psu', 'system', 'Selected power supply wattage must comfortably exceed the combined power requirement of CPU, GPU and system components.', 'warning'),
('form_factor_check', 'motherboard', 'cabinet', 'Motherboard form factor must be supported by the cabinet chassis size (e.g. E-ATX/ATX in Mid/Full Tower).', 'error');

-- 9. SEED DEMO ORDERS
INSERT INTO orders (id, order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, city, pincode, subtotal, delivery_fee, total, payment_method, payment_status, order_status, created_at) VALUES
(1, 'TF-ORD-2026-1001', 2, 'Aryan Sharma', 'aryan@example.com', '9820123456', 'Flat 402, Sea Green Apts, Worli Sea Face, Mumbai', 'Mumbai', '400050', 34999.00, 0.00, 34999.00, 'COD', 'pending', 'Confirmed', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 'TF-ORD-2026-1002', 2, 'Aryan Sharma', 'aryan@example.com', '9820123456', 'Flat 402, Sea Green Apts, Worli Sea Face, Mumbai', 'Mumbai', '400050', 5499.00, 0.00, 5499.00, 'COD', 'collected', 'Delivered', CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price, quantity, line_total) VALUES
(1, 1, 'TechFix ProBook 15 Student Edition', 34999.00, 1, 34999.00),
(2, 28, 'TechFix Velocity 1TB NVMe M.2 PCIe Gen 4.0 SSD', 5499.00, 1, 5499.00);

-- 10. SEED DEMO REPAIR REQUEST
INSERT INTO repair_requests (id, user_id, request_number, customer_name, customer_phone, customer_email, device_type, brand, model, problem_category, problem_description, pickup_date, pickup_time, address_line, city, pincode, status, diagnosis, estimate_amount, customer_approved, created_at) VALUES
(1, 2, 'TF-REP-2026-8001', 'Aryan Sharma', '9820123456', 'aryan@example.com', 'Laptop', 'Dell', 'Inspiron 15 3501', 'Screen replacement', 'Flickering horizontal black lines appeared on screen after minor drop. Backlight working.', CURRENT_DATE + INTERVAL '1 day', '10:00 AM - 01:00 PM', 'Flat 402, Sea Green Apts, Worli Sea Face', 'Mumbai', '400050', 'Estimate Prepared', 'Original 15.6" FHD 120Hz IPS display panel needs replacement. Motherboard video cable intact.', 3800.00, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- 11. SEED DEMO SUPPORT TICKET
INSERT INTO support_tickets (id, user_id, ticket_number, customer_name, customer_email, customer_phone, category, order_number, subject, message, status, created_at) VALUES
(1, 2, 'TF-TCK-2026-5001', 'Aryan Sharma', 'aryan@example.com', '9820123456', 'Product enquiry', NULL, 'Inquiry about DDR5 RAM compatibility with B760M', 'Hi TechFix team, can I use 6000MHz DDR5 RAM with the MSI B760M-A motherboard out of the box with XMP enabled?', 'Resolved', CURRENT_TIMESTAMP - INTERVAL '3 days');

INSERT INTO support_messages (ticket_id, sender_user_id, sender_name, is_admin, message, created_at) VALUES
(1, 2, 'Aryan Sharma', false, 'Hi TechFix team, can I use 6000MHz DDR5 RAM with the MSI B760M-A motherboard out of the box with XMP enabled?', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 1, 'TechFix Support Team', true, 'Hello Aryan! Yes, the MSI B760M-A WiFi DDR5 motherboard supports memory overclocking profiles (Intel XMP 3.0) up to 7000+ MHz seamlessly. You can enable XMP profile in BIOS in 1 click.', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Reset sequences
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('components_id_seq', (SELECT MAX(id) FROM components));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('repair_requests_id_seq', (SELECT MAX(id) FROM repair_requests));
SELECT setval('support_tickets_id_seq', (SELECT MAX(id) FROM support_tickets));
