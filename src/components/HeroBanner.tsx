import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  CarFront, 
  ChevronRight, 
  Award, 
  Zap, 
  Clock 
} from 'lucide-react';
import { Brand } from '../types';

interface HeroBannerProps {
  brands: Brand[];
  onSearchSubmit: (brand?: string, priceRange?: string) => void;
  onOpenChat: () => void;
  onExploreInventory: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  brands,
  onSearchSubmit,
  onOpenChat,
  onExploreInventory,
}) => {
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(selectedBrand, selectedPrice);
  };

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 pt-8 pb-16 sm:pb-24 border-b border-gray-800">
      
      {/* Background glow & accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid: Left Pitch, Right Showcase Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Mua Bán Ô Tô & AI RAG Thế Hệ Mới</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-['Space_Grotesk']">
              TÌM KIẾM & MUA Ô TÔ <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
                THÔNG MINH HƠN VỚI AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Showroom xe hơi trực tuyến cao cấp AUTO SMART. Hơn 150+ mẫu xe mới & lướt được kiểm định nghiêm ngặt 176 hạng mục. Trợ lý AI RAG tư vấn xe chuẩn xác theo ngân sách và nhu cầu gia đình.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onExploreInventory}
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <CarFront className="w-4 h-4" />
                <span>Xem Kho Xe Hiện Có</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenChat}
                className="px-6 py-3.5 rounded-2xl bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-700/80 font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Bot className="w-4 h-4 text-red-400" />
                <span>Hỏi Chatbot Tư Vấn RAG</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-2xl font-black text-white font-['Space_Grotesk']">100%</div>
                <div className="text-[11px] text-gray-400 font-medium">Kiểm định minh bạch</div>
              </div>
              <div>
                <div className="text-2xl font-black text-red-500 font-['Space_Grotesk']">0 VNĐ</div>
                <div className="text-[11px] text-gray-400 font-medium">Lái thử tận nhà</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-['Space_Grotesk']">24/7</div>
                <div className="text-[11px] text-gray-400 font-medium">Trợ lý AI phản hồi ngay</div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-gray-800/90 shadow-2xl bg-gray-950 group">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
                alt="Showroom AUTO SMART"
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/20" />

              {/* Floating Overlay Badge on Image */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-gray-950/85 backdrop-blur-md border border-gray-800/90 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Xe Nổi Bật Tuần Này</span>
                  <h4 className="text-sm font-bold text-white">VinFast VF 8 Plus 2024</h4>
                  <p className="text-xs font-black text-red-500 font-['Space_Grotesk'] mt-0.5">1.250.000.000 ₫</p>
                </div>
                <button
                  onClick={onExploreInventory}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all"
                >
                  Khám phá
                </button>
              </div>
            </div>

            {/* Small decorative floating card */}
            <div className="hidden sm:flex absolute -top-4 -left-6 items-center gap-2.5 p-3 rounded-2xl bg-gray-900/90 border border-gray-700 backdrop-blur-xl shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-white">Bảo Hành Chính Hãng</p>
                <p className="text-[10px] text-gray-400">Lên đến 7 - 10 năm</p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Search Floating Box */}
        <div className="mt-12 rounded-3xl bg-gray-900/90 border border-gray-800 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-black/50">
          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            
            {/* Select Brand */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Chọn Hãng Xe
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-red-500"
              >
                <option value="all">Tất cả hãng xe</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name}>{b.logo} {b.name}</option>
                ))}
              </select>
            </div>

            {/* Select Price */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Khoảng Ngân Sách
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-red-500"
              >
                <option value="all">Tất cả khoảng giá</option>
                <option value="under500">Dưới 500 triệu</option>
                <option value="500to800">500 triệu - 800 triệu</option>
                <option value="800to1200">800 triệu - 1.2 tỷ</option>
                <option value="above1200">Trên 1.2 tỷ</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-3 sm:pt-4">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Tìm Xe Phù Hợp</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
