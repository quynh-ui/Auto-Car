import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, XCircle, CarFront } from 'lucide-react';
import { TestDriveBooking } from '../types';
import { formatVNDCurrency } from '../services/ragBot';

interface BookingsPageProps {
  bookings: TestDriveBooking[];
  onExploreCars: () => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ bookings, onExploreCars }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
          Lịch Lái Thử Của Bạn
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Theo dõi trạng thái các cuộc hẹn trải nghiệm ô tô thực tế tại hệ thống Showroom AUTO SMART
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800 p-8 space-y-4">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-300">Bạn chưa đăng ký lịch lái thử nào</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Hãy khám phá kho xe AUTO SMART và chọn chiếc xe yêu thích để trải nghiệm cảm giác lái miễn phí!
          </p>
          <button
            onClick={onExploreCars}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Khám phá kho xe ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={b.carImage || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'}
                  alt={b.carTitle}
                  className="w-20 h-16 rounded-xl object-cover bg-black shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{b.carTitle}</h3>
                  <p className="text-xs font-black text-red-500 font-['Space_Grotesk']">
                    {formatVNDCurrency(b.carPrice)}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-red-400" /> {b.branch}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-200">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{b.preferredTime} - Ngày {b.preferredDate}</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                    b.status === 'CONFIRMED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : b.status === 'PENDING'
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {b.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                    {b.status === 'PENDING' && <AlertCircle className="w-3 h-3" />}
                    {b.status === 'PENDING' ? 'Chờ Showroom Xác Nhận' : b.status === 'CONFIRMED' ? 'Đã Xác Nhận' : b.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
