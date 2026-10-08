-- ===============================================================
-- TECHFIX DATABASE SCHEMA (PostgreSQL)
-- "Buy. Build. Repair. Delivered."
-- ===============================================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS support_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS repair_images CASCADE;
DROP TABLE IF EXISTS repair_requests CASCADE;
DROP TABLE IF EXISTS custom_build_items CASCADE;
DROP TABLE IF EXISTS custom_builds CASCADE;
DROP TABLE IF EXISTS compatibility_rules CASCADE;
DROP TABLE IF EXISTS components CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_specs CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS service_areas CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- 2. SERVICE AREAS
CREATE TABLE service_areas (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) UNIQUE NOT NULL,
    delivery_charge NUMERIC(10, 2) DEFAULT 0.00,
    free_delivery_threshold NUMERIC(10, 2) DEFAULT 999.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_areas_pincode ON service_areas(pincode);

-- 3. ADDRESSES
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    area VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(150),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- 4. CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- 5. PRODUCTS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= price),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    is_custom_build BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);

-- 6. PRODUCT IMAGES
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0
);

-- 7. PRODUCT SPECS
CREATE TABLE product_specs (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    spec_key VARCHAR(100) NOT NULL,
    spec_value TEXT NOT NULL
);

CREATE INDEX idx_product_specs_pid ON product_specs(product_id);

-- 8. COMPONENTS (FOR CUSTOM PC BUILDER)
CREATE TABLE components (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- cpu, motherboard, ram, gpu, ssd, hdd, psu, cooler, cabinet, os, fans
    socket VARCHAR(50),                 -- e.g. AM4, AM5, LGA1700, LGA1200
    ram_type VARCHAR(50),               -- e.g. DDR4, DDR5
    form_factor VARCHAR(50),            -- e.g. ATX, Micro-ATX, Mini-ITX
    wattage INT DEFAULT 0,              -- Power draw or PSU wattage
    gpu_length INT DEFAULT 0,           -- mm
    cooler_height INT DEFAULT 0,        -- mm
    storage_interface VARCHAR(50),      -- SATA, NVMe PCIe 4.0, NVMe PCIe 3.0
    m2_slots INT DEFAULT 0,
    power_connectors VARCHAR(100),
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_components_type ON components(component_type);

-- 9. COMPATIBILITY RULES
CREATE TABLE compatibility_rules (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL,     -- socket_match, ram_type_match, wattage_check, form_factor_check
    source_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info'))
);

-- 10. ORDERS
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'COD' CHECK (payment_method = 'COD'),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'collected', 'failed')),
    order_status VARCHAR(30) DEFAULT 'Order Placed' CHECK (order_status IN ('Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled')),
    delivery_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_num ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);

-- 11. ORDER ITEMS
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL,
    custom_build_details JSONB
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 12. CUSTOM BUILDS / SAVED BUILDS
CREATE TABLE custom_builds (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    assembly_fee NUMERIC(10, 2) DEFAULT 999.00,
    total_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'saved' CHECK (status IN ('saved', 'ordered', 'archived')),
    configuration JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. REPAIR REQUESTS
CREATE TABLE repair_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- Laptop, Desktop, Custom PC, etc.
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    problem_category VARCHAR(100) NOT NULL,
    problem_description TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time VARCHAR(50) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'Request Received' CHECK (status IN (
        'Request Received', 'Pickup Scheduled', 'Picked Up', 'Diagnosis',
        'Estimate Prepared', 'Customer Approval Required', 'Repair In Progress',
        'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'
    )),
    diagnosis TEXT,
    estimate_amount NUMERIC(10, 2),
    customer_approved BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_repair_req_num ON repair_requests(request_number);
CREATE INDEX idx_repair_status ON repair_requests(status);

-- 14. REPAIR IMAGES
CREATE TABLE repair_images (
    id SERIAL PRIMARY KEY,
    repair_request_id INT REFERENCES repair_requests(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. SUPPORT TICKETS
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    order_number VARCHAR(50),
    repair_request_number VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_tickets_num ON support_tickets(ticket_number);

-- 16. SUPPORT MESSAGES
CREATE TABLE support_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. PRODUCT REVIEWS
CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. NOTIFICATIONS
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
