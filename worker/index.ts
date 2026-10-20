import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign, verify } from 'hono/jwt';

// Cloudflare Workers Type Definitions
export type D1Database = any;
export type R2Bucket = any;

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI: any; // Cloudflare Workers AI binding
  VECTORIZE: any; // Cloudflare Vectorize index binding
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ==========================================
// 1. WEB CRYPTO PBKDF2 UTILS
// ==========================================
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/register', async (c) => {
  const body = await c.req.json();
  const { email, password, name, phone, role } = body;

  if (!email || !password || !name) {
    return c.json({ error: 'Thiếu thông tin bắt buộc' }, 400);
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = `user-${Date.now()}`;
  const userRole = role === 'SELLER' ? 'SELLER' : 'CUSTOMER';

  try {
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, salt, name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, email, passwordHash, salt, name, phone || null, userRole).run();

    const token = await sign(
      { id: userId, email, role: userRole, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      c.env.JWT_SECRET || 'autosmart-default-jwt-secret-cf'
    );

    return c.json({
      user: { id: userId, email, name, phone, role: userRole },
      token,
    });
  } catch (err: any) {
    return c.json({ error: 'Email đã tồn tại hoặc lỗi hệ thống', details: err.message }, 400);
  }
});

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  const user: any = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

  if (!user) {
    return c.json({ error: 'Email hoặc mật khẩu không chính xác' }, 401);
  }

  const hashed = await hashPassword(password, user.salt);
  if (hashed !== user.password_hash) {
    return c.json({ error: 'Email hoặc mật khẩu không chính xác' }, 401);
  }

  const token = await sign(
    { id: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    c.env.JWT_SECRET || 'autosmart-default-jwt-secret-cf'
  );

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
    token,
  });
});

app.get('/api/auth/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Chưa đăng nhập' }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const payload = await verify(token, c.env.JWT_SECRET || 'autosmart-default-jwt-secret-cf', 'HS256');
    const user = await c.env.DB.prepare('SELECT id, email, name, role, phone, avatar FROM users WHERE id = ?').bind(payload.id).first();
    return c.json({ user });
  } catch {
    return c.json({ error: 'Phiên làm việc hết hạn' }, 401);
  }
});

// ==========================================
// 3. BRANDS & CARS ROUTES
// ==========================================
app.get('/api/brands', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM brands ORDER BY sort_order ASC').all();
  return c.json(result.results);
});

app.get('/api/cars', async (c) => {
  const query = c.req.query('query');
  const brand = c.req.query('brand');
  const minPrice = c.req.query('minPrice');
  const maxPrice = c.req.query('maxPrice');
  const bodyType = c.req.query('bodyType');
  const fuel = c.req.query('fuel');
  const seats = c.req.query('seats');

  let sql = 'SELECT * FROM cars WHERE status != "HIDDEN"';
  const params: any[] = [];

  if (query) {
    sql += ' AND (title LIKE ? OR model LIKE ? OR location LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }
  if (brand && brand !== 'all') {
    sql += ' AND brand_id = ?';
    params.push(brand.toLowerCase());
  }
  if (minPrice) {
    sql += ' AND price >= ?';
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(parseFloat(maxPrice));
  }
  if (bodyType && bodyType !== 'all') {
    sql += ' AND body_type = ?';
    params.push(bodyType);
  }
  if (fuel && fuel !== 'all') {
    sql += ' AND fuel = ?';
    params.push(fuel);
  }
  if (seats) {
    sql += ' AND seats = ?';
    params.push(parseInt(seats, 10));
  }

  sql += ' ORDER BY created_at DESC';

  const stmt = c.env.DB.prepare(sql);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  const result = await bound.all();

  return c.json(result.results);
});

app.get('/api/cars/:id', async (c) => {
  const id = c.req.param('id');
  const car = await c.env.DB.prepare('SELECT * FROM cars WHERE id = ?').bind(id).first();
  if (!car) return c.json({ error: 'Không tìm thấy xe' }, 404);
  return c.json(car);
});

// ==========================================
// 4. TEST DRIVE BOOKINGS ROUTES
// ==========================================
app.post('/api/bookings', async (c) => {
  const body = await c.req.json();
  const id = `book-${Date.now()}`;

  await c.env.DB.prepare(
    `INSERT INTO test_drive_bookings 
     (id, car_id, user_id, customer_name, customer_phone, customer_email, preferred_date, preferred_time, branch, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`
  ).bind(
    id,
    body.carId,
    body.userId || null,
    body.customerName,
    body.customerPhone,
    body.customerEmail || null,
    body.preferredDate,
    body.preferredTime,
    body.branch,
    body.notes || null
  ).run();

  return c.json({ id, status: 'PENDING', message: 'Đặt lịch thành công' });
});

// ==========================================
// 5. CLOUDFLARE R2 IMAGE UPLOAD
// ==========================================
app.post('/api/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;

  if (!file) return c.json({ error: 'Vui lòng chọn file' }, 400);

  const key = `cars/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  await c.env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  // URL công khai của R2 (hoặc custom domain)
  const imageUrl = `https://r2.autosmart.vn/${key}`;
  return c.json({ url: imageUrl, key });
});

// ==========================================
// 6. CHATBOT AI RAG (Workers AI + Vectorize)
// ==========================================
app.post('/api/chat', async (c) => {
  const body = await c.req.json();
  const { prompt, history } = body;
  if (!prompt) return c.json({ error: 'Vui lòng nhập câu hỏi' }, 400);

  let vectorMatches: any[] = [];
  try {
    // 1. Tạo embedding bằng model @cf/baai/bge-m3
    if (c.env.AI && c.env.VECTORIZE) {
      const embeddings = await c.env.AI.run('@cf/baai/bge-m3', {
        text: [prompt],
      });
      const vector = embeddings.data[0];

      // 2. Tra cứu semantic match từ Cloudflare Vectorize
      const vecRes = await c.env.VECTORIZE.query(vector, { topK: 5 });
      vectorMatches = vecRes.matches || [];
    }
  } catch (e) {
    // Graceful fallback nếu Vectorize chưa khởi tạo
  }

  // 3. Đọc dữ liệu xe thực tế từ Cloudflare D1
  const cars: any = await c.env.DB.prepare('SELECT * FROM cars WHERE status = "AVAILABLE" LIMIT 16').all();
  const carList = cars.results || [];

  // 4. Gọi LLM tạo phản hồi tư vấn tiếng Việt chuẩn xác
  let botReply = '';
  try {
    if (c.env.AI) {
      const systemPrompt = `Bạn là Trợ Lý Cố Vấn Bán Xe & Chuyên Gia Thẩm Định Ô Tô Cao Cấp AUTO SMART tại Việt Nam.
NGUYÊN TẮC:
1. Bạn CHỈ ĐƯỢC PHÉP tư vấn các xe có trong dữ liệu hệ thống bên dưới. Tuyệt đối không tự bịa giá hoặc dòng xe không có trong kho.
2. Nắm rõ quy định tại Việt Nam:
   - Xe điện (VinFast) được miễn 100% lệ phí trước bạ.
   - Xe xăng: Lệ phí trước bạ Hà Nội là 12%, TP.HCM & Tỉnh là 10%. Biển số Hà Nội & TP.HCM là 20 triệu, Tỉnh là 1 triệu.
   - Trả góp: Hỗ trợ vay tối đa 70-80% trong 5-8 năm, lãi suất từ 7.5% - 8.5%/năm.
   - Showroom cam kết 176 hạng mục: 100% không đâm đụng, không ngập nước, bảo hành 12 tháng / 20.000km, đổi trả 7 ngày.
3. Trả lời bằng tiếng Việt lịch sự, chuyên nghiệp, cấu trúc rõ ràng với gạch đầu dòng và tiêu đề in đậm.
DỮ LIỆU KHO XE AUTO SMART:
${JSON.stringify(carList.map((r: any) => ({
  title: r.title,
  model: r.model,
  brand: r.brand,
  year: r.year,
  price: r.price,
  seats: r.seats,
  fuel: r.fuel,
  body: r.body_type,
  condition: r.condition,
  location: r.location
})))}`;

      const chatMessages: any[] = [{ role: 'system', content: systemPrompt }];

      // Nạp lịch sử trò chuyện gần nhất (nếu có)
      if (Array.isArray(history) && history.length > 0) {
        const recent = history.slice(-6);
        for (const h of recent) {
          if (h.sender === 'user') {
            chatMessages.push({ role: 'user', content: h.text });
          } else if (h.sender === 'bot') {
            chatMessages.push({ role: 'assistant', content: h.text });
          }
        }
      }

      chatMessages.push({ role: 'user', content: prompt });

      const aiResponse = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: chatMessages,
      });
      botReply = aiResponse.response;
    }
  } catch (e) {
    botReply = 'Dựa trên kho xe AUTO SMART hiện có, xin gợi ý các dòng xe phù hợp với nhu cầu của bạn.';
  }

  // Khớp các xe được nhắc đến trong câu trả lời hoặc câu hỏi
  const promptLower = prompt.toLowerCase();
  const replyLower = (botReply || '').toLowerCase();

  const matched = carList.filter((r: any) =>
    replyLower.includes(r.title.toLowerCase()) ||
    replyLower.includes(r.model.toLowerCase()) ||
    promptLower.includes(r.model.toLowerCase())
  );

  return c.json({
    text: botReply,
    matchedCars: matched.length > 0 ? matched.slice(0, 4) : carList.slice(0, 3),
  });
});

export default app;
