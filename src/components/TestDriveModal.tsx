import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  CarFront, 
  Phone, 
  Mail, 
  User, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Car, TestDriveBooking } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatVNDCurrency } from '../services/ragBot';

interface TestDriveModalProps {
  car: Car | null;
  cars: Car[];
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: TestDriveBooking) => void;
}

const SHOWROOM_BRANCHES = [
  'Showroom AUTO SMART Hà Nội (Tòa Charmvit, 117 Trần Duy Hưng, Cầu Giấy)',
  'Showroom AUTO SMART TP. Hồ Chí Minh (104 Mai Chí Thọ, P. An Phú, TP. Thủ Đức)',
  'Showroom AUTO SMART Đà Nẵng (456 Nguyễn Tất Thành, Q. Hải Châu)',
];

export const TestDriveModal: React.FC<TestDriveModalProps> = ({
  car,
  cars,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { user } = useAuth();
  const [selectedCarId, setSelectedCarId] = useState<string>(car?.id || cars[0]?.id || '');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:30');
  const [branch, setBranch] = useState(SHOWROOM_BRANCHES[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync selected car when prop changes
  React.useEffect(() => {
    if (car) setSelectedCarId(car.id);
  }, [car]);

  if (!isOpen) return null;

  const currentCar = cars.find(c => c.id === selectedCarId) || car || cars[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !currentCar) return;

    setIsSubmitting(true);
    try {
      const newBooking = await api.createBooking({
        carId: currentCar.id,
        carTitle: currentCar.title,
        carImage: currentCar.images[0] || '',
        carPrice: currentCar.price,
        userId: user?.id,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || 'khachhang@autosmart.vn',
        preferredDate: date,
        preferredTime: time,
        branch,
        notes,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setIsSuccess(true);
      if (onBookingSuccess) onBookingSuccess(newBooking);
    } catch (err) {
      alert('Không thể gửi lịch lái thử. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-gray-950 border border-gray-800 shadow-2xl overflow-hidden my-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-white font-['Space_Grotesk']">
              Đặt Lịch Lái Thử Thành Công!
            </h3>

            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Yêu cầu lái thử mẫu xe <strong className="text-white">{currentCar?.title}</strong> của quý khách đã được ghi nhận vào hệ thống D1 với trạng thái <span className="text-amber-400 font-semibold">Chờ xác nhận (PENDING)</span>.
            </p>

            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-400">Thời gian hẹn:</span>
                <span className="text-white font-semibold">{time} - {date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Địa điểm:</span>
                <span className="text-white font-semibold truncate ml-2 max-w-[240px]">{branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Người liên hệ:</span>
                <span className="text-white font-semibold">{name} ({phone})</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Chuyên viên tư vấn AUTO SMART sẽ liên hệ lại qua số điện thoại để xác nhận lịch trình trong vòng 15 phút.
            </p>

            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="mt-4 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-1 text-red-500 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Trải Nghiệm Lái Thử Thực Tế
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk'] mb-2">
              Đăng Ký Lái Thử Ô Tô Miễn Phí
            </h3>

            <p className="text-xs text-gray-400 mb-6">
              Trải nghiệm thực tế cảm giác lái, khả năng cách âm và công nghệ thông minh trước khi đưa ra quyết định mua xe.
            </p>

            {/* Selected Car preview / selector */}
            {currentCar && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900 border border-gray-800/80 mb-5">
                <img
                  src={currentCar.images[0]}
                  alt={currentCar.title}
                  className="w-16 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{currentCar.title}</h4>
                  <p className="text-xs font-bold text-red-400 font-['Space_Grotesk']">
                    {formatVNDCurrency(currentCar.price)}
                  </p>
                </div>
                {cars.length > 1 && (
                  <select
                    value={selectedCarId}
                    onChange={(e) => setSelectedCarId(e.target.value)}
                    className="text-xs bg-gray-950 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 max-w-[120px]"
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        Đổi: {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Họ và tên của bạn <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                    />
                    <User className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0988 xxx xxx"
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                    />
                    <Phone className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Ngày hẹn mong muốn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Khung giờ dự kiến <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="08:30">08:30 - Sáng</option>
                    <option value="09:30">09:30 - Sáng (Đề xuất)</option>
                    <option value="10:30">10:30 - Sáng</option>
                    <option value="14:00">14:00 - Chiều</option>
                    <option value="15:30">15:30 - Chiều</option>
                    <option value="17:00">17:00 - Chiều</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Chọn Showroom phục vụ <span className="text-red-500">*</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-red-500"
                >
                  {SHOWROOM_BRANCHES.map((b, idx) => (
                    <option key={idx} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Ghi chú thêm (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Cần tư vấn thêm gói vay trả góp 5 năm, muốn lái thử thêm trên cao tốc..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Đang gửi yêu cầu vào D1...' : 'GỬI ĐĂNG KÝ LÁI THỬ NGAY'}
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-2">
                  AUTO SMART cam kết bảo mật thông tin cá nhân khách hàng theo chuẩn quốc tế.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
