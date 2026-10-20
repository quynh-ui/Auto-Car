import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  CarFront, 
  ArrowRight,
  Calendar,
  Fuel,
  Users,
  Volume2,
  VolumeX,
  Mic,
  Copy,
  Check,
  Scale,
  Calculator,
  ShieldCheck,
  Zap,
  RotateCcw,
  Wrench,
  Coins,
  MapPin,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Car, ChatMessage } from '../types';
import { 
  executeRAGQuery, 
  formatVNDCurrency, 
  formatVND, 
  RolloutEstimate, 
  MonthlyCostEstimate, 
  ComparisonDetail,
  calculateRolloutCost 
} from '../services/ragBot';
import { useCompare } from '../contexts/CompareContext';

interface ExtendedChatMessage extends ChatMessage {
  rolloutEstimate?: RolloutEstimate;
  monthlyCostEstimate?: MonthlyCostEstimate;
  comparisonData?: ComparisonDetail;
  showInspectionBadge?: boolean;
}

interface ChatWidgetProps {
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onBookTestDrive: (car: Car) => void;
}

const DEFAULT_SUGGESTIONS = [
  'Tôi có 500 triệu nên mua xe nào?',
  'Xe 7 chỗ cho gia đình dưới 1.5 tỷ?',
  'Tính chi phí lăn bánh Mazda 3',
  'Tư vấn mua xe chạy dịch vụ Grab',
  'Toyota Vios và Honda City xe nào rẻ hơn?',
  'Chi phí nuôi xe VinFast VF 8 mỗi tháng',
  'Chính sách kiểm định 176 hạng mục xe',
  'Mua xe trả góp cần chuẩn bị bao nhiêu?',
];

// Component: Thẻ tính chi phí lăn bánh tương tác đổi khu vực & gói vay
const InteractiveRolloutCard: React.FC<{
  initialEstimate: RolloutEstimate;
  cars: Car[];
  onBookTestDrive: (car: Car) => void;
}> = ({ initialEstimate, cars, onBookTestDrive }) => {
  const [selectedLoc, setSelectedLoc] = useState<string>(initialEstimate.location);
  const [downPercent, setDownPercent] = useState<20 | 30>(20);

  const matchedCar = cars.find(c => c.id === initialEstimate.carId || c.title === initialEstimate.carTitle) || cars[0];
  const estimate = calculateRolloutCost(matchedCar, selectedLoc);

  const isEV = matchedCar.fuel === 'Điện';
  const downPayment = downPercent === 20 ? estimate.downPayment20 : estimate.downPayment30;

  return (
    <div className="mt-3 w-full max-w-[95%] p-4 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-red-500/30 shadow-xl space-y-3 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center gap-1.5 font-bold text-white text-sm">
          <Calculator className="w-4 h-4 text-red-500" />
          <span>Bảng Dự Toán Lăn Bánh: {estimate.carTitle}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono">
          Chuẩn Thuế 2026
        </span>
      </div>

      {/* Location Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-950 border border-gray-800">
        <span className="text-[10px] text-gray-400 pl-1.5 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-400" /> Nơi ra biển:
        </span>
        {(['Hà Nội', 'TP. Hồ Chí Minh', 'Tỉnh khác'] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => setSelectedLoc(loc)}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-all ${
              selectedLoc.includes(loc.slice(0, 4))
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-gray-300">
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <span className="text-gray-400">Giá niêm yết:</span>
          <span className="font-semibold">{formatVNDCurrency(estimate.basePrice)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <span className="text-gray-400">Trước bạ ({Math.round(estimate.regTaxRate * 100)}%):</span>
          <span className={`font-semibold ${isEV ? 'text-emerald-400 font-bold' : 'text-gray-200'}`}>
            {isEV ? '0 ₫ (Miễn 100%)' : formatVNDCurrency(estimate.regTax)}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <span className="text-gray-400">Cấp biển số ({estimate.location}):</span>
          <span className="font-semibold">{formatVNDCurrency(estimate.plateFee)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <span className="text-gray-400">Bảo trì đường bộ:</span>
          <span className="font-semibold">{formatVNDCurrency(estimate.roadFee)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-800/60 col-span-2">
          <span className="text-gray-400">Kiểm định & bảo hiểm TNDS:</span>
          <span className="font-semibold">{formatVNDCurrency(estimate.regFee + estimate.insuranceFee)}</span>
        </div>
      </div>

      {/* Total Rollout Highlight */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/50 to-red-900/30 border border-red-500/30 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gray-200 block">Tổng chi phí ra biển trọn gói:</span>
          <span className="text-[10px] text-gray-400">Đã bao gồm tất cả các khoản phí bắt buộc</span>
        </div>
        <div className="text-right">
          <span className="text-base font-black text-red-400 font-['Space_Grotesk'] block">
            {formatVNDCurrency(estimate.totalRollout)}
          </span>
          <span className="text-[11px] text-red-300 font-medium font-mono">
            ({formatVND(estimate.totalRollout)})
          </span>
        </div>
      </div>

      {/* Installment Switcher */}
      <div className="pt-2 border-t border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" /> Phương án mua trả góp:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setDownPercent(20)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                downPercent === 20 ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Trả trước 20%
            </button>
            <button
              onClick={() => setDownPercent(30)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                downPercent === 30 ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Trả trước 30%
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-950/80 p-2 rounded-xl text-[11px] border border-gray-800">
          <div>
            <span className="text-gray-400 block text-[10px]">Cần chuẩn bị trước:</span>
            <span className="font-bold text-amber-300">{formatVNDCurrency(downPayment)}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px]">Góp tháng (5 năm):</span>
            <span className="font-bold text-emerald-400">{formatVNDCurrency(estimate.minMonthlyPay)}/tháng</span>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <button
        onClick={() => onBookTestDrive(matchedCar)}
        className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-red-600/30"
      >
        <Calendar className="w-3.5 h-3.5" /> Đặt lịch lái thử mẫu {matchedCar.model}
      </button>
    </div>
  );
};

// Component: Thẻ So Sánh 2 Xe Trực Quan
const InteractiveComparisonCard: React.FC<{
  data: ComparisonDetail;
  onBookTestDrive: (car: Car) => void;
  onSelectCar: (car: Car) => void;
  onOpenFullCompare: () => void;
}> = ({ data, onBookTestDrive, onSelectCar, onOpenFullCompare }) => {
  const { carA, carB, priceDiff, prosA, prosB, verdict } = data;

  return (
    <div className="mt-3 w-full max-w-[95%] p-4 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-blue-500/30 shadow-xl space-y-3 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center gap-1.5 font-bold text-white text-sm">
          <Scale className="w-4 h-4 text-blue-400" />
          <span>So Sánh Đối Đầu Trực Tiếp</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-mono">
          Chênh lệch {formatVND(priceDiff)}
        </span>
      </div>

      {/* Side-by-Side Cars */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Car A */}
        <div className="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-black mb-2">
              <img src={carA.images[0]} alt={carA.title} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 py-0.2 rounded bg-black/70 text-gray-200">
                {carA.year}
              </span>
            </div>
            <h5 className="font-bold text-xs text-white line-clamp-1">{carA.title}</h5>
            <p className="text-sm font-black text-red-500 my-1 font-['Space_Grotesk']">
              {formatVNDCurrency(carA.price)}
            </p>

            <div className="space-y-1 my-2 text-[10px] text-gray-300">
              <div className="flex justify-between py-0.5 border-b border-gray-800/60">
                <span className="text-gray-500">Nhiên liệu:</span>
                <span>{carA.fuel}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-gray-800/60">
                <span className="text-gray-500">Động cơ:</span>
                <span className="line-clamp-1">{carA.specs.horsepower || carA.specs.engine}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-gray-800/60">
                <span className="text-gray-500">Tiêu hao:</span>
                <span>{carA.specs.fuelConsumption}</span>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <span className="text-[10px] text-emerald-400 font-bold block">Ưu thế:</span>
              {prosA.slice(0, 2).map((p, idx) => (
                <div key={idx} className="flex items-start gap-1 text-[10px] text-gray-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onBookTestDrive(carA)}
            className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
          >
            <Calendar className="w-3 h-3 text-red-400" /> Lái thử
          </button>
        </div>

        {/* Car B */}
        <div className="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-black mb-2">
              <img src={carB.images[0]} alt={carB.title} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 py-0.2 rounded bg-black/70 text-gray-200">
                {carB.year}
              </span>
            </div>
            <h5 className="font-bold text-xs text-white line-clamp-1">{carB.title}</h5>
            <p className="text-sm font-black text-red-500 my-1 font-['Space_Grotesk']">
              {formatVNDCurrency(carB.price)}
            </p>

            <div className="space-y-1 my-2 text-[10px] text-gray-300">
              <div className="flex justify-between py-0.5 border-b border-gray-800/60">
                <span className="text-gray-500">Nhiên liệu:</span>
                <span>{carB.fuel}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-gray-800/60">
                <span className="text-gray-500">Động cơ:</span>
                <span className="line-clamp-1">{carB.specs.horsepower || carB.specs.engine}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-gray-800/60">
                <span className="text-gray-500">Tiêu hao:</span>
                <span>{carB.specs.fuelConsumption}</span>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <span className="text-[10px] text-emerald-400 font-bold block">Ưu thế:</span>
              {prosB.slice(0, 2).map((p, idx) => (
                <div key={idx} className="flex items-start gap-1 text-[10px] text-gray-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onBookTestDrive(carB)}
            className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
          >
            <Calendar className="w-3 h-3 text-red-400" /> Lái thử
          </button>
        </div>
      </div>

      {/* Full Comparison Modal Button */}
      <button
        onClick={onOpenFullCompare}
        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/30"
      >
        <ExternalLink className="w-3.5 h-3.5" /> Mở Bảng So Sánh Chi Tiết Toàn Màn Hình
      </button>
    </div>
  );
};

// Component: Thẻ Chi Phí Nuôi Xe Hàng Tháng
const InteractiveMonthlyCostCard: React.FC<{ data: MonthlyCostEstimate }> = ({ data }) => {
  return (
    <div className="mt-3 w-full max-w-[95%] p-4 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-emerald-500/30 shadow-xl space-y-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center gap-1.5 font-bold text-white text-sm">
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span>Dự Toán Chi Phí Nuôi Xe: {data.carTitle}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
          ~1.200 km/tháng
        </span>
      </div>

      <div className="space-y-1.5 text-gray-300 text-[11px]">
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <div>
            <span className="text-gray-400">Nhiên liệu / Sạc điện:</span>
            <span className="block text-[9px] text-gray-500">{data.fuelNote}</span>
          </div>
          <span className="font-bold text-white">{formatVNDCurrency(data.fuelOrChargingCost)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <span className="text-gray-400">Gửi xe cố định (chung cư/bãi):</span>
          <span className="font-semibold text-gray-200">{formatVNDCurrency(data.parkingCost)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <span className="text-gray-400">Bảo dưỡng định kỳ quy đổi:</span>
          <span className="font-semibold text-gray-200">{formatVNDCurrency(data.maintenanceCost)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-800/60">
          <span className="text-gray-400">Phí bảo hiểm & đường bộ:</span>
          <span className="font-semibold text-gray-200">{formatVNDCurrency(data.insuranceAndRoadCost)}</span>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-200">Tổng chi phí vận hành ước tính:</span>
        <span className="text-base font-black text-emerald-400 font-['Space_Grotesk']">
          {formatVNDCurrency(data.totalMonthlyCost)}/tháng
        </span>
      </div>
    </div>
  );
};

// Component: Thẻ Cam Kết 176 Hạng Mục Showroom
const InteractiveInspectionBadgeCard: React.FC = () => {
  return (
    <div className="mt-3 w-full max-w-[95%] p-4 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-purple-500/30 shadow-xl space-y-2.5 text-xs">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-800 text-purple-400 font-bold text-sm">
        <ShieldCheck className="w-5 h-5 text-purple-400" />
        <span>Chứng Nhận Kiểm Định 176 Hạng Mục AUTO SMART</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
        <div className="p-2 rounded-lg bg-gray-950 border border-gray-800/80 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Không đâm đụng khung gầm</span>
        </div>
        <div className="p-2 rounded-lg bg-gray-950 border border-gray-800/80 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Không thủy kích, ngập nước</span>
        </div>
        <div className="p-2 rounded-lg bg-gray-950 border border-gray-800/80 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Động cơ & Hộp số nguyên bản</span>
        </div>
        <div className="p-2 rounded-lg bg-gray-950 border border-gray-800/80 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Bảo hành 12 tháng / 20.000 km</span>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 italic">
        *Cam kết văn bản hoàn tiền 100% kèm bồi thường chi phí phát sinh nếu phát hiện sai lệch.
      </p>
    </div>
  );
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ cars, onSelectCar, onBookTestDrive }) => {
  const { addToCompare, setIsCompareOpen } = useCompare();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Xin chào! Tôi là **Trợ Lý Cố Vấn Ô Tô Cao Cấp AUTO SMART** (Cloudflare Workers AI & Gemini RAG).\n\nTôi được kết nối trực tiếp với cơ sở dữ liệu kho xe thực tế. Tôi có thể hỗ trợ bạn:\n• 🔍 **Tìm xe thông minh**: Lọc chính xác theo ngân sách, phân khúc, số chỗ, màu sắc, động cơ\n• 💰 **Bảng tính lăn bánh**: Tính chuẩn xác thuế trước bạ, phí biển số tại Hà Nội, TP.HCM & các Tỉnh\n• 💳 **Tư vấn trả góp**: Lên phương án vay 70-80%, dự toán tiền góp tháng theo dư nợ giảm dần\n• ⚖️ **So sánh đối đầu**: So sánh thông số kỹ thuật, ưu/nhược điểm thực tế giữa 2 dòng xe\n• ⛽ **Chi phí nuôi xe**: Dự toán tiền xăng/sạc điện, tiền bảo dưỡng, gửi xe mỗi tháng\n• 🛡️ **Thẩm định 176 hạng mục**: Cam kết văn bản không đâm đụng, không ngập nước, bảo hành 1 năm\n\nBạn đang quan tâm đến dòng xe nào?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Voice Speech Recognition Setup (Speech-to-Text)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'vi-VN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputValue(transcript);
            handleSendMessage(transcript);
          }
          setIsRecordingVoice(false);
        };

        recognition.onerror = () => {
          setIsRecordingVoice(false);
        };

        recognition.onend = () => {
          setIsRecordingVoice(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [cars]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói tiếng Việt trực tiếp.');
      return;
    }

    if (isRecordingVoice) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecordingVoice(true);
      } catch (err) {
        setIsRecordingVoice(false);
      }
    }
  };

  // Text-to-Speech (Voice output)
  const handleSpeakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ExtendedChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      try {
        // Truyền cả lịch sử trò chuyện để bot hiểu ngữ cảnh đa lượt
        const result = await executeRAGQuery(text, cars, [...messages, userMsg]);
        const botMsg: ExtendedChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: result.text,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          matchedCars: result.matchedCars,
          suggestions: result.suggestions,
          rolloutEstimate: result.rolloutEstimate,
          monthlyCostEstimate: result.monthlyCostEstimate,
          comparisonData: result.comparisonData,
          showInspectionBadge: result.showInspectionBadge,
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'bot',
            text: 'Dạ xin lỗi bạn, hệ thống AI đang kiểm tra lại kết nối cơ sở dữ liệu. Bạn vui lòng thử lại hoặc gọi Hotline 1900-8888 để được chuyên viên hỗ trợ ngay nhé!',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }, 450);
  };

  const resetChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMsgId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Cuộc trò chuyện đã được làm mới. Hãy cho tôi biết nhu cầu xe của bạn nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
      },
    ]);
  };

  const handleOpenFullCompare = (compData: ComparisonDetail) => {
    addToCompare(compData.carA);
    addToCompare(compData.carB);
    setIsCompareOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 p-3.5 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white shadow-2xl shadow-red-600/40 hover:shadow-red-500/60 hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="Mở Trợ lý AI tư vấn ô tô"
          >
            <div className="relative">
              <Bot className="w-6 h-6 animate-pulse-subtle" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-red-600 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-red-600" />
            </div>
            
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold tracking-wide uppercase flex items-center gap-1">
                Tư Vấn Ô Tô AI Pro <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </span>
              <span className="text-[11px] text-red-100 font-normal">Hỏi giá, lăn bánh, so sánh, trả góp</span>
            </div>
          </button>
        </div>
      )}

      {/* Main Interactive Chat Dialog */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ${
            isFullscreen
              ? 'inset-3 sm:inset-6 rounded-3xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[500px] md:w-[550px] h-[650px] sm:h-[700px] max-h-[90vh] rounded-3xl'
          } bg-gray-950 border border-gray-800 shadow-2xl shadow-black/90 flex flex-col overflow-hidden backdrop-blur-2xl ring-1 ring-red-500/20`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border-b border-gray-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk']">AUTO SMART AI Pro</h4>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-red-600/30 text-red-400 border border-red-500/30">
                    RAG D1 & Gemini
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Cố vấn ô tô thông minh 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                title={isFullscreen ? 'Thu gọn cửa sổ' : 'Phóng to toàn màn hình'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                title="Đóng chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Pill Categories Bar */}
          <div className="px-4 py-2 bg-gray-900/60 border-b border-gray-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
            <span className="text-gray-500 text-[10px] uppercase font-bold shrink-0">Hỏi nhanh:</span>
            <button
              onClick={() => handleSendMessage('Tôi có 500 triệu nên mua xe nào?')}
              className="px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-red-600/30 shrink-0 transition-all border border-gray-700/60"
            >
              💵 Dưới 500 triệu
            </button>
            <button
              onClick={() => handleSendMessage('Xe 7 chỗ cho gia đình dưới 1.5 tỷ?')}
              className="px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-red-600/30 shrink-0 transition-all border border-gray-700/60"
            >
              👨‍👩‍👧‍👦 7 chỗ gia đình
            </button>
            <button
              onClick={() => handleSendMessage('So sánh Toyota Vios và Honda City')}
              className="px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-red-600/30 shrink-0 transition-all border border-gray-700/60"
            >
              ⚖️ So sánh Vios & City
            </button>
            <button
              onClick={() => handleSendMessage('Có xe điện VinFast nào đang bán không?')}
              className="px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-red-600/30 shrink-0 transition-all border border-gray-700/60"
            >
              ⚡ Xe điện VinFast
            </button>
            <button
              onClick={() => handleSendMessage('Tư vấn mua xe trả góp thủ tục thế nào?')}
              className="px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-red-600/30 shrink-0 transition-all border border-gray-700/60"
            >
              💳 Mua xe trả góp
            </button>
            <button
              onClick={() => handleSendMessage('Chính sách kiểm định 176 hạng mục xe')}
              className="px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 hover:text-white hover:bg-red-600/30 shrink-0 transition-all border border-gray-700/60"
            >
              🛡️ Cam kết kiểm định
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-gray-950/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed relative group ${
                    msg.sender === 'user'
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/40 rounded-br-none'
                      : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {/* Audio & Copy Action Toolbar for Bot Messages */}
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-gray-800/80 text-[11px] text-gray-400">
                      <button
                        onClick={() => handleSpeakText(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-gray-800 transition-colors ${
                          speakingMsgId === msg.id ? 'text-red-400 font-bold' : ''
                        }`}
                        title="Đọc bằng giọng nói tiếng Việt"
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 animate-pulse text-red-500" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe giọng đọc</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-gray-800 transition-colors"
                        title="Sao chép nội dung tư vấn"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-gray-500 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* 1. INTERACTIVE ROLLOUT COST CARD */}
                {msg.rolloutEstimate && (
                  <InteractiveRolloutCard
                    initialEstimate={msg.rolloutEstimate}
                    cars={cars}
                    onBookTestDrive={(car) => {
                      onBookTestDrive(car);
                      setIsOpen(false);
                    }}
                  />
                )}

                {/* 2. INTERACTIVE SIDE-BY-SIDE COMPARISON CARD */}
                {msg.comparisonData && (
                  <InteractiveComparisonCard
                    data={msg.comparisonData}
                    onBookTestDrive={(car) => {
                      onBookTestDrive(car);
                      setIsOpen(false);
                    }}
                    onSelectCar={(car) => {
                      onSelectCar(car);
                      setIsOpen(false);
                    }}
                    onOpenFullCompare={() => handleOpenFullCompare(msg.comparisonData!)}
                  />
                )}

                {/* 3. INTERACTIVE MONTHLY OWNERSHIP COST CARD */}
                {msg.monthlyCostEstimate && (
                  <InteractiveMonthlyCostCard data={msg.monthlyCostEstimate} />
                )}

                {/* 4. SHOWROOM 176-POINT INSPECTION BADGE */}
                {msg.showInspectionBadge && (
                  <InteractiveInspectionBadgeCard />
                )}

                {/* 5. MATCHED CAR CARDS RENDERED INSIDE CHAT */}
                {msg.matchedCars && msg.matchedCars.length > 0 && !msg.comparisonData && (
                  <div className="mt-3 w-full space-y-2.5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <CarFront className="w-3.5 h-3.5 text-red-500" /> Xe sẵn sàng giao ngay tại kho:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.matchedCars.map((car) => (
                        <div
                          key={car.id}
                          className="rounded-2xl bg-gray-900 border border-gray-800/90 overflow-hidden hover:border-red-500/50 transition-all p-2.5 flex flex-col justify-between shadow-lg"
                        >
                          <div>
                            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black mb-2">
                              <img
                                src={car.images[0]}
                                alt={car.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-gray-200 backdrop-blur-sm">
                                Đời {car.year}
                              </span>
                              {car.fuel === 'Điện' && (
                                <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white backdrop-blur-sm flex items-center gap-0.5">
                                  <Zap className="w-2.5 h-2.5" /> Thuần điện
                                </span>
                              )}
                            </div>

                            <h5 className="font-bold text-xs text-white line-clamp-1">
                              {car.title}
                            </h5>

                            <p className="text-sm font-black text-red-500 my-1 font-['Space_Grotesk']">
                              {formatVNDCurrency(car.price)}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                              <span className="flex items-center gap-0.5">
                                <Fuel className="w-2.5 h-2.5 text-red-400" /> {car.fuel}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Users className="w-2.5 h-2.5 text-amber-400" /> {car.seats} chỗ
                              </span>
                              <span>•</span>
                              <span>{car.location}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-gray-800">
                            <button
                              onClick={() => {
                                onSelectCar(car);
                                setIsOpen(false);
                              }}
                              className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-center"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              onClick={() => {
                                onBookTestDrive(car);
                                setIsOpen(false);
                              }}
                              className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white text-center flex items-center justify-center gap-1"
                            >
                              <Calendar className="w-3 h-3" /> Lái thử
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. DYNAMIC CONTEXTUAL SUGGESTIONS */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-gray-800/80 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <span>{sug}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-400 text-xs py-2 px-3 rounded-2xl bg-gray-900 border border-gray-800 max-w-[240px]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Cố vấn AI đang đối soát dữ liệu kho...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Recording Active Banner */}
          {isRecordingVoice && (
            <div className="px-4 py-2 bg-red-950 border-t border-red-800/80 flex items-center justify-between text-xs text-red-200 animate-pulse">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-400" />
                <span>Đang lắng nghe tiếng Việt... Hãy nói câu hỏi của bạn!</span>
              </div>
              <button
                onClick={toggleVoiceRecording}
                className="text-[11px] underline text-white font-bold"
              >
                Dừng nói
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-gray-900 border-t border-gray-800/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi bất kỳ điều gì: giá, lăn bánh, so sánh, trả góp..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />

                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`absolute right-2 top-2 p-1 rounded-lg transition-colors ${
                    isRecordingVoice
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title="Nói tiếng Việt trực tiếp (Voice Recognition)"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white shadow-md shadow-red-600/30 transition-all shrink-0"
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Kiểm định 176 hạng mục • Dữ liệu D1 & Gemini 2.5
              </span>
              <span className="text-gray-400 font-mono">BGE-M3 • LLaMA-3.1</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
