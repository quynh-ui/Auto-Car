import { Car, ChatMessage } from '../types';
import { GoogleGenAI } from '@google/genai';

export interface RAGQueryAnalysis {
  maxPrice?: number;
  minPrice?: number;
  seats?: number;
  brand?: string;
  fuel?: string;
  bodyType?: string;
  color?: string;
  yearMin?: number;
  isComparison?: boolean;
  isAvailabilityCheck?: boolean;
  isFuelEconomy?: boolean;
  isRolloutCost?: boolean;
  isInstallment?: boolean;
  isMonthlyCost?: boolean;
  isInspectionOrWarranty?: boolean;
  isFengShui?: boolean;
  location?: 'Hà Nội' | 'TP. Hồ Chí Minh' | 'Tỉnh khác';
  targetCarName?: string;
  useCase?: 'service' | 'family' | 'new_driver' | 'business' | 'offroad' | 'commute';
}

export interface RolloutEstimate {
  carTitle: string;
  carId?: string;
  basePrice: number;
  location: string;
  regTaxRate: number;
  regTax: number; // Thuế trước bạ (Xe điện 0%, Xe xăng HN 12%, HCM/Tỉnh 10%)
  plateFee: number; // Phí biển số (HN/HCM 20tr, Tỉnh 1tr)
  roadFee: number; // Phí bảo trì đường bộ 1 năm (1.560.000 VND)
  regFee: number; // Phí kiểm định (340.000 VND)
  insuranceFee: number; // Bảo hiểm TNDS bắt buộc (480.700 - 873.400 VND)
  totalRollout: number; // Tổng chi phí lăn bánh
  minMonthlyPay: number; // Dự toán góp mỗi tháng
  downPayment20: number; // Trả trước 20%
  downPayment30: number; // Trả trước 30%
}

export interface MonthlyCostEstimate {
  carTitle: string;
  fuelOrChargingCost: number; // Chi phí xăng / sạc điện (~1.200km/tháng)
  parkingCost: number; // Gửi xe cố định
  maintenanceCost: number; // Bảo dưỡng định kỳ chia theo tháng
  insuranceAndRoadCost: number; // Bảo hiểm & phí đường bộ
  totalMonthlyCost: number;
  fuelNote: string;
}

export interface ComparisonDetail {
  carA: Car;
  carB: Car;
  priceDiff: number;
  prosA: string[];
  prosB: string[];
  verdict: string;
}

export interface RAGExecutionResult {
  text: string;
  matchedCars: Car[];
  suggestions: string[];
  rolloutEstimate?: RolloutEstimate;
  monthlyCostEstimate?: MonthlyCostEstimate;
  comparisonData?: ComparisonDetail;
  showInspectionBadge?: boolean;
}

export function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billion = amount / 1_000_000_000;
    return `${billion % 1 === 0 ? billion.toFixed(0) : billion.toFixed(2)} tỷ VND`;
  }
  const million = Math.round(amount / 1_000_000);
  return `${million} triệu VND`;
}

export function formatVNDCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

/**
 * Tính toán chi phí lăn bánh chính xác theo quy định Việt Nam theo 3 khu vực:
 * - Hà Nội: Thuế trước bạ 12%, biển số 20 triệu
 * - TP. Hồ Chí Minh: Thuế trước bạ 10%, biển số 20 triệu
 * - Tỉnh / Thành khác: Thuế trước bạ 10%, biển số 1 triệu
 * (Xe điện miễn 100% lệ phí trước bạ theo chính sách chính phủ)
 */
export function calculateRolloutCost(car: Car, location: string = 'Hà Nội'): RolloutEstimate {
  const isEV = car.fuel === 'Điện';
  const isHN = location.toLowerCase().includes('hà nội') || location.toLowerCase().includes('hn');
  const isHCM = location.toLowerCase().includes('hồ chí minh') || location.toLowerCase().includes('hcm') || location.toLowerCase().includes('sài gòn');

  const regTaxRate = isEV ? 0 : (isHN ? 0.12 : 0.10);
  const regTax = Math.round(car.price * regTaxRate);
  const plateFee = (isHN || isHCM) ? 20_000_000 : 1_000_000;
  const roadFee = 1_560_000; // 1 năm cá nhân
  const regFee = 340_000; // Đăng kiểm
  const insuranceFee = car.seats <= 5 ? 480_700 : 873_400; // TNDS

  const totalRollout = car.price + regTax + plateFee + roadFee + regFee + insuranceFee;

  // Dự toán góp tháng: vay 70% trong 5 năm (60 tháng), lãi suất ưu đãi 8.0%/năm
  const loanAmount = car.price * 0.7;
  const monthlyPrincipal = loanAmount / 60;
  const monthlyInterest = loanAmount * (0.08 / 12);
  const minMonthlyPay = Math.round(monthlyPrincipal + monthlyInterest);

  const locName = isHN ? 'Hà Nội' : isHCM ? 'TP. Hồ Chí Minh' : 'Tỉnh khác';

  return {
    carTitle: car.title,
    carId: car.id,
    basePrice: car.price,
    location: locName,
    regTaxRate,
    regTax,
    plateFee,
    roadFee,
    regFee,
    insuranceFee,
    totalRollout,
    minMonthlyPay,
    downPayment20: Math.round(car.price * 0.2 + (totalRollout - car.price)),
    downPayment30: Math.round(car.price * 0.3 + (totalRollout - car.price)),
  };
}

/**
 * Tính toán chi phí nuôi xe hàng tháng ước tính (chạy ~1.200 km/tháng)
 */
export function calculateMonthlyOwnershipCost(car: Car): MonthlyCostEstimate {
  const isEV = car.fuel === 'Điện';
  const isDiesel = car.fuel === 'Dầu';
  const isLuxury = car.brand.toLowerCase() === 'mercedes' || car.brand.toLowerCase() === 'bmw';

  let fuelOrChargingCost = 2_000_000;
  let fuelNote = '';

  if (isEV) {
    fuelOrChargingCost = 500_000; // ~400đ/km
    fuelNote = 'Sạc điện cực rẻ (~400đ/km, rẻ hơn xe xăng 75%)';
  } else if (isDiesel) {
    fuelOrChargingCost = 1_800_000;
    fuelNote = 'Dầu Diesel kinh tế (~1.400đ/km, máy khỏe tiết kiệm)';
  } else if (isLuxury) {
    fuelOrChargingCost = 3_500_000;
    fuelNote = 'Xăng RON 95 cao cấp (~2.800đ/km, vận hành phấn khích)';
  } else {
    fuelOrChargingCost = 2_200_000;
    fuelNote = 'Xăng RON 95 (~1.700đ/km, chuẩn mức tiêu thụ hỗn hợp)';
  }

  const parkingCost = 1_500_000; // Gửi xe cố định chung cư/bãi
  const maintenanceCost = isEV ? 300_000 : (isLuxury ? 1_500_000 : 600_000);
  const insuranceAndRoadCost = isLuxury ? 1_200_000 : 500_000; // Bảo hiểm thân vỏ + TNDS + đường bộ

  const totalMonthlyCost = fuelOrChargingCost + parkingCost + maintenanceCost + insuranceAndRoadCost;

  return {
    carTitle: car.title,
    fuelOrChargingCost,
    parkingCost,
    maintenanceCost,
    insuranceAndRoadCost,
    totalMonthlyCost,
    fuelNote,
  };
}

function parsePriceUnit(unit: string): number {
  const u = unit.toLowerCase();
  if (['tỷ', 'tỉ', 'tỏi'].includes(u)) return 1_000_000_000;
  if (['k', 'nghìn', 'ngàn'].includes(u)) return 1_000;
  if (['đ', 'đồng', 'vnd'].includes(u)) return 1;
  return 1_000_000; // triệu, tr, củ, chai
}

/**
 * Phân tích chuyên sâu câu hỏi tiếng Việt có hỗ trợ Context & Đại từ liên kết
 */
export function analyzeUserPrompt(prompt: string, contextCar?: Car): RAGQueryAnalysis {
  const p = prompt.toLowerCase().replace(/\s+/g, ' ');
  const analysis: RAGQueryAnalysis = {};

  // 1. Phân tích ngữ cảnh đại từ liên kết ("xe này", "con đó", "nó", "xe vừa tìm", "xe thứ nhất", "chiếc này")
  const hasPronounRef = /(xe này|con này|chiếc này|xe đó|con đó|chiếc đó|nó|em này|bản này|mẫu này|xe đầu|con đầu)/i.test(p);
  if (hasPronounRef && contextCar) {
    analysis.targetCarName = contextCar.model;
  }

  // 2. Phân tích giá cả đa dạng (triệu, tr, củ, chai, tỷ, tỉ, tỏi, k, nghìn, ngàn, đ, đồng, vnd)
  if (/(không có tiền|0 đồng|0đ|miễn phí|0 vnd|free|tay trắng)/i.test(p)) {
    analysis.maxPrice = 0;
  } else {
    // Dạng khoảng giá: "từ 500 đến 800 triệu", "500 - 700 củ", "tầm 1 tỷ đến 1.5 tỷ"
    const rangeMatch = p.match(/(?:từ|khoảng|tầm)?\s*(\d+(?:[.,]\d+)?)\s*(?:đến|-|tới)\s*(\d+(?:[.,]\d+)?)\s*(tỷ|tỉ|tỏi|triệu|tr|củ|chai|k|nghìn|ngàn)/i);
    if (rangeMatch) {
      const minVal = parseFloat(rangeMatch[1].replace(',', '.'));
      const maxVal = parseFloat(rangeMatch[2].replace(',', '.'));
      const mult = parsePriceUnit(rangeMatch[3]);
      analysis.minPrice = minVal * mult;
      analysis.maxPrice = maxVal * mult;
    } else {
      // Dạng chặn trên: "dưới 700 củ", "tối đa 1 tỷ 5", "tài chính 600tr", "tôi có 100k", "có 500k"
      const maxPriceMatch = p.match(/(?:dưới|tối đa|không quá|nhỏ hơn|ít hơn|ngân sách|tài chính|tầm|khoảng|có|quay đầu)\s*(\d+(?:[.,]\d+)?)\s*(tỷ|tỉ|tỏi|triệu|tr|củ|chai|k|nghìn|ngàn|vnd|đồng|đ)(?![a-zA-ZÀ-ỹ0-9_])/i);
      if (maxPriceMatch) {
        const val = parseFloat(maxPriceMatch[1].replace(',', '.'));
        const mult = parsePriceUnit(maxPriceMatch[2]);
        const base = val * mult;
        if ((p.includes('khoảng') || p.includes('tầm')) && base >= 100_000_000) {
          analysis.maxPrice = Math.round(base * 1.15);
          analysis.minPrice = Math.round(base * 0.7);
        } else {
          analysis.maxPrice = base;
        }
      } else {
        // Số tiền độc lập: "500 triệu", "600 củ", "1 tỏi 2", "100k", "500k"
        const standaloneMatch = p.match(/(?:^|[^a-zA-ZÀ-ỹ0-9_])(\d+(?:[.,]\d+)?)\s*(tỷ|tỉ|tỏi|triệu|tr|củ|chai|k|nghìn|ngàn|vnd|đồng|đ)(?![a-zA-ZÀ-ỹ0-9_])/i);
        if (standaloneMatch) {
          const val = parseFloat(standaloneMatch[1].replace(',', '.'));
          const mult = parsePriceUnit(standaloneMatch[2]);
          const base = val * mult;
          if (base >= 100_000_000 && (p.includes('khoảng') || p.includes('tầm'))) {
            analysis.maxPrice = Math.round(base * 1.15);
            analysis.minPrice = Math.round(base * 0.7);
          } else {
            analysis.maxPrice = base;
          }
        }
      }
    }
  }

  // 3. Phân tích số chỗ ngồi
  if (/(7 chỗ|bảy chỗ|7 người|8 chỗ|bảy người)/i.test(p)) {
    analysis.seats = 7;
  } else if (/(5 chỗ|năm chỗ|5 người|4 chỗ|bốn chỗ)/i.test(p)) {
    analysis.seats = 5;
  }

  // 4. Phân tích hãng
  const brands = ['vinfast', 'toyota', 'honda', 'hyundai', 'kia', 'mazda', 'ford', 'bmw', 'mercedes'];
  for (const b of brands) {
    if (p.includes(b)) {
      analysis.brand = b;
      break;
    }
  }

  // 5. Phân tích loại nhiên liệu
  if (/(xe điện|sạc điện|thuần điện|\bev\b)/i.test(p) || (/(?:^|[^a-zA-ZÀ-ỹ0-9_])điện(?![a-zA-ZÀ-ỹ0-9_])/i.test(p) && !p.includes('điều hòa'))) {
    analysis.fuel = 'Điện';
  } else if (/(hybrid|lai điện|xăng lai điện)/i.test(p)) {
    analysis.fuel = 'Hybrid';
  } else if (/(máy dầu|chạy dầu|diesel|(?:^|[^a-zA-ZÀ-ỹ0-9_])dầu(?![a-zA-ZÀ-ỹ0-9_]))/i.test(p)) {
    analysis.fuel = 'Dầu';
  } else if (/(máy xăng|chạy xăng|(?:^|[^a-zA-ZÀ-ỹ0-9_])xăng(?![a-zA-ZÀ-ỹ0-9_]))/i.test(p)) {
    analysis.fuel = 'Xăng';
  }

  // 6. Phân tích phân khúc & kiểu dáng
  if (/(suv|gầm cao|crossover|cuv)/i.test(p)) {
    analysis.bodyType = 'SUV';
  } else if (/(sedan|4 cửa)/i.test(p)) {
    analysis.bodyType = 'Sedan';
  } else if (/(mpv|chuyên cơ|xe gia đình rộng)/i.test(p)) {
    analysis.bodyType = 'MPV';
  } else if (/(bán tải|pickup|thùng)/i.test(p)) {
    analysis.bodyType = 'Pickup';
  }

  // 7. Phân tích địa điểm tính lăn bánh
  if (p.includes('hà nội') || p.includes('hn')) {
    analysis.location = 'Hà Nội';
  } else if (p.includes('hồ chí minh') || p.includes('tp hcm') || p.includes('sài gòn') || p.includes('hcm')) {
    analysis.location = 'TP. Hồ Chí Minh';
  } else if (p.includes('ở tỉnh') || p.includes('về tỉnh') || p.includes('ngoại tỉnh') || p.includes('tỉnh khác')) {
    analysis.location = 'Tỉnh khác';
  }

  // 8. Phân tích nhu cầu sử dụng thực tế (Use case)
  if (/(chạy dịch vụ|grab|taxi|chạy cước|kinh doanh vận tải|chạy khách)/i.test(p)) {
    analysis.useCase = 'service';
  } else if (/(gia đình|vợ con|bố mẹ|người già|đông người|du lịch|về quê)/i.test(p)) {
    analysis.useCase = 'family';
  } else if (/(lái mới|nữ lái|chị em|mới lấy bằng|dễ lái|trong phố|đô thị|nhỏ gọn)/i.test(p)) {
    analysis.useCase = 'new_driver';
  } else if (/(doanh nhân|đối tác|ngoại giao|xe sang|đẳng cấp|chủ tịch|sang trọng)/i.test(p)) {
    analysis.useCase = 'business';
  } else if (/(đèo dốc|công trình|offroad|đồi núi|tây bắc|tây nguyên|đường xấu|lội nước)/i.test(p)) {
    analysis.useCase = 'offroad';
  } else if (/(đi làm|công sở|hàng ngày|đi phố)/i.test(p)) {
    analysis.useCase = 'commute';
  }

  // 9. Phân tích các ý định tài chính / kỹ thuật
  if (/(lăn bánh|ra biển|tổng chi phí|trọn gói ra tên|hết bao nhiêu tiền)/i.test(p)) {
    analysis.isRolloutCost = true;
  }
  if (/(trả góp|vay ngân hàng|góp tháng|lãi suất|trả trước|vay bao nhiêu|thủ tục vay)/i.test(p)) {
    analysis.isInstallment = true;
  }
  if (/(nuôi xe|chi phí mỗi tháng|tốn bao nhiêu một tháng|tiền xăng|tiền sạc|bảo dưỡng tốn không)/i.test(p)) {
    analysis.isMonthlyCost = true;
  }
  if (/(so sánh|khác nhau|hơn gì|nên mua con nào|con nào ngon hơn|vs)/i.test(p)) {
    analysis.isComparison = true;
  }
  if (/(còn xe không|còn bán không|sẵn xe|có xe giao ngay)/i.test(p)) {
    analysis.isAvailabilityCheck = true;
  }
  if (/(tiết kiệm|ăn ít xăng|uống xăng|hao xăng|tiêu thụ|lít\/100km)/i.test(p)) {
    analysis.isFuelEconomy = true;
  }
  if (/(kiểm định|176 hạng mục|đâm đụng|ngập nước|thủy kích|bảo hành|cam kết|chính sách đổi trả)/i.test(p)) {
    analysis.isInspectionOrWarranty = true;
  }
  if (/(mệnh|phong thủy|hợp màu|màu gì|tuổi)/i.test(p)) {
    analysis.isFengShui = true;
  }

  return analysis;
}

/**
 * Trợ lý AI thực thi RAG chuyên nghiệp:
 * - Tích hợp Gemini Flash thông minh khi có API Key
 * - Siêu bộ máy RAG nội bộ đa chức năng, xử lý hội thoại đa lượt mượt mà
 */
export async function executeRAGQuery(
  prompt: string,
  cars: Car[],
  history?: ChatMessage[]
): Promise<RAGExecutionResult> {
  const availableCars = cars.filter(c => c.status === 'AVAILABLE');
  const pLower = prompt.toLowerCase();

  // Tìm mẫu xe được nhắc đến gần nhất trong lịch sử hội thoại
  let contextCar: Car | undefined;
  if (history && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const hMsg = history[i];
      if (hMsg.matchedCars && hMsg.matchedCars.length > 0) {
        contextCar = hMsg.matchedCars[0];
        break;
      }
    }
  }

  const analysis = analyzeUserPrompt(prompt, contextCar);

  // Xác định xe mục tiêu nếu người dùng chỉ đích danh hoặc dùng đại từ liên kết
  const targetCar = availableCars.find(c =>
    pLower.includes(c.model.toLowerCase()) ||
    pLower.includes(c.title.toLowerCase()) ||
    (analysis.targetCarName && c.model.toLowerCase().includes(analysis.targetCarName.toLowerCase()))
  ) || contextCar || availableCars[0];

  // ============================================================
  // 1. GỌI GEMINI AI NẾU CÓ API KEY HỢP LỆ
  // ============================================================
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const inventoryGroundTruth = availableCars.map(c => ({
        id: c.id,
        title: c.title,
        brand: c.brand,
        model: c.model,
        year: c.year,
        price: c.price,
        formattedPrice: formatVNDCurrency(c.price),
        bodyType: c.bodyType,
        condition: c.condition,
        mileage: c.mileage,
        fuel: c.fuel,
        transmission: c.transmission,
        seats: c.seats,
        fuelConsumption: c.specs.fuelConsumption,
        engine: c.specs.engine,
        horsepower: c.specs.horsepower,
        groundClearance: c.specs.groundClearance,
        airbags: c.specs.airbags,
        location: c.location,
        features: c.features,
      }));

      const systemInstruction = `Bạn là Trợ Lý Cố Vấn Bán Xe & Chuyên Gia Thẩm Định Ô Tô Cao Cấp tại showroom AUTO SMART Việt Nam.
NGUYÊN TẮC BẮT BUỘC:
1. Bạn CHỈ ĐƯỢC PHÉP tư vấn và giới thiệu các xe CÓ TRONG KHO AUTO SMART được liệt kê trong danh sách JSON bên dưới.
2. TUYỆT ĐỐI KHÔNG tự bịa xe, không bịa giá, không giới thiệu xe chưa có trong danh sách.
3. Nếu khách hàng đưa ra ngân sách quá nhỏ (ví dụ 100k, 500k, vài chục triệu), hãy trả lời dí dỏm, lịch sự (ví dụ: số tiền này đủ để rửa xe hoặc đổ xăng) và hướng dẫn phương án mua xe trả góp (chỉ cần trả trước từ 95 triệu) hoặc lái thử miễn phí 0 đồng.
4. Nắm vững chính sách: Xe kiểm định 176 hạng mục, cam kết 100% không đâm đụng, không ngập nước, bảo hành động cơ hộp số 12 tháng, đổi trả trong 7 ngày, giao xe lái thử tận nhà miễn phí.
5. Về chi phí lăn bánh: Xe điện VinFast được miễn 100% thuế trước bạ; Hà Nội thuế 12% + biển 20tr; HCM thuế 10% + biển 20tr; Tỉnh thuế 10% + biển 1tr.
6. Trả lời bằng tiếng Việt chuyên nghiệp, tinh tế, ân cần như chuyên viên tư vấn showroom 5 sao. Trình bày rõ ràng với gạch đầu dòng và in đậm tiêu đề.
7. Danh sách kho xe AUTO SMART hiện có:
${JSON.stringify(inventoryGroundTruth, null, 2)}`;

      const modelCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let response: any = null;

      for (const modelName of modelCandidates) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.3,
            },
          });
          if (response?.text) break;
        } catch {
          // Thử model tiếp theo
        }
      }

      const text = response?.text || '';
      if (text.trim()) {
        const matched = availableCars.filter(c =>
          text.toLowerCase().includes(c.title.toLowerCase()) ||
          text.toLowerCase().includes(c.model.toLowerCase())
        );

        return {
          text,
          matchedCars: matched.length > 0 ? matched : [targetCar],
          rolloutEstimate: analysis.isRolloutCost ? calculateRolloutCost(targetCar, analysis.location || 'Hà Nội') : undefined,
          suggestions: [
            `Tính chi phí lăn bánh ${targetCar.title}`,
            `Tư vấn phương án vay trả góp 80%`,
            `Đặt lịch lái thử ${targetCar.title}`,
          ],
        };
      }
    } catch (err) {
      console.warn('Gemini API call bypassed or model unavailable, switching to smart local RAG engine:', err);
    }
  }

  // ============================================================
  // 2. CƠ CHẾ RAG THÔNG MINH NỘI BỘ (Local Smart RAG Engine)
  // ============================================================

  // --- KỊCH BẢN ĐẶC BIỆT: NGÂN SÁCH SIÊU NHỎ HOẶC HỎI HÀI HƯỚC (< 100 TRIỆU) ---
  if (analysis.maxPrice !== undefined && analysis.maxPrice < 100_000_000) {
    const formattedUserBudget = analysis.maxPrice === 0 ? '0 ₫' : formatVNDCurrency(analysis.maxPrice);
    
    let wittyExplanation = '';
    if (analysis.maxPrice <= 500_000) {
      wittyExplanation = `Với số tiền **${formattedUserBudget}**${analysis.maxPrice > 0 ? ` (khoảng ${Math.round(analysis.maxPrice / 1000)}k)` : ''}, tại AUTO SMART bạn có thể sử dụng dịch vụ **rửa xe bọt tuyết & chăm sóc nội thất cao cấp**, hoặc đổ được khoảng **${Math.max(1, Math.round(analysis.maxPrice / 24000))} lít xăng RON 95** ạ 😄.`;
    } else if (analysis.maxPrice < 10_000_000) {
      wittyExplanation = `Với số tiền **${formattedUserBudget}**, mức này phù hợp để chi trả các gói bảo dưỡng định kỳ, thay dầu cao cấp hoặc mua phụ kiện nâng cấp xe ạ 😄.`;
    } else {
      wittyExplanation = `Với ngân sách **${formattedUserBudget}**, hiện tại trên thị trường chưa có dòng ô tô nguyên chiếc nào đạt chuẩn an toàn trong tầm giá này.`;
    }

    const text = `Dạ xin chia sẻ thật lòng và hỗ trợ bạn:
${wittyExplanation}

🚗 **Về ô tô thực tế tại showroom AUTO SMART:**
• Mẫu ô tô mới 100% có mức giá tiếp cận dễ nhất hiện nay là **VinFast VF 5 Plus** (${formatVND(468_000_000)}) và **Hyundai Accent 1.5 AT** (${formatVND(489_000_000)}).

💡 **GIẢI PHÁP TÀI CHÍNH THỰC TẾ DÀNH CHO BẠN:**
1. **Mua xe trả góp hỗ trợ 80 - 85%:** Nếu bạn có tích lũy từ **95 triệu - 120 triệu tiền mặt**, ngân hàng đối tác của AUTO SMART hỗ trợ vay phần còn lại trong 5 - 8 năm, tiền trả góp hàng tháng chỉ từ **~6.5 triệu/tháng**.
2. **Đăng ký lái thử hoàn toàn MIỄN PHÍ 0 ĐỒNG:** Bạn hoàn toàn có thể trải nghiệm cảm giác lái các dòng xe đời mới tại showroom hoặc chuyên viên mang xe đến tận nhà bạn mà không mất bất kỳ chi phí nào!`;

    const budgetCars = availableCars.filter(c => ['vf 5', 'accent', 'vios'].some(m => c.model.toLowerCase().includes(m)));

    return {
      text,
      matchedCars: budgetCars.slice(0, 3),
      suggestions: [
        'Tư vấn mua xe trả góp chỉ cần từ 95 triệu',
        'Xem xe VinFast VF 5 Plus (468 triệu)',
        'Đăng ký lái thử xe miễn phí 0 đồng',
      ],
    };
  }

  // --- KỊCH BẢN ĐẶC BIỆT: NGÂN SÁCH TỪ 100 ĐẾN 450 TRIỆU (GỢI Ý TRẢ GÓP) ---
  if (analysis.maxPrice !== undefined && analysis.maxPrice < 450_000_000) {
    const text = `Hiện tại trong kho xe **AUTO SMART** chưa có mẫu ô tô nguyên chiếc có giá dưới **${formatVND(analysis.maxPrice)}** (mẫu xe có giá dễ tiếp cận nhất hiện tại là **VinFast VF 5 Plus** - 468 triệu và **Hyundai Accent** - 489 triệu).

💡 **TUY NHIÊN, BẠN HOÀN TOÀN CÓ THỂ MUA XE TRẢ GÓP:**
Với số vốn tự có **${formatVND(analysis.maxPrice)} tiền mặt**, bạn đã đủ **20% - 30%** tiền trả trước để nhận ngay một chiếc xe mới! Ngân hàng đối tác sẽ tài trợ 70 - 80% còn lại trong 5 - 8 năm với tiền góp tháng cực kỳ dễ thở.

Dưới đây là các mẫu xe phù hợp nhất với phương án trả góp của bạn:`;

    const budgetCars = availableCars.filter(c => ['vf 5', 'accent', 'vios', 'city'].some(m => c.model.toLowerCase().includes(m)));

    return {
      text,
      matchedCars: budgetCars.slice(0, 3),
      suggestions: [
        'Bảng tính trả góp VinFast VF 5 Plus',
        'Bảng tính trả góp Hyundai Accent',
        'Thủ tục vay mua xe gồm những gì?',
      ],
    };
  }

  // --- KỊCH BẢN 2.1: KIỂM ĐỊNH 176 HẠNG MỤC & CHÍNH SÁCH BẢO HÀNH ---
  if (analysis.isInspectionOrWarranty) {
    const text = `### 🛡️ CAM KẾT VÀNG & QUY TRÌNH KIỂM ĐỊNH 176 HẠNG MỤC TẠI AUTO SMART

Mọi mẫu xe bán ra tại **AUTO SMART** đều phải vượt qua quy trình thẩm định khắt khe nhất thị trường Việt Nam:

1. **Cam kết 4 Không bằng văn bản pháp lý:**
   • ❌ **Không đâm đụng, tai nạn** làm ảnh hưởng tới kết cấu khung gầm, sắt xi.
   • ❌ **Không thủy kích, ngập nước** (bảo vệ tuyệt đối hệ thống điện & động cơ).
   • ❌ **Không đại tu, tháo rã động cơ & hộp số** (nguyên bản từng con ốc).
   • ❌ **Không tua chỉnh đồng hồ công-tơ-mét (ODO)** – lịch sử hãng minh bạch.

2. **Chính sách Bảo Hành & Đặc Quyền Showroom 5 Sao:**
   • 💎 **Bảo hành toàn diện:** 12 tháng hoặc 20.000 km cho toàn bộ động cơ & hộp số.
   • 🔄 **Đặc quyền đổi xe 7 ngày:** Nếu phát hiện bất kỳ lỗi ẩn hoặc không vừa ý, hỗ trợ đổi xe không mất phí.
   • 🚗 **Lái thử tận nhà miễn phí:** Chuyên viên mang xe đến tận cửa nhà quý khách kèm thiết bị chẩn đoán.
   • 📝 **Thủ tục trọn gói:** Hỗ trợ sang tên, rút hồ sơ, bấm biển số mới trong vòng 24 - 48 giờ.`;

    return {
      text,
      matchedCars: [targetCar],
      showInspectionBadge: true,
      suggestions: [
        `Đặt lịch lái thử trải nghiệm ${targetCar.title}`,
        'Xem hồ sơ kiểm định xe cụ thể',
        'Tư vấn thủ tục mua bán sang tên',
      ],
    };
  }

  // --- KỊCH BẢN 2.2: TÍNH TOÁN CHI PHÍ LĂN BÁNH LINH HOẠT ---
  if (analysis.isRolloutCost) {
    const location = analysis.location || 'Hà Nội';
    const estimate = calculateRolloutCost(targetCar, location);

    const isEV = targetCar.fuel === 'Điện';
    const evTaxBadge = isEV ? '*(Ưu đãi 0% thuế trước bạ xe điện từ Chính phủ)*' : `*(Áp dụng mức thuế ${Math.round(estimate.regTaxRate * 100)}% tại ${estimate.location})*`;

    const text = `Dưới đây là **Bảng Dự Toán Chi Phí Lăn Bánh Chi Tiết** cho mẫu xe **${targetCar.title}** tại khu vực **${estimate.location}**:

• **Giá bán niêm yết:** **${formatVNDCurrency(estimate.basePrice)}** (${formatVND(estimate.basePrice)})
• **Lệ phí trước bạ:** **${formatVNDCurrency(estimate.regTax)}** ${evTaxBadge}
• **Phí cấp biển số mới:** ${formatVNDCurrency(estimate.plateFee)}
• **Phí bảo trì đường bộ (1 năm):** ${formatVNDCurrency(estimate.roadFee)}
• **Phí kiểm định & bảo hiểm TNDS bắt buộc:** ${formatVNDCurrency(estimate.regFee + estimate.insuranceFee)}

👉 **TỔNG CHI PHÍ RA BIỂN TRỌN GÓI:** **${formatVNDCurrency(estimate.totalRollout)}** (${formatVND(estimate.totalRollout)})

💡 *Lưu ý: Nếu quý khách mua xe trả góp, mức tiền mặt tối thiểu cần chuẩn bị chỉ từ **${formatVNDCurrency(estimate.downPayment20)}** (gói 20%) hoặc **${formatVNDCurrency(estimate.downPayment30)}** (gói 30%). Tiền góp hàng tháng khoảng **${formatVNDCurrency(estimate.minMonthlyPay)}/tháng**.*`;

    return {
      text,
      matchedCars: [targetCar],
      rolloutEstimate: estimate,
      suggestions: [
        `Xem giá lăn bánh tại ${estimate.location === 'Hà Nội' ? 'TP. Hồ Chí Minh' : 'Hà Nội'}`,
        `Tư vấn phương án trả góp ${targetCar.title}`,
        `Đặt lịch lái thử ${targetCar.title}`,
      ],
    };
  }

  // --- KỊCH BẢN 2.3: TƯ VẤN TRẢ GÓP & VAY NGÂN HÀNG ---
  if (analysis.isInstallment) {
    const estimate = calculateRolloutCost(targetCar, analysis.location || 'Hà Nội');
    const down20 = Math.round(targetCar.price * 0.2);
    const down30 = Math.round(targetCar.price * 0.3);
    const loan80 = Math.round(targetCar.price * 0.8);
    const loan70 = Math.round(targetCar.price * 0.7);

    // Tính tiền trả hàng tháng theo các kỳ hạn
    const monthlyPrincipal5Y = loan70 / 60;
    const monthlyInterestInitial = loan70 * (0.08 / 12);
    const totalMonth5Y = Math.round(monthlyPrincipal5Y + monthlyInterestInitial);

    const monthlyPrincipal8Y = loan80 / 96;
    const totalMonth8Y = Math.round(monthlyPrincipal8Y + (loan80 * (0.08 / 12)));

    const text = `### 💳 PHƯƠNG ÁN TÀI CHÍNH MUA XE TRẢ GÓP: ${targetCar.title}
*Giá niêm yết: ${formatVNDCurrency(targetCar.price)}*

**1. Số tiền trả trước ban đầu (tùy chọn):**
• **Gói tiết kiệm (Trả trước 20%):** Chỉ cần **${formatVNDCurrency(down20)}** (Cộng chi phí ra biển khoảng **${formatVNDCurrency(estimate.downPayment20)}**).
• **Gói an toàn (Trả trước 30%):** Khoảng **${formatVNDCurrency(down30)}** (Cộng chi phí ra biển khoảng **${formatVNDCurrency(estimate.downPayment30)}**).

**2. Bảng dự toán thanh toán hàng tháng (gốc + lãi dư nợ giảm dần):**
• **Vay 5 năm (60 tháng):** Tháng đầu khoảng **${formatVNDCurrency(totalMonth5Y)}/tháng**, giảm dần hàng tháng.
• **Vay 8 năm (96 tháng):** Tháng đầu chỉ khoảng **${formatVNDCurrency(totalMonth8Y)}/tháng**, cực kỳ nhẹ nhàng.

**3. Ưu đãi độc quyền qua AUTO SMART:**
• Liên kết 12 ngân hàng lớn (Vietcombank, Techcombank, VPBank, MB, Shinhan Bank...).
• Hỗ trợ gói lãi suất ưu đãi cố định **7.5% - 8.2%/năm**.
• **Phê duyệt hồ sơ trong 30 phút**, không cần chứng minh nguồn thu phức tạp, không ép mua bảo hiểm nhân thọ!`;

    return {
      text,
      matchedCars: [targetCar],
      rolloutEstimate: estimate,
      suggestions: [
        `Tính chi phí lăn bánh ${targetCar.title}`,
        'Hồ sơ vay gồm những giấy tờ gì?',
        `Đặt lịch lái thử ${targetCar.title}`,
      ],
    };
  }

  // --- KỊCH BẢN 2.4: CHI PHÍ NUÔI XE HÀNG THÁNG ---
  if (analysis.isMonthlyCost) {
    const monthlyEst = calculateMonthlyOwnershipCost(targetCar);

    const text = `### ⛽ DỰ TOÁN CHI PHÍ "NUÔI" XE HÀNG THÁNG: ${targetCar.title}
*(Dựa trên mức di chuyển tiêu chuẩn người Việt: ~1.200 km/tháng)*

• **Nhiên liệu / Sạc điện:** **${formatVNDCurrency(monthlyEst.fuelOrChargingCost)}/tháng**
  ↳ *${monthlyEst.fuelNote}*
• **Gửi xe cố định:** ~${formatVNDCurrency(monthlyEst.parkingCost)}/tháng (gửi chung cư / văn phòng)
• **Bảo dưỡng định kỳ quy đổi:** ~${formatVNDCurrency(monthlyEst.maintenanceCost)}/tháng (thay dầu, lọc gió, dung dịch)
• **Phí đường bộ & bảo hiểm thân vỏ:** ~${formatVNDCurrency(monthlyEst.insuranceAndRoadCost)}/tháng

👉 **TỔNG CHI PHÍ VẬN HÀNH DỰ KIẾN:** khoảng **${formatVNDCurrency(monthlyEst.totalMonthlyCost)}/tháng** (${formatVND(monthlyEst.totalMonthlyCost)}/tháng).

${targetCar.fuel === 'Điện' ? '✨ **Điểm vượt trội:** Xe điện không có bugi, dây curoa hay dầu động cơ, giúp bạn tiết kiệm tới 25 - 35 triệu đồng chi phí bảo dưỡng mỗi năm!' : ''}`;

    return {
      text,
      matchedCars: [targetCar],
      monthlyCostEstimate: monthlyEst,
      suggestions: [
        `Tính chi phí lăn bánh ${targetCar.title}`,
        `So sánh chi phí với xe điện VinFast`,
        `Đặt lịch lái thử ${targetCar.title}`,
      ],
    };
  }

  // --- KỊCH BẢN 2.5: SO SÁNH 2 XE TRỰC QUAN ---
  if (analysis.isComparison) {
    let carA: Car | undefined;
    let carB: Car | undefined;

    // Tìm 2 mẫu xe được đề cập trong câu hỏi
    const matchedMentioned = availableCars.filter(c =>
      pLower.includes(c.model.toLowerCase()) ||
      pLower.includes(c.title.toLowerCase())
    );

    if (matchedMentioned.length >= 2) {
      carA = matchedMentioned[0];
      carB = matchedMentioned[1];
    } else if (matchedMentioned.length === 1 && contextCar && contextCar.id !== matchedMentioned[0].id) {
      carA = matchedMentioned[0];
      carB = contextCar;
    } else {
      // Các cặp so sánh kinh điển
      if (pLower.includes('vios') || pLower.includes('city') || pLower.includes('accent')) {
        carA = availableCars.find(c => c.model.toLowerCase().includes('vios')) || availableCars[0];
        carB = availableCars.find(c => c.model.toLowerCase().includes('city')) || availableCars[1];
      } else if (pLower.includes('everest') || pLower.includes('fortuner') || pLower.includes('santa fe')) {
        carA = availableCars.find(c => c.model.toLowerCase().includes('everest')) || availableCars[0];
        carB = availableCars.find(c => c.model.toLowerCase().includes('fortuner') || c.model.toLowerCase().includes('santa fe')) || availableCars[1];
      } else if (pLower.includes('vf 8') || pLower.includes('cx-5')) {
        carA = availableCars.find(c => c.model.toLowerCase().includes('vf 8')) || availableCars[0];
        carB = availableCars.find(c => c.model.toLowerCase().includes('cx-5')) || availableCars[1];
      } else {
        carA = targetCar;
        carB = availableCars.find(c => c.id !== targetCar.id && c.bodyType === targetCar.bodyType) || availableCars[1];
      }
    }

    if (carA && carB) {
      const priceDiff = Math.abs(carA.price - carB.price);
      const cheaper = carA.price <= carB.price ? carA : carB;
      const moreExpensive = carA.price > carB.price ? carA : carB;

      const verdict = `Nếu bạn ưu tiên **${cheaper.features[0] || 'kinh tế và thực dụng'}**, hãy chọn **${cheaper.title}** (tiết kiệm hơn ${formatVND(priceDiff)}). Nếu tìm kiếm **${moreExpensive.features[0] || 'trải nghiệm cao cấp, sức mạnh vượt trội'}**, **${moreExpensive.title}** hoàn toàn xứng đáng với mức đầu tư!`;

      const text = `### ⚖️ SO SÁNH CHUYÊN SÂU: ${carA.title} vs ${carB.title}

| Tiêu chí | **${carA.title}** | **${carB.title}** |
| :--- | :--- | :--- |
| **Giá niêm yết** | **${formatVNDCurrency(carA.price)}** | **${formatVNDCurrency(carB.price)}** |
| **Nhiên liệu** | ${carA.fuel} | ${carB.fuel} |
| **Công suất** | ${carA.specs.horsepower || carA.specs.engine || '-'} | ${carB.specs.horsepower || carB.specs.engine || '-'} |
| **Mức tiêu hao** | ${carA.specs.fuelConsumption || '-'} | ${carB.specs.fuelConsumption || '-'} |
| **Số chỗ ngồi** | ${carA.seats} chỗ | ${carB.seats} chỗ |
| **Khoảng sáng gầm** | ${carA.specs.groundClearance || '-'} | ${carB.specs.groundClearance || '-'} |
| **Túi khí an toàn** | ${carA.specs.airbags} túi khí | ${carB.specs.airbags} túi khí |

**🎯 TỔNG KẾT ĐÁNH GIÁ CHUYÊN MÔN:**
• **Điểm nổi bật của ${carA.title}:** ${carA.features.slice(0, 2).join(', ')}.
• **Điểm nổi bật của ${carB.title}:** ${carB.features.slice(0, 2).join(', ')}.
• **Lời khuyên chọn xe:** ${verdict}`;

      const comparisonDetail: ComparisonDetail = {
        carA,
        carB,
        priceDiff,
        prosA: carA.features.slice(0, 3),
        prosB: carB.features.slice(0, 3),
        verdict,
      };

      return {
        text,
        matchedCars: [carA, carB],
        comparisonData: comparisonDetail,
        suggestions: [
          `Đặt lịch lái thử ${carA.title}`,
          `Đặt lịch lái thử ${carB.title}`,
          `Tính chi phí lăn bánh cả 2 xe`,
        ],
      };
    }
  }

  // --- KỊCH BẢN 2.6: TƯ VẤN THEO MỤC ĐÍCH SỬ DỤNG (USE CASES) ---
  if (analysis.useCase === 'service') {
    const serviceCars = availableCars.filter(c =>
      ['vios', 'accent', 'city', 'vf 5'].some(m => c.model.toLowerCase().includes(m))
    );
    const text = `Đối với nhu cầu **chạy dịch vụ taxi công nghệ / Grab / kết hợp kinh doanh**, 3 tiêu chí quan trọng nhất là **thu hồi vốn nhanh, chi phí nhiên liệu tối thiểu và phụ tùng thay thế sẵn có**:

1. **VinFast VF 5 Plus (${formatVND(468_000_000)}):** Lựa chọn số 1 về kinh tế. Chi phí sạc chỉ ~350đ - 400đ/km, được miễn 100% trước bạ khi ra biển, tiền bảo dưỡng định kỳ rẻ hơn xe xăng 60%.
2. **Hyundai Accent 1.5 AT (${formatVND(489_000_000)}):** Thiết kế trẻ trung, nội thất rộng rãi nhất phân khúc B, có cửa gió hàng ghế sau giúp khách ngồi cực kỳ mát mẻ, tiêu hao chỉ 5.5L/100km.
3. **Toyota Vios 1.5G (${formatVND(545_000_000)}):** "Tượng đài giữ giá", cỗ máy Dual VVT-i bền bỉ vận hành 40 - 50 vạn km không lo hỏng vặt, bảo dưỡng đâu cũng có thợ sửa.`;

    return {
      text,
      matchedCars: serviceCars.length > 0 ? serviceCars : availableCars.slice(0, 3),
      suggestions: [
        'So sánh chi phí sạc VF 5 và tiền xăng Vios',
        'Tư vấn trả góp chạy Grab chỉ cần 120 triệu',
        'Xem thêm xe 7 chỗ chạy dịch vụ',
      ],
    };
  }

  if (analysis.useCase === 'family') {
    const familyCars = availableCars.filter(c =>
      c.seats >= 7 || ['everest', 'santa fe', 'carnival', 'vf 9', 'fortuner'].some(m => c.model.toLowerCase().includes(m))
    );
    const text = `Phục vụ **gia đình đông người (có người lớn tuổi và trẻ nhỏ)**, tiêu chuẩn vàng là **ghế ngồi êm ái, cách âm vượt trội, điều hòa tỏa đều 3 hàng ghế và an toàn chủ động cao**:

1. **Kia Carnival 2.2D Signature (${formatVND(1_389_000_000)}):** "Chuyên cơ mặt đất" cho gia đình. Cửa trượt điện thông minh, sàn xe thấp người già bước lên dễ dàng, hàng ghế 2 chỉnh điện ngả không trọng lực.
2. **Ford Everest Titanium+ Bi-Turbo (${formatVND(1_468_000_000)}):** Khung gầm Mỹ đầm chắc cách âm bậc nhất phân khúc, động cơ dầu 2 cầu 4x4 vượt mọi cung đường về quê hay dã ngoại.
3. **Hyundai Santa Fe Calligraphy (${formatVND(1_365_000_000)}):** Thiết kế phong cách khối hộp thời thượng, màn hình cong hiện đại, hệ thống lọc không khí khử khuẩn UV-C bảo vệ sức khỏe gia đình.
4. **VinFast VF 9 Plus (${formatVND(1_680_000_000)}):** SUV điện cỡ lớn 7 chỗ rộng mênh mông, ghế massage, trợ lý ảo giọng nói tiếng Việt nhận diện theo từng vị trí ghế.`;

    return {
      text,
      matchedCars: familyCars.slice(0, 4),
      suggestions: [
        'Tính lăn bánh Kia Carnival 7 chỗ',
        'Đặt lịch lái thử Ford Everest tại nhà',
        'Xem các mẫu xe 7 chỗ tầm giá dưới 1.2 tỷ',
      ],
    };
  }

  if (analysis.useCase === 'new_driver') {
    const compactCars = availableCars.filter(c =>
      ['vf 5', 'city', 'mazda 3', 'accent', 'vios'].some(m => c.model.toLowerCase().includes(m))
    );
    const text = `Dành cho **người mới lái hoặc khách hàng nữ di chuyển thường xuyên trong phố đông đúc**, các tiêu chí tối quan trọng gồm **tầm quan sát thoáng, vô lăng trợ lực nhẹ, bán kính quay vòng nhỏ và nhiều tính năng an toàn hỗ trợ đỗ xe**:

1. **VinFast VF 5 Plus (${formatVND(468_000_000)}):** Gầm cao đô thị dễ quan sát, chân ga mượt mà không lo giật cục, có cảnh báo điểm mù và cảm biến lùi thông minh.
2. **Honda City RS (${formatVND(569_000_000)}):** Gói công nghệ Honda SENSING hỗ trợ giữ làn đường, tự động phanh giảm thiểu va chạm và camera quan sát làn đường LaneWatch.
3. **Mazda 3 1.5 Luxury (${formatVND(619_000_000)}):** Kiểu dáng KODO quyến rũ thanh lịch, có màn hình HUD hiển thị tốc độ trên kính lái, vô lăng bọc da mềm mại dễ điều khiển.`;

    return {
      text,
      matchedCars: compactCars.slice(0, 3),
      suggestions: [
        'Đặt lịch lái thử Mazda 3',
        'Xem xe điện VF 5 đô thị',
        'Tư vấn gói bảo hiểm thân vỏ toàn diện',
      ],
    };
  }

  if (analysis.useCase === 'offroad') {
    const offroadCars = availableCars.filter(c =>
      ['ranger', 'everest', 'fortuner'].some(m => c.model.toLowerCase().includes(m))
    );
    const text = `Để chinh phục **đường đèo dốc hiểm trở, công trình xây dựng hay đồi núi Tây Bắc, Tây Nguyên**, bắt buộc cần xe có **khung gầm sắt xi rời (Body-on-frame), khoảng sáng gầm trên 200mm và dẫn động 2 cầu (4x4) mạnh mẽ**:

1. **Ford Everest Titanium+ Bi-Turbo 4x4 (${formatVND(1_468_000_000)}):** Khoảng sáng gầm 200mm, khả năng lội nước 800mm, 6 chế độ lái địa hình và khóa vi sai cầu sau điện tử.
2. **Ford Ranger Wildtrak 4x4 (${formatVND(979_000_000)}):** "Vua bán tải", mô-men xoắn 500 Nm cực đại, thùng chở hàng rộng rãi tải trọng cao phục vụ công trường.
3. **Toyota Fortuner 2.4AT (${formatVND(1_055_000_000)}):** Khung gầm siêu bền của Toyota, máy dầu nồi đồng cối đá trèo đèo lội suối không lo hỏng vặt.`;

    return {
      text,
      matchedCars: offroadCars,
      suggestions: [
        'Xem chi tiết Ford Ranger Wildtrak',
        'Đặt lịch lái thử Ford Everest 4x4',
        'So sánh Everest và Fortuner',
      ],
    };
  }

  // --- KỊCH BẢN 2.7: TƯ VẤN THEO PHONG THỦY MÀU SẮC ---
  if (analysis.isFengShui) {
    const text = `### 🔮 TƯ VẤN CHỌN MÀU XE THEO PHONG THỦY BẢN MỆNH

Chọn màu xe hợp mệnh giúp chủ xe vạn dặm bình an, làm ăn hanh thông và tài lộc dồi dào:

• **Mệnh Kim:** Hợp nhất với màu **Trắng, Bạc, Ánh kim** (bản mệnh) và màu **Vàng, Nâu đất** (Thổ sinh Kim). Tránh màu Đỏ, Hồng.
• **Mệnh Mộc:** Hợp nhất với màu **Đen, Xanh nước biển** (Thủy sinh Mộc) và **Xanh lá cây**. Tránh màu Trắng, Ánh bạc.
• **Mệnh Thủy:** Hợp nhất với màu **Trắng, Bạc, Xám** (Kim sinh Thủy) và **Đen, Xanh thẫm**. Tránh màu Vàng, Nâu đất.
• **Mệnh Hỏa:** Hợp nhất với màu **Đỏ, Cam, Tím** (bản mệnh) và **Xanh lá cây** (Mộc sinh Hỏa). Tránh màu Đen, Xanh biển.
• **Mệnh Thổ:** Hợp nhất với màu **Đỏ, Cam, Hồng** (Hỏa sinh Thổ) và **Vàng, Nâu đất**. Tránh màu Xanh lá.

Hiện tại kho xe **AUTO SMART** có đầy đủ các tông màu phong thủy phong phú cho quý khách lựa chọn!`;

    return {
      text,
      matchedCars: availableCars.slice(0, 3),
      suggestions: [
        'Xem xe màu trắng cho mệnh Kim/Thủy',
        'Xem xe màu đen sang trọng',
        'Xem xe màu đỏ thể thao',
      ],
    };
  }

  // --- KỊCH BẢN 2.8: CÂU HỎI CHUNG / CHÀO HỎI (KHÔNG CÓ TIÊU CHÍ LỌC) ---
  const hasAnyFilter = analysis.maxPrice !== undefined || 
                       analysis.minPrice !== undefined || 
                       analysis.seats !== undefined || 
                       !!analysis.brand || 
                       !!analysis.fuel || 
                       !!analysis.bodyType;

  if (!hasAnyFilter) {
    const text = `Dạ xin chào bạn! Showroom **AUTO SMART** hiện có sẵn đầy đủ các dòng xe từ xe đô thị tiết kiệm đến SUV 7 chỗ gia đình và xe sang cao cấp (VinFast, Toyota, Honda, Mazda, Hyundai, Kia, Ford, BMW, Mercedes)...

Tất cả xe đều có cam kết chất lượng 100% không đâm đụng, bảo hành chính hãng và hỗ trợ giao xe lái thử tận nhà miễn phí.

Để tôi tư vấn chính xác và phù hợp nhất với nhu cầu của bạn, bạn có thể chia sẻ thêm:
1. 💰 **Ngân sách dự kiến:** Dưới 600 triệu, 800 triệu - 1 tỷ, hay trên 1.5 tỷ?
2. 👥 **Số chỗ ngồi:** Xe 5 chỗ nhỏ gọn hay 7 chỗ gia đình?
3. 🎯 **Mục đích sử dụng:** Đi làm hàng ngày trong phố, kinh doanh Grab/dịch vụ hay đi công trình đèo dốc?`;

    return {
      text,
      matchedCars: availableCars.slice(0, 4),
      suggestions: [
        'Tôi có 500 triệu nên mua xe nào?',
        'Xe 7 chỗ cho gia đình dưới 1.5 tỷ?',
        'Tư vấn mua xe trả góp thủ tục thế nào?',
        'Có xe điện VinFast nào đang bán không?',
      ],
    };
  }

  // --- KỊCH BẢN 2.9: BỘ LỌC ĐA TIÊU CHÍ (GIÁ, CHỖ, HÃNG, NHIÊN LIỆU) ---
  let filtered = [...availableCars];

  if (analysis.maxPrice !== undefined) {
    filtered = filtered.filter(c => c.price <= analysis.maxPrice!);
  }
  if (analysis.minPrice !== undefined && filtered.some(c => c.price >= analysis.minPrice!)) {
    filtered = filtered.filter(c => c.price >= analysis.minPrice!);
  }
  if (analysis.seats !== undefined) {
    filtered = filtered.filter(c => c.seats === analysis.seats);
  }
  if (analysis.brand) {
    filtered = filtered.filter(c => c.brand.toLowerCase().includes(analysis.brand!));
  }
  if (analysis.fuel) {
    filtered = filtered.filter(c => c.fuel.toLowerCase() === analysis.fuel!.toLowerCase());
  }
  if (analysis.bodyType) {
    filtered = filtered.filter(c => c.bodyType.toLowerCase() === analysis.bodyType!.toLowerCase());
  }

  filtered.sort((a, b) => b.year - a.year || a.price - b.price);

  if (filtered.length > 0) {
    const criteriaDesc: string[] = [];
    if (analysis.minPrice && analysis.maxPrice) {
      criteriaDesc.push(`tầm giá ${formatVND(analysis.minPrice)} - ${formatVND(analysis.maxPrice)}`);
    } else if (analysis.maxPrice) {
      criteriaDesc.push(`ngân sách dưới ${formatVND(analysis.maxPrice)}`);
    }
    if (analysis.seats) criteriaDesc.push(`${analysis.seats} chỗ`);
    if (analysis.brand) criteriaDesc.push(`thương hiệu ${analysis.brand.toUpperCase()}`);
    if (analysis.fuel) criteriaDesc.push(`nhiên liệu ${analysis.fuel}`);
    if (analysis.bodyType) criteriaDesc.push(`kiểu dáng ${analysis.bodyType}`);

    const descText = criteriaDesc.length > 0 ? ` (${criteriaDesc.join(', ')})` : '';

    const text = `Dựa trên dữ liệu thực tế tại kho xe **AUTO SMART**, tôi đã tìm thấy **${filtered.length} mẫu xe hoàn hảo** đáp ứng yêu cầu của bạn${descText}:

Tất cả xe đều có cam kết chất lượng 100% không đâm đụng, bảo hành chính hãng và hỗ trợ giao xe lái thử tận nhà:`;

    return {
      text,
      matchedCars: filtered.slice(0, 4),
      suggestions: [
        `Tính chi phí lăn bánh ${filtered[0].title}`,
        `Tư vấn phương án trả góp ${filtered[0].title}`,
        `Đặt lịch lái thử ${filtered[0].title}`,
      ],
    };
  }

  // --- TRƯỜNG HỢP KHÔNG TÌM THẤY XE KHỚP 100% ---
  const fallbackCars = availableCars.slice(0, 3);
  let noMatchMsg = 'Hiện tại trong kho xe AUTO SMART chưa có mẫu xe nào thỏa mãn 100% tất cả các tiêu chí bạn vừa yêu cầu.';

  if (analysis.seats === 7 && analysis.maxPrice && analysis.maxPrice < 1_000_000_000) {
    noMatchMsg = `Hiện tại trong kho xe chưa có mẫu xe **7 chỗ** với tầm giá **dưới ${formatVND(analysis.maxPrice)}**. Các mẫu xe 7 chỗ chất lượng cao hiện có giá từ **1.055 tỷ VND** (như Toyota Fortuner, Kia Carnival, Hyundai Santa Fe, Ford Everest...).`;
  }

  return {
    text: `${noMatchMsg}

Bạn có thể tham khảo một số mẫu xe nổi bật bán chạy nhất tuần này dưới đây, hoặc để lại yêu cầu để chuyên viên tìm xe phù hợp cho bạn:`,
    matchedCars: fallbackCars,
    suggestions: [
      'Xem tất cả xe 5 chỗ',
      'Xem xe tầm giá 500 - 800 triệu',
      'Tư vấn mua xe trả góp',
    ],
  };
}
