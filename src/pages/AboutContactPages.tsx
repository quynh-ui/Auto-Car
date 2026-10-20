import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CarFront, 
  Bot, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold">
          Về Chúng Tôi
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-['Space_Grotesk']">
          AUTO SMART – Hệ Thống Ô Tô Thông Minh
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Được thành lập với sứ mệnh minh bạch hóa thị trường mua bán xe hơi Việt Nam bằng công nghệ trí tuệ nhân tạo RAG và quy trình kiểm định 176 hạng mục độc lập.
        </p>
      </div>

      {/* Hero Showcase Photo */}
      <div className="rounded-3xl overflow-hidden border border-gray-800 aspect-[21/9] bg-black">
        <img
          src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1400&q=80"
          alt="Showroom AUTO SMART"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Kiểm Định Minh Bạch</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Mỗi chiếc xe trước khi lên sàn đều trải qua bài kiểm tra 176 điểm: khung gầm, động cơ, hộp số, hệ thống điện và lịch sử bảo dưỡng chính hãng.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Trí Tuệ Nhân Tạo RAG</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ứng dụng Cloudflare Workers AI và mô hình Vectorize để thấu hiểu câu hỏi ngôn ngữ tự nhiên tiếng Việt, đưa ra lời khuyên chuẩn xác dựa trên tồn kho thực.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
            <CarFront className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Hệ Sinh Thái Toàn Diện</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Từ lái thử miễn phí tại nhà, hỗ trợ vay ngân hàng 85%, làm thủ tục sang tên đổi chủ đến bảo hành chính hãng lên đến 3 năm hoặc 100.000 km.
          </p>
        </div>
      </div>

    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk']">
          Liên Hệ Showroom AUTO SMART
        </h1>
        <p className="text-xs text-gray-400 max-w-lg mx-auto">
          Đội ngũ tư vấn viên và chuyên gia thẩm định xe luôn sẵn sàng hỗ trợ bạn tại 3 thành phố lớn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branches Info */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Showroom Hà Nội (Trụ sở chính)
            </h3>
            <p className="text-xs text-gray-400">Tòa nhà Charmvit Tower, 117 Trần Duy Hưng, Cầu Giấy, Hà Nội</p>
            <p className="text-xs text-red-400 font-mono">Hotline: 0988 888 888</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Showroom TP. Hồ Chí Minh
            </h3>
            <p className="text-xs text-gray-400">104 Mai Chí Thọ, P. An Phú, TP. Thủ Đức, TP. Hồ Chí Minh</p>
            <p className="text-xs text-red-400 font-mono">Hotline: 0909 090 909</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Showroom Đà Nẵng
            </h3>
            <p className="text-xs text-gray-400">456 Nguyễn Tất Thành, Q. Hải Châu, TP. Đà Nẵng</p>
            <p className="text-xs text-red-400 font-mono">Hotline: 0977 777 777</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800">
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-4">
            Gửi Lời Nhắn Trực Tiếp
          </h3>

          {submitted ? (
            <div className="p-6 text-center space-y-2 text-emerald-400">
              <CheckCircle2 className="w-10 h-10 mx-auto" />
              <p className="text-sm font-bold text-white">Yêu cầu đã được gửi thành công!</p>
              <p className="text-xs text-gray-400">Chúng tôi sẽ liên hệ lại bạn trong ít phút.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  placeholder="0988 xxx xxx"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Nội dung</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Gửi tin nhắn
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
