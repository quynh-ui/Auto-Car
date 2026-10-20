import React from 'react';
import { 
  CarFront, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  ChevronRight 
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <CarFront className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-wider font-['Space_Grotesk']">
                  AUTO <span className="text-red-500">SMART</span>
                </span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  Hệ Thống Mua Bán & Tư Vấn Ô Tô Thông Minh
                </p>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed text-xs max-w-sm">
              Nền tảng mua bán ô tô trực tuyến thế hệ mới tích hợp công nghệ Cloudflare Workers AI RAG. Cam kết chất lượng xe minh bạch, kiểm định 176 hạng mục khắt khe, hỗ trợ thủ tục sang tên và giao xe toàn quốc.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Kiểm định 176 hạng mục
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI RAG Vectorize
              </div>
            </div>
          </div>

          {/* Showroom Network */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Hệ Thống Showroom
            </h4>
            <div className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Hà Nội (Trụ sở chính)
                </p>
                <p className="text-[11px] text-gray-400 pl-5">Tòa Charmvit, 117 Trần Duy Hưng, Cầu Giấy</p>
              </div>

              <div className="space-y-0.5">
                <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> TP. Hồ Chí Minh
                </p>
                <p className="text-[11px] text-gray-400 pl-5">104 Mai Chí Thọ, P. An Phú, TP. Thủ Đức</p>
              </div>

              <div className="space-y-0.5">
                <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Đà Nẵng
                </p>
                <p className="text-[11px] text-gray-400 pl-5">456 Nguyễn Tất Thành, Q. Hải Châu</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Dịch Vụ & Mua Xe
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('inventory')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> Danh sách xe đang bán
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('compare')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> Bảng so sánh xe
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('inventory')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> Xe thuần điện VinFast
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> Thủ tục vay trả góp 85%
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> Đăng ký bán xe / ký gửi
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Hotline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Hỗ Trợ 24/7
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800">
                <p className="text-[11px] text-gray-400">Tổng đài tư vấn miễn cước</p>
                <p className="text-base font-extrabold text-red-500 font-mono">1900 8888</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Phone className="w-3.5 h-3.5 text-red-400" />
                <span>Hotline: 0988 888 888</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>support@autosmart.vn</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span>Giờ mở cửa: 08:00 - 20:00 (Cả T7 & CN)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 AUTO SMART. Bản quyền thuộc về Hệ thống Ô tô Thông minh AUTO SMART.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Cloudflare Workers</span>
            <span>•</span>
            <span>Cloudflare D1</span>
            <span>•</span>
            <span>Cloudflare Vectorize</span>
            <span>•</span>
            <span>Workers AI</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
