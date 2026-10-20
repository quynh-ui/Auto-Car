-- ====================================================================
-- AUTO SMART - Database Migration 0001 (Cloudflare D1 / SQLite)
-- Hệ thống mua bán và tư vấn ô tô thông minh
-- ====================================================================

-- 1. BẢNG USERS (Người dùng hệ thống)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK(role IN ('ADMIN', 'SELLER', 'CUSTOMER')) NOT NULL DEFAULT 'CUSTOMER',
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. BẢNG BRANDS (Hãng xe)
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  logo TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG CAR_CATEGORIES (Phân khúc xe)
CREATE TABLE IF NOT EXISTS car_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG CARS (Danh mục ô tô)
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT,
  year INTEGER NOT NULL,
  price REAL NOT NULL, -- VND
  body_type TEXT CHECK(body_type IN ('Sedan', 'SUV', 'Hatchback', 'MPV', 'Pickup')) NOT NULL,
  condition TEXT CHECK(condition IN ('Mới 100%', 'Đã qua sử dụng')) NOT NULL DEFAULT 'Mới 100%',
  mileage INTEGER DEFAULT 0, -- km
  fuel TEXT CHECK(fuel IN ('Xăng', 'Dầu', 'Điện', 'Hybrid')) NOT NULL,
  transmission TEXT CHECK(transmission IN ('Tự động', 'Số sàn')) NOT NULL DEFAULT 'Tự động',
  seats INTEGER NOT NULL DEFAULT 5,
  color TEXT,
  origin TEXT DEFAULT 'Lắp ráp trong nước',
  description TEXT,
  specs_json TEXT, -- JSON thông số kỹ thuật (động cơ, mô-men, kích thước, ...)
  features_json TEXT, -- JSON mảng tính năng (ADAS, 11 túi khí, ...)
  location TEXT NOT NULL DEFAULT 'Hà Nội',
  status TEXT CHECK(status IN ('AVAILABLE', 'SOLD', 'HIDDEN')) NOT NULL DEFAULT 'AVAILABLE',
  seller_id TEXT NOT NULL,
  is_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_brand_id ON cars(brand_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_seats ON cars(seats);
CREATE INDEX IF NOT EXISTS idx_cars_fuel ON cars(fuel);
CREATE INDEX IF NOT EXISTS idx_cars_body_type ON cars(body_type);

-- 5. BẢNG CAR_IMAGES (Hình ảnh xe lưu trữ R2)
CREATE TABLE IF NOT EXISTS car_images (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);

-- 6. BẢNG FAVORITES (Xe yêu thích của khách hàng)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  car_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, car_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- 7. BẢNG TEST_DRIVE_BOOKINGS (Lịch hẹn lái thử)
CREATE TABLE IF NOT EXISTS test_drive_bookings (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  branch TEXT NOT NULL,
  notes TEXT,
  status TEXT CHECK(status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON test_drive_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON test_drive_bookings(preferred_date);

-- 8. BẢNG CONTACT_REQUESTS (Yêu cầu tư vấn)
CREATE TABLE IF NOT EXISTS contact_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  content TEXT NOT NULL,
  status TEXT CHECK(status IN ('NEW', 'PROCESSING', 'RESOLVED')) NOT NULL DEFAULT 'NEW',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG CHAT_SESSIONS (Phiên trò chuyện AI RAG)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. BẢNG CHAT_MESSAGES (Lịch sử tin nhắn AI)
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  sender TEXT CHECK(sender IN ('user', 'bot')) NOT NULL,
  text TEXT NOT NULL,
  matched_cars_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- 11. BẢNG CAR_INDEX_JOBS (Nhật ký đồng bộ Vectorize AI)
CREATE TABLE IF NOT EXISTS car_index_jobs (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL,
  operation TEXT CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE', 'REINDEX')) NOT NULL,
  status TEXT CHECK(status IN ('PENDING', 'PROCESSED', 'FAILED')) NOT NULL DEFAULT 'PENDING',
  vector_id TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);

-- SEED DỮ LIỆU DEMO MẪU (Được đánh dấu rõ ràng là dữ liệu demo kiểm thử)
INSERT OR IGNORE INTO brands (id, name, country, logo, sort_order) VALUES
('vinfast', 'VinFast', 'Việt Nam', '⚡', 1),
('toyota', 'Toyota', 'Nhật Bản', '🚗', 2),
('honda', 'Honda', 'Nhật Bản', '🏎️', 3),
('hyundai', 'Hyundai', 'Hàn Quốc', '🚙', 4),
('kia', 'Kia', 'Hàn Quốc', '✨', 5),
('mazda', 'Mazda', 'Nhật Bản', '🦅', 6),
('ford', 'Ford', 'Mỹ', '🛻', 7),
('bmw', 'BMW', 'Đức', '🇩🇪', 8),
('mercedes', 'Mercedes-Benz', 'Đức', '⭐', 9);

INSERT OR IGNORE INTO car_categories (id, name, description) VALUES
('suv', 'SUV / Crossover', 'Xe gầm cao đa dụng thể thao'),
('sedan', 'Sedan', 'Xe 4-5 chỗ thanh lịch 3 khoang'),
('mpv', 'MPV', 'Xe đa dụng chuyên chở gia đình'),
('pickup', 'Pickup', 'Xe bán tải đa địa hình');
