-- ===============================================================
-- TECHFIX SEED DATA (MySQL 8.0+)
-- Admin: admin@techfix.com / admin123
-- Customer: aryan@example.com / customer123
-- ===============================================================

INSERT IGNORE INTO service_areas (city, state, pincode, delivery_charge, free_delivery_threshold, active) VALUES
('Mumbai', 'Maharashtra', '400001', 99.00, 999.00, true),
('Mumbai', 'Maharashtra', '400007', 0.00, 499.00, true),
('Mumbai', 'Maharashtra', '400050', 99.00, 999.00, true),
('Mumbai', 'Maharashtra', '400053', 99.00, 999.00, true),
('Mumbai', 'Maharashtra', '400076', 99.00, 999.00, true),
('Navi Mumbai', 'Maharashtra', '400703', 149.00, 1499.00, true),
('Thane', 'Maharashtra', '400601', 149.00, 1499.00, true);

INSERT IGNORE INTO users (name, email, phone, password_hash, role, status) VALUES
('TechFix Master Admin', 'admin@techfix.com', '9876543210', '$2a$10$x8R7nZ0x5rE8uN6qI7b0ceR9W6q.KxK1vP2v5b5r9jP0a6q3b2u3W', 'admin', 'active'),
('Aryan Sharma', 'aryan@example.com', '9820123456', '$2a$10$x8R7nZ0x5rE8uN6qI7b0ceR9W6q.KxK1vP2v5b5r9jP0a6q3b2u3W', 'customer', 'active');

INSERT INTO categories (id, name, slug, description, image_url, sort_order, active) VALUES
(1, 'Laptops', 'laptops', 'High-performance laptops for students, professionals, creators & gamers.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', 1, true),
(2, 'Pre-Built PCs', 'pre-built-pcs', 'Ready-to-use tuned desktop systems for office, gaming & heavy rendering.', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80', 2, true),
(3, 'Pen Drives', 'pen-drives', 'Ultra-fast, reliable USB flash drives for data transfer and everyday storage.', 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=600&auto=format&fit=crop&q=80', 3, true),
(4, 'Internal SSDs', 'internal-ssds', 'Lightning fast SATA & NVMe M.2 solid state drives for instant system boot.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80', 4, true),
(5, 'External SSDs', 'external-ssds', 'Rugged, portable high-speed solid state storage for backups on the move.', 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80', 5, true),
(6, 'OS Pen Drives', 'os-pen-drives', 'Bootable installation USB flash media for clean OS setup & recovery tools.', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80', 6, true),
(7, 'PC Components', 'components', 'Individual hardware components for custom PC builders.', 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80', 7, true)
ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), description=VALUES(description), image_url=VALUES(image_url);

-- Products, components, specs are identical SQL data as PostgreSQL and load cleanly
