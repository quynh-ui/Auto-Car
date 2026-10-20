# AUTO SMART – Hệ Thống Mua Bán & Tư Vấn Ô Tô Thông Minh

Website showroom ô tô cao cấp tích hợp Chatbot AI RAG, kiến trúc Serverless 100% triển khai trên **Cloudflare Workers**, **Cloudflare D1**, **Cloudflare R2**, **Cloudflare Vectorize** và **Workers AI**.

---

## 1. Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend Edge**: Cloudflare Workers + Hono framework.
- **Database**: Cloudflare D1 (SQLite Edge).
- **Lưu trữ hình ảnh**: Cloudflare R2 Bucket.
- **AI Chatbot**: Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`).
- **Semantic Vector Search**: Cloudflare Vectorize + Embedding (`@cf/baai/bge-m3` - 1024 chiều).
- **Bảo mật**: Web Crypto API, PBKDF2 100.000 rounds, JWT Auth.

---

## 2. Hướng Dẫn Cài Đặt & Phát Triển (Dành Cho Android Studio & Windows PowerShell)

### Bước 1: Mở dự án trong visual Studio
1. Mở **Visual Studio** trên máy tính Windows.
2. Chọn **File -> Open...**, điều hướng đến thư mục dự án `auto-smart` và nhấn **OK**.
3. Mở cửa sổ **Terminal** tích hợp sẵn ở thanh công cụ dưới đáy của Android Studio (mặc định là PowerShell).

### Bước 2: Cài đặt Node.js & Dependencies
Đảm bảo máy tính đã cài đặt **Node.js LTS (phiên bản 20 trở lên)**:
```powershell
# Kiểm tra phiên bản Node và npm
node -v
npm -v

# Cài đặt tất cả thư viện dự án
npm install
```

### Bước 3: Chạy môi trường Development trên máy cục bộ
```powershell
npm run dev
```
Trình duyệt sẽ mở website tại: `http://localhost:3000`.

---

## 3. Quy Trình Khởi Tạo & Triển Khai Lên Cloudflare

Thực hiện các lệnh sau lần lượt trong PowerShell để liên kết tài nguyên Cloudflare thật:

### Bước 4: Đăng nhập Cloudflare Wrangler CLI
```powershell
npx wrangler login
```
*(Trình duyệt sẽ tự động mở trang cấp quyền xác thực tài khoản Cloudflare)*

### Bước 5: Tạo cơ sở dữ liệu Cloudflare D1
```powershell
npx wrangler d1 create auto-smart-db
```
*Ghi lại chuỗi `database_id` được sinh ra, mở file `wrangler.jsonc` và thay thế vào mục `database_id`.*

### Bước 6: Chạy Database Migration khởi tạo 11 bảng dữ liệu
```powershell
# Thực thi migration lên D1 Cloudflare Production
npx wrangler d1 execute auto-smart-db --remote --file=./migrations/0001_initial_schema.sql
```

### Bước 7: Tạo Cloudflare R2 Bucket lưu trữ hình ảnh xe
```powershell
npx wrangler r2 bucket create auto-smart-cars
```

### Bước 8: Tạo Cloudflare Vectorize Index (Embedding 1024 chiều)
Mô hình `@cf/baai/bge-m3` sử dụng kích thước vector 1024 chiều và độ đo khoảng cách Cosine:
```powershell
npx wrangler vectorize create auto-smart-embeddings --dimensions=1024 --metric=cosine
```

### Bước 9: Thiết lập Secret bảo mật JWT_SECRET
```powershell
npx wrangler secret put JWT_SECRET
# Nhập chuỗi khóa bí mật (ví dụ: auto-smart-super-secret-key-2026) khi được hỏi
```

### Bước 10: Build ứng dụng Frontend
```powershell
npm run build
```

### Bước 11: Deploy toàn bộ website lên Cloudflare Workers
```powershell
npx wrangler deploy
```

---

## 4. Tài Khoản Kiểm Thử Mặc Định (Demo)

Hệ thống có sẵn tính năng chuyển vai trò 1-click tại góc trên bên phải thanh Navbar, hoặc đăng nhập trực tiếp:

| Vai trò | Email | Quyền Hạn |
| :--- | :--- | :--- |
| **Admin Tổng** | `admin@autosmart.vn` | Toàn quyền quản trị kho xe, duyệt lịch lái thử, đồng bộ Vectorize AI, xem biểu đồ doanh số. |
| **Seller / Đại Lý** | `seller@autosmart.vn` | Đăng bán xe mới, cập nhật tình trạng xe của mình, quản lý ảnh R2. |
| **Khách Hàng** | `khachhang@autosmart.vn` | Xem kho xe, so sánh tối đa 3 xe, lưu yêu thích, đặt lịch lái thử, chat RAG. |

---

## 5. Cấu Trúc Thư Mục

```
auto-smart/
├── src/
│   ├── components/      # Navbar, CarCard, CarFilter, CarDetailModal, ComparisonModal, TestDriveModal, ChatWidget, AdminDashboard, Footer
│   ├── contexts/        # AuthContext, CompareContext, FavoritesContext
│   ├── data/            # mockCars.ts (Hồ sơ xe và thông số chuẩn)
│   ├── pages/           # HomePage, InventoryPage, BookingsPage, FavoritesPage, AboutContactPages
│   ├── services/        # api.ts, ragBot.ts (Bộ phân tích RAG ngôn ngữ tự nhiên tiếng Việt)
│   ├── types/           # index.ts (TypeScript interface & type definitions)
│   ├── App.tsx          # Component gốc điều hướng và quản lý trạng thái
│   ├── index.css        # Tailwind CSS v4 styling & dark theme
│   └── main.tsx         # React root mounting
├── worker/
│   └── index.ts         # Cloudflare Workers + Hono REST API + Web Crypto + D1 + R2 + AI
├── migrations/
│   └── 0001_initial_schema.sql # 11 bảng Cloudflare D1 SQL schema
├── wrangler.jsonc       # Cấu hình Cloudflare Workers, Assets, D1, R2, AI, Vectorize
└── package.json
```
