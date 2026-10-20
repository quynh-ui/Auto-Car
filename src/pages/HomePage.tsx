import React, { useState } from 'react';
import { 
  CarFront, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BadgePercent, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall, 
  Bot, 
  Send 
} from 'lucide-react';
import { Car, Brand, BodyType } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { BrandSlider } from '../components/BrandSlider';
import { CarCard } from '../components/CarCard';

interface HomePageProps {
  cars: Car[];
  brands: Brand[];
  onSelectDetail: (car: Car) => void;
  onBookTestDrive: (car: Car) => void;
  onNavigateTab: (tab: string, filterOpts?: { brand?: string; priceRange?: string }) => void;
  onOpenChat: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  cars,
  brands,
  onSelectDetail,
  onBookTestDrive,
  onNavigateTab,
  onOpenChat,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string>('SUV');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactContent, setContactContent] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const featuredCars = cars.filter(c => c.isFeatured && c.status === 'AVAILABLE').slice(0, 4);
  const newestCars = [...cars].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const segmentCars = cars.filter(c => {
    if (selectedSegment === 'Điện') return c.fuel === 'Điện';
    return c.bodyType === selectedSegment;
  }).slice(0, 4);

  const handleQuickHeroSearch = (brand?: string, priceRange?: string) => {
    onNavigateTab('inventory', { brand, priceRange });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactPhone('');
      setContactContent('');
      setContactSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-16">
      
      {/* 1. Showroom Hero Banner */}
      <HeroBanner
        brands={brands}
        onSearchSubmit={handleQuickHeroSearch}
        onOpenChat={onOpenChat}
        onExploreInventory={() => onNavigateTab('inventory')}
      />

      {/* 2. Interactive Brand Slider */}
      <BrandSlider
        brands={brands}
        selectedBrand="all"
        onSelectBrand={(brandName) => onNavigateTab('inventory', { brand: brandName })}
      />

      {/* 3. Ô Tô Nổi Bật (Featured Cars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tuyển Chọn Showroom</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
              Ô Tô Nổi Bật Đang Được Săn Đón
            </h2>
            <p className="text-xs text-gray-400">
              Các mẫu xe sở hữu công nghệ cao cấp, giá bán cạnh tranh và hồ sơ kiểm định hoàn hảo
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Xem tất cả kho xe</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onSelectDetail={onSelectDetail}
              onBookTestDrive={onBookTestDrive}
            />
          ))}
        </div>
      </section>

      {/* 4. Chatbot RAG Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-red-950/80 via-gray-900 to-gray-950 border border-red-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold border border-red-500/30">
              <Bot className="w-4 h-4" /> Cloudflare Workers AI + Vectorize
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white font-['Space_Grotesk'] leading-tight">
              Phân Vân Chọn Xe? Hãy Để <span className="text-red-500">Trợ Lý AI RAG</span> Tư Vấn Ngay
            </h3>

            <p className="text-sm text-gray-300 leading-relaxed">
              Bạn có thể hỏi tự nhiên: <em>"Tôi có 500 triệu nên mua xe gì?"</em>, <em>"Tìm xe 7 chỗ dưới 800 triệu"</em>, hoặc <em>"So sánh Mazda 3 và Honda City"</em>. Trợ lý AI sẽ đối soát dữ liệu thực tế từ D1 và đề xuất mẫu xe phù hợp nhất kèm link lái thử.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenChat}
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" /> Trò Chuyện Với Trợ Lý AI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Ô Tô Theo Phân Khúc (Segment Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
              Khám Phá Theo Phân Khúc Xe
            </h2>
            <p className="text-xs text-gray-400">
              Tìm xe theo nhu cầu gia đình, cá nhân hoặc di chuyển đô thị
            </p>
          </div>

          {/* Segment Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {['SUV', 'Sedan', 'MPV', 'Pickup', 'Điện'].map((seg) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(seg)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSegment === seg
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
                }`}
              >
                {seg === 'Điện' ? '⚡ Xe Thuần Điện' : `${seg}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {segmentCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onSelectDetail={onSelectDetail}
              onBookTestDrive={onBookTestDrive}
            />
          ))}
        </div>
      </section>

      {/* 6. Lý Do Lựa Chọn AUTO SMART (4 Value Props) */}
      <section className="py-16 bg-gray-900/60 border-y border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk'] mb-2">
              Tại Sao Nên Chọn Mua Xe Tại AUTO SMART?
            </h2>
            <p className="text-xs text-gray-400">
              Tiêu chuẩn showroom xe hàng đầu Việt Nam kết hợp công nghệ AI minh bạch
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800/80 space-y-3 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Kiểm Định 176 Hạng Mục</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Cam kết không đâm đụng, không ngập nước thủy kích, động cơ nguyên bản và hồ sơ pháp lý minh bạch 100%.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800/80 space-y-3 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Trợ Lý AI RAG 24/7</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tìm kiếm xe ngữ nghĩa qua Cloudflare Vectorize và LLaMA, tính toán ngân sách và so sánh chi tiết tức thì.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800/80 space-y-3 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                <BadgePercent className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Hỗ Trợ Vay Góp Đến 85%</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Liên kết hơn 12 ngân hàng lớn với lãi suất ưu đãi chỉ từ 7.5%/năm, thủ tục duyệt hồ sơ online trong 30 phút.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gray-950 border border-gray-800/80 space-y-3 hover:border-red-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Bảo Hành Lên Đến 3 Năm</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Gói bảo hành động cơ & hộp số toàn diện, hỗ trợ cứu hộ 24/7 và quyền lợi đổi trả trong 7 ngày nếu lỗi kỹ thuật.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Form Liên Hệ / Nhận Tư Vấn */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-gray-900 border border-gray-800 p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
              Cần Tư Vấn Mua Bán Hoặc Định Giá Xe?
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Để lại thông tin, đội ngũ chuyên viên AUTO SMART sẽ liên hệ hỗ trợ bạn trong vòng 10 phút
            </p>
          </div>

          {contactSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Cảm ơn bạn! Chuyên viên showroom đã tiếp nhận thông tin và sẽ gọi lại ngay.</span>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-3 text-xs max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Họ và tên của bạn"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Số điện thoại liên hệ"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <textarea
                rows={2}
                value={contactContent}
                onChange={(e) => setContactContent(e.target.value)}
                placeholder="Nhu cầu của bạn (Vd: Muốn xem xe VinFast VF 8 tại showroom Hà Nội, cần tính toán phương án trả góp...)"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              />

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> GỬI YÊU CẦU TƯ VẤN NGAY
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
