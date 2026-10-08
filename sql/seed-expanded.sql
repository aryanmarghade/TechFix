-- ===============================================================
-- TECHFIX EXPANDED SEED DATA (PostgreSQL)
-- Adds Linux Laptops, Linux Pen Drives, Mice, Keyboards, Chairs, Mouse Pads, Monitors, and Extra Components
-- ===============================================================

-- 1. Insert New Categories
INSERT INTO categories (id, name, slug, description, image_url, sort_order, active) VALUES
(8, 'Linux Laptops', 'linux-laptops', 'Certified laptops with pre-installed Ubuntu, Fedora, Debian & Linux Mint.', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80', 8, true),
(9, 'Linux Pen Drives', 'linux-pen-drives', 'Bootable installation and live test USB media for Ubuntu, Mint, Debian & Fedora.', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80', 9, true),
(10, 'Gaming Mice', 'gaming-mice', 'High-DPI optical precision gaming mice with customizable RGB and ultra-low latency.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', 10, true),
(11, 'Normal / Office Mice', 'normal-mice', 'Silent-click ergonomic wired and wireless mice for office spreadsheets and laptops.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', 11, true),
(12, 'Keyboards', 'keyboards', 'Mechanical gaming keyboards, wireless multi-device keyboards and silent office keyboards.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', 12, true),
(13, 'Gaming Chairs', 'gaming-chairs', 'Ergonomic racing-style gaming chairs with lumbar support, 4D armrests, and 160° recline.', 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&auto=format&fit=crop&q=80', 13, true),
(14, 'Office Chairs', 'office-chairs', 'Breathable mesh executive ergonomic chairs for all-day posture support and coding comfort.', 'https://images.unsplash.com/photo-1580481077197-25e2e88a38db?w=600&auto=format&fit=crop&q=80', 14, true),
(15, 'Mouse Pads', 'mouse-pads', 'Micro-woven speed cloth mouse pads, extended desk mats, and RGB gaming pads.', 'https://images.unsplash.com/photo-1616763355548-1b606f43848c?w=600&auto=format&fit=crop&q=80', 15, true),
(16, 'Monitors', 'monitors', 'Color-accurate IPS displays, 180Hz gaming monitors, and UltraWide productivity screens.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', 16, true)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image_url=EXCLUDED.image_url;

-- 2. Insert Linux Laptops (Category 8)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(63, 8, 'TechFix PenguinBook 14 Ubuntu Edition', 'techfix-penguinbook-14-ubuntu', 'LinuxTech', 'LNX-LAP-UB14', 'Purpose-tuned lightweight laptop with Ubuntu 24.04 LTS pre-installed. Zero bloatware, pre-configured development compilers, and out-of-the-box Wi-Fi 6 kernel drivers.', 'Ubuntu 24.04 LTS Pre-Installed | Core i5 13th Gen | 16GB RAM | 512GB NVMe SSD | 14" IPS FHD', 48999.00, 54999.00, 10, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80', true, true),
(64, 8, 'TechFix DevBook Pro 15 Fedora Workstation', 'techfix-devbook-pro-15-fedora', 'LinuxTech', 'LNX-LAP-FED15', 'Engineered for backend engineers, Docker workflows, and kernel hackers with Fedora Workstation 40 pre-installed.', 'Fedora 40 Pre-Installed | Ryzen 7 7735U | 32GB LPDDR5 | 1TB Gen4 SSD | 15.6" 2.5K 120Hz', 68999.00, 77999.00, 8, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', true, true),
(65, 8, 'TechFix LibreStation 15 Linux Mint Edition', 'techfix-librestation-15-mint', 'LinuxTech', 'LNX-LAP-MNT15', 'The perfect beginner-friendly open-source laptop featuring Linux Mint Cinnamon Edition, clean UI, and long battery life.', 'Linux Mint Cinnamon Pre-Installed | Core i3 12th Gen | 16GB RAM | 512GB SSD | 15.6" FHD Anti-Glare', 37999.00, 42999.00, 12, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80', true, false),
(66, 8, 'TechFix Terminal 14 Debian Stable Edition', 'techfix-terminal-14-debian', 'LinuxTech', 'LNX-LAP-DEB14', 'Rock-solid Debian 12 Bookworm system configured for network administrators, sysadmins, and security researchers.', 'Debian 12 Bookworm Pre-Installed | Ryzen 5 7530U | 16GB RAM | 512GB NVMe | 14" IPS Matte', 44999.00, 49999.00, 7, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80', true, false)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Linux Pen Drives (Category 9)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(67, 9, 'TechFix Ubuntu 24.04 LTS Bootable USB 32GB', 'ubuntu-2404-lts-bootable-usb-32gb', 'LinuxTech Media', 'USB-LNX-UBUNTU', '32GB USB 3.2 Gen 1 pre-configured with official Ubuntu 24.04 LTS installer & live trial environment. Notice: Free open-source GNU/Linux software.', '32GB USB 3.2 | Official Ubuntu 24.04 LTS Live & Install Media | UEFI / BIOS', 499.00, 699.00, 40, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, true),
(68, 9, 'TechFix Linux Mint 21.3 Cinnamon Bootable USB 32GB', 'linux-mint-cinnamon-bootable-usb-32gb', 'LinuxTech Media', 'USB-LNX-MINT', 'Plug-and-play bootable USB media loaded with Linux Mint Cinnamon 64-bit for instant hardware testing and installation.', '32GB USB 3.2 | Linux Mint Cinnamon Live Environment | Offline Software Suite', 499.00, 699.00, 35, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, true),
(69, 9, 'TechFix Fedora Workstation 40 Live USB 32GB', 'fedora-workstation-40-live-usb-32gb', 'LinuxTech Media', 'USB-LNX-FEDORA', 'Pre-loaded with official Fedora 40 Workstation containing bleeding-edge GNOME desktop and kernel 6.8+.', '32GB USB 3.2 | Fedora Workstation 40 | Wayland & Btrfs Ready', 529.00, 749.00, 25, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, false),
(70, 9, 'TechFix Debian 12 Netinst & Full Suite USB 32GB', 'debian-12-full-suite-usb-32gb', 'LinuxTech Media', 'USB-LNX-DEBIAN', 'Universal operating system USB installer containing Debian 12 Bookworm with non-free firmware pack for seamless Wi-Fi recognition.', '32GB USB 3.2 | Debian 12 Bookworm with Non-Free Firmware | Server & Desktop', 499.00, 699.00, 30, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80', true, false)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Gaming & Normal Mice (Categories 10 & 11)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(71, 10, 'TechFix Apex Viper RGB 12000 DPI Gaming Mouse', 'techfix-apex-viper-rgb-gaming-mouse', 'ApexForce', 'ACC-MOU-VPR', 'Ultra-lightweight 65g honeycomb gaming mouse with PixArt 3327 optical sensor, 1000Hz polling rate and paracord cable.', '12000 DPI PixArt Sensor | 6 Programmable Buttons | 16.8M RGB | 65g Ultra-Light', 1499.00, 1999.00, 25, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80', true, true),
(72, 10, 'TechFix Striker Wireless 2.4GHz + BT Gaming Mouse', 'techfix-striker-wireless-gaming-mouse', 'ApexForce', 'ACC-MOU-STRK', 'Dual-mode wireless gaming mouse with 16000 DPI sensor, 70-hour rechargeable battery and PTFE glide skates.', '16000 DPI Optical | 2.4GHz Wireless + Bluetooth | Type-C Fast Charging', 2499.00, 3299.00, 20, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80', true, false),
(73, 11, 'TechFix SilentClick Ergonomic Wireless Mouse', 'techfix-silentclick-wireless-mouse', 'ProTech', 'ACC-MOU-SILENT', 'Quiet 90% noise-reduced click switches with comfortable contoured thumb rest and 18-month battery life on 1 AA cell.', 'Silent Click Switches | 2.4GHz Wireless USB Nano | 1600 DPI | Ergonomic Grip', 599.00, 899.00, 45, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80', true, true),
(74, 11, 'TechFix Classic USB Optical Office Mouse', 'techfix-classic-usb-office-mouse', 'ProTech', 'ACC-MOU-OFFICE', 'Durable 3-button wired USB mouse with 1000 DPI optical tracking for daily school, office, and accounting use.', 'Wired USB-A 1.5m Cable | 1000 DPI Optical | Ambidextrous Design | Plug & Play', 249.00, 399.00, 60, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80', true, false)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Keyboards (Category 12)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(75, 12, 'TechFix Apex MechPro Mechanical RGB Gaming Keyboard', 'techfix-apex-mechpro-rgb-keyboard', 'ApexForce', 'ACC-KBD-MECH', 'Full-size mechanical gaming keyboard with hot-swappable tactile blue switches, per-key RGB backlighting and aluminum top frame.', 'Outemu Blue Mechanical Switches | Per-Key RGB | Double-Shot PBT Keycaps | N-Key Rollover', 2999.00, 3999.00, 20, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', true, true),
(76, 12, 'TechFix QuietType Slim Wireless Keyboard', 'techfix-quiettype-slim-wireless-keyboard', 'ProTech', 'ACC-KBD-SLIM', 'Low-profile scissor switches with dedicated media hotkeys and multi-device Bluetooth switching between PC, tablet & phone.', 'Scissor-Switch Silent Typing | Bluetooth 5.0 + 2.4GHz | Rechargeable Battery', 1599.00, 2199.00, 25, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', true, false),
(77, 12, 'TechFix Standard Spill-Resistant USB Office Keyboard', 'techfix-standard-office-keyboard', 'ProTech', 'ACC-KBD-OFFICE', 'Durable membrane keyboard with laser-etched keys and drain holes to protect against accidental tea or coffee spills.', 'Full Layout with Number Pad | Spill-Resistant Drainage | 10M Keypress Life', 499.00, 699.00, 50, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', true, false)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Gaming & Office Chairs (Categories 13 & 14)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(78, 13, 'TechFix Throne RX Ergonomic Gaming Chair', 'techfix-throne-rx-gaming-chair', 'ApexForce', 'ACC-CHR-THRX', 'High-density molded foam gaming chair with PU leather upholstery, 2D adjustable armrests, Class-4 gas lift, and 160-degree back recline.', 'PU Leather | Class-4 Gas Lift | 160° Recline | Memory Foam Lumbar & Neck Pillows | Max 140kg', 12999.00, 15999.00, 8, 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&auto=format&fit=crop&q=80', true, true),
(79, 14, 'TechFix Ergofit High-Back Breathable Mesh Office Chair', 'techfix-ergofit-mesh-office-chair', 'ProTech', 'ACC-CHR-ERGO', 'Professional ergonomic chair with Korean breathable mesh, dynamic self-adjusting lumbar support, 3D armrests, and synchro-tilt mechanism.', 'Breathable Mesh Back | Dynamic Lumbar Support | Heavy-Duty Chrome Base | Max 130kg', 8999.00, 11499.00, 12, 'https://images.unsplash.com/photo-1580481077197-25e2e88a38db?w=800&auto=format&fit=crop&q=80', true, true)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Mouse Pads (Category 15)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(80, 15, 'TechFix SpeedMat XL Extended Desk Gaming Mat (900x400mm)', 'techfix-speedmat-xl-extended-mousepad', 'ApexForce', 'ACC-PAD-XL', 'Massive extended desk mat with micro-textured cloth surface, stitched anti-fray edges, and non-slip rubber base.', '900 x 400 x 4mm | Water-Repellent Micro-Woven Surface | Anti-Fray Stitched Border', 699.00, 999.00, 35, 'https://images.unsplash.com/photo-1616763355548-1b606f43848c?w=800&auto=format&fit=crop&q=80', true, true),
(81, 15, 'TechFix ChromaGlow RGB Gaming Mouse Pad (800x300mm)', 'techfix-chromaglow-rgb-mousepad', 'ApexForce', 'ACC-PAD-RGB', 'Extended RGB mouse pad with 14 customizable LED lighting modes, one-touch controller, and thick 4mm rubber padding.', '800 x 300 x 4mm | 14 RGB Light Modes | Plug & Play USB | Smooth Glide Texture', 999.00, 1499.00, 25, 'https://images.unsplash.com/photo-1616763355548-1b606f43848c?w=800&auto=format&fit=crop&q=80', true, false),
(82, 15, 'TechFix Ergonomic Memory Foam Wrist Rest Mouse Pad', 'techfix-ergo-wristrest-mousepad', 'ProTech', 'ACC-PAD-WRIST', 'Comfortable gel memory foam mouse pad designed to relieve carpal tunnel strain and wrist fatigue during long typing hours.', 'Memory Foam Wrist Cushion | Non-Slip Polyurethane Base | Lycra Fabric', 349.00, 499.00, 40, 'https://images.unsplash.com/photo-1616763355548-1b606f43848c?w=800&auto=format&fit=crop&q=80', true, false)
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Monitors (Category 16)
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(83, 16, 'TechFix Vision Pro 24" 180Hz IPS Fast Gaming Monitor', 'techfix-vision-pro-24-180hz-gaming-monitor', 'Zenith', 'ACC-MON-24G', 'Frameless 24-inch Fast IPS gaming monitor with 180Hz refresh rate, 0.5ms response time, FreeSync Premium and HDR10 support.', '24" Fast IPS FHD (1920x1080) | 180Hz Refresh | 0.5ms MPRT | 99% sRGB | HDMI + DP', 9999.00, 12999.00, 15, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', true, true),
(84, 16, 'TechFix UltraView 27" 2K QHD 100% sRGB Creator Monitor', 'techfix-ultraview-27-2k-qhd-creator-monitor', 'Zenith', 'ACC-MON-27QHD', '27-inch 2560x1440 QHD IPS display factory color-calibrated for graphic designers, video editors, and coding productivity.', '27" QHD (2560x1440) IPS | 100% sRGB / 95% DCI-P3 | Height Adjustable Stand | Type-C 65W PD', 17999.00, 21999.00, 10, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', true, true),
(85, 16, 'TechFix ClearDesk 22" Full HD Ultra-Slim Office Monitor', 'techfix-cleardesk-22-fhd-office-monitor', 'ProTech', 'ACC-MON-22OFF', 'Sleek 21.5-inch 1080p monitor with Eye Care flicker-free technology, low blue light filter, and VGA + HDMI inputs.', '21.5" Full HD (1920x1080) | 75Hz | Low Blue Light & Flicker-Free | HDMI & VGA', 5999.00, 7499.00, 20, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', true, false)
ON CONFLICT (id) DO NOTHING;

-- 9. Insert Extra PC Components (Hard Drives, Case Fans) into Products (Category 7) and Components Table
INSERT INTO products (id, category_id, name, slug, brand, sku, description, short_description, price, compare_at_price, stock_quantity, image_url, active, featured) VALUES
(86, 7, 'Seagate BarraCuda 2TB 3.5" 7200RPM Internal Hard Drive', 'seagate-barracuda-2tb-hdd', 'Seagate', 'HDD-SEA-2TB', 'High-capacity 2TB 3.5-inch SATA III desktop hard drive for bulky game storage, movies, and cold backups.', '2TB 3.5" SATA 6Gb/s | 7200 RPM | 256MB Cache | 2-Year Warranty', 4899.00, 5699.00, 20, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', true, false),
(87, 7, 'TechFix AeroFlow 120mm ARGB PWM Case Fan (Triple Pack)', 'techfix-aeroflow-120mm-argb-fans-triple', 'Deepcool', 'FAN-RGB-3PK', 'Set of three 120mm PWM fans with hydraulic bearings, addressable RGB sync and anti-vibration rubber pads.', '3x 120mm PWM Fans | 500-1800 RPM | 56 CFM Airflow | 5V 3-Pin ARGB Sync', 1899.00, 2499.00, 30, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', true, false)
ON CONFLICT (id) DO NOTHING;

-- Insert into components table for Custom PC Builder
INSERT INTO components (product_id, component_type, socket, ram_type, form_factor, wattage, gpu_length, cooler_height, storage_interface, m2_slots, power_connectors, active) VALUES
(86, 'hdd', NULL, NULL, '3.5-inch', 10, 0, 0, 'SATA III', 0, NULL, true),
(87, 'fans', NULL, NULL, '120mm', 8, 0, 0, NULL, 0, NULL, true),
(83, 'monitor', NULL, NULL, '24-inch', 25, 0, 0, 'HDMI,DP', 0, NULL, true),
(75, 'keyboard', NULL, NULL, NULL, 5, 0, 0, 'USB', 0, NULL, true),
(71, 'mouse', NULL, NULL, NULL, 3, 0, 0, 'USB', 0, NULL, true)
ON CONFLICT DO NOTHING;

-- Reset sequences
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('components_id_seq', (SELECT MAX(id) FROM components));

-- 10. Insert Specifications for Expanded Products
INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
-- Linux Laptops
(63, 'OS', 'Ubuntu 24.04 LTS Pre-Installed'),
(63, 'CPU', 'Intel Core i5-1335U (10 Cores, up to 4.6GHz)'),
(63, 'RAM', '16GB DDR5 5200MHz Dual Channel'),
(63, 'Storage', '512GB PCIe Gen4 NVMe SSD'),
(63, 'Display', '14.0" IPS Full HD (1920x1080) 100% sRGB'),
(63, 'Kernel', 'Linux 6.8+ Hardware Enabled'),

(64, 'OS', 'Fedora Workstation 40 Pre-Installed'),
(64, 'CPU', 'AMD Ryzen 7 7735U (8 Cores, 16 Threads)'),
(64, 'RAM', '32GB LPDDR5 6400MHz'),
(64, 'Storage', '1TB PCIe 4.0 NVMe SSD'),
(64, 'Display', '15.6" 2.5K (2560x1440) 120Hz IPS'),
(64, 'Desktop', 'GNOME 46 Wayland Native'),

(65, 'OS', 'Linux Mint 21.3 Cinnamon Pre-Installed'),
(65, 'CPU', 'Intel Core i3-1215U (6 Cores)'),
(65, 'RAM', '16GB DDR4 3200MHz'),
(65, 'Storage', '512GB NVMe SSD'),
(65, 'Display', '15.6" Full HD Anti-Glare 250 nits'),

(66, 'OS', 'Debian 12 Bookworm Pre-Installed'),
(66, 'CPU', 'AMD Ryzen 5 7530U (6 Cores, 12 Threads)'),
(66, 'RAM', '16GB DDR4 3200MHz'),
(66, 'Storage', '512GB Gen3 NVMe SSD'),
(66, 'Display', '14.0" IPS Matte Panel'),

-- Linux Pen Drives
(67, 'Distribution', 'Ubuntu 24.04 LTS Desktop 64-bit'),
(67, 'Capacity', '32GB'),
(67, 'USB Interface', 'USB 3.2 Gen 1 (up to 130MB/s read)'),
(67, 'Boot Mode', 'UEFI & Legacy BIOS'),

(68, 'Distribution', 'Linux Mint 21.3 Cinnamon 64-bit'),
(68, 'Capacity', '32GB'),
(68, 'USB Interface', 'USB 3.2 Gen 1'),
(68, 'Boot Mode', 'UEFI & Legacy BIOS'),

(69, 'Distribution', 'Fedora Workstation 40 (GNOME)'),
(69, 'Capacity', '32GB'),
(69, 'USB Interface', 'USB 3.2 Gen 1'),

(70, 'Distribution', 'Debian 12 Bookworm Complete Live'),
(70, 'Capacity', '32GB'),
(70, 'USB Interface', 'USB 3.2 Gen 1'),

-- Gaming Mice
(71, 'DPI', '12,000 DPI (PixArt 3327 Sensor)'),
(71, 'Polling Rate', '1000Hz (1ms Response)'),
(71, 'Weight', '65g Ultra-Light Honeycomb'),
(71, 'RGB', '16.8 Million Colors Dynamic RGB'),

-- Chairs
(78, 'Material', 'Premium Breathable PU Leather'),
(78, 'Recline', '90° - 160° Multi-Angle Lock'),
(78, 'Weight Capacity', '140 kg'),
(78, 'Gas Lift', 'Class-4 Hydraulic Explosion-Proof Piston'),

(79, 'Material', 'High-Elastic Korean Mesh'),
(79, 'Lumbar Support', '2D Dynamic Self-Adjusting Lumbar'),
(79, 'Weight Capacity', '130 kg'),

-- Monitors
(83, 'Screen Size', '24 Inch (60.9 cm)'),
(83, 'Resolution', 'Full HD (1920 x 1080)'),
(83, 'Refresh Rate', '180Hz Fast IPS'),
(83, 'Response Time', '0.5ms MPRT / 1ms GtG'),
(83, 'Ports', '1x DisplayPort 1.4, 2x HDMI 2.0, Audio Out'),

(84, 'Screen Size', '27 Inch (68.5 cm)'),
(84, 'Resolution', '2K QHD (2560 x 1440)'),
(84, 'Color Gamut', '100% sRGB, 95% DCI-P3 Color Calibrated'),
(84, 'Ports', 'USB Type-C 65W PD, DisplayPort, HDMI')
ON CONFLICT DO NOTHING;

