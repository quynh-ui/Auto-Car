import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Scale, 
  Calendar, 
  MapPin, 
  Fuel, 
  Gauge, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  PhoneCall, 
  Share2, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { Car } from '../types';
import { formatVNDCurrency, formatVND } from '../services/ragBot';
import { useCompare } from '../contexts/CompareContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
  onBookTestDrive: (car: Car) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({ car, onClose, onBookTestDrive }) => {
  const { addToCompare, isInCompare } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showLoanCalc, setShowLoanCalc] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(30); // 30% trả trước
  const [loanYears, setLoanYears] = useState(5); // 5 năm

  if (!car) return null;

  const inCompare = isInCompare(car.id);
  const favorited = isFavorite(car.id);

  // Loan calculation
  const downPaymentAmount = car.price * (downPaymentPct / 100);
  const loanAmount = car.price - downPaymentAmount;
  const annualInterestRate = 0.085; // 8.5%
  const totalMonths = loanYears * 12;
  const monthlyPrincipal = loanAmount / totalMonths;
  const monthlyInterestFirstMonth = loanAmount * (annualInterestRate / 12);
  const estimatedMonthlyPayment = Math.round(monthlyPrincipal + monthlyInterestFirstMonth);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-gray-950 border border-gray-800 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-gray-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* Left Column: Image Gallery & Highlights (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-7 bg-gray-900/60 border-b lg:border-b-0 lg:border-r border-gray-800">
            {/* Main Image */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black mb-3 group">
              <img
                src={car.images[activeImageIdx] || car.images[0]}
                alt={car.title}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {car.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : car.images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev < car.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-xs text-white backdrop-blur-md font-mono">
                {activeImageIdx + 1} / {car.images.length}
              </div>
            </div>

            {/* Thumbnail Row */}
            {car.images.length > 1 && (
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                {car.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIdx === idx ? 'border-red-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                Mô tả chi tiết từ showroom
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {car.description}
              </p>
            </div>

            {/* Features Checklist */}
            {car.features && car.features.length > 0 && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Trang bị & Tính năng nổi bật
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {car.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-200 bg-gray-950/60 p-2.5 rounded-xl border border-gray-800/80">
                      <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Pricing, Specs Sheet, Actions (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-950/40 px-2.5 py-1 rounded-md border border-red-500/20">
                  {car.brand} • {car.bodyType}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {car.location}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                {car.title}
              </h2>

              <p className="text-xs text-gray-400 mb-4">
                Phiên bản: <span className="text-gray-200 font-semibold">{car.version}</span> • Năm: <span className="text-gray-200 font-semibold">{car.year}</span> • Xuất xứ: <span className="text-gray-200 font-semibold">{car.origin}</span>
              </p>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-gray-900 to-gray-900 border border-red-500/30 mb-5">
                <div className="text-xs text-gray-400">Giá niêm yết chính hãng</div>
                <div className="text-3xl font-black text-red-500 font-['Space_Grotesk'] my-1">
                  {formatVNDCurrency(car.price)}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Khoảng: <strong>{formatVND(car.price)}</strong></span>
                  <button
                    onClick={() => setShowLoanCalc(!showLoanCalc)}
                    className="text-red-400 hover:text-red-300 underline flex items-center gap-1 text-[11px]"
                  >
                    <Calculator className="w-3.5 h-3.5" /> Tính góp từ {estimatedMonthlyPayment.toLocaleString()} đ/tháng
                  </button>
                </div>
              </div>

              {/* Loan Calculator Accordion */}
              {showLoanCalc && (
                <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 mb-5 text-xs space-y-3">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-red-500" /> Ước tính mua xe trả góp (Lãi suất ~8.5%/năm)
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Trả trước: {downPaymentPct}%</span>
                      <span className="text-white font-medium">{formatVNDCurrency(downPaymentAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      step="10"
                      value={downPaymentPct}
                      onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Thời gian vay: {loanYears} năm</span>
                      <span className="text-white font-medium">{loanYears * 12} tháng</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={loanYears}
                      onChange={(e) => setLoanYears(Number(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center font-semibold">
                    <span className="text-gray-300">Góp tháng đầu dự kiến:</span>
                    <span className="text-base text-red-400 font-bold">{formatVNDCurrency(estimatedMonthlyPayment)}/tháng</span>
                  </div>
                </div>
              )}

              {/* Technical Specifications Matrix */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  Thông số kỹ thuật chi tiết
                </h4>
                <div className="space-y-1.5 text-xs">
                  {car.specs.engine && (
                    <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                      <span className="text-gray-400">Động cơ:</span>
                      <span className="font-semibold text-gray-100">{car.specs.engine}</span>
                    </div>
                  )}
                  {car.specs.horsepower && (
                    <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                      <span className="text-gray-400">Công suất:</span>
                      <span className="font-semibold text-gray-100">{car.specs.horsepower}</span>
                    </div>
                  )}
                  {car.specs.torque && (
                    <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                      <span className="text-gray-400">Mô-men xoắn:</span>
                      <span className="font-semibold text-gray-100">{car.specs.torque}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                    <span className="text-gray-400">Hộp số:</span>
                    <span className="font-semibold text-gray-100">{car.transmission}</span>
                  </div>
                  {car.specs.drivetrain && (
                    <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                      <span className="text-gray-400">Hệ dẫn động:</span>
                      <span className="font-semibold text-gray-100">{car.specs.drivetrain}</span>
                    </div>
                  )}
                  {car.specs.fuelConsumption && (
                    <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                      <span className="text-gray-400">Mức tiêu thụ:</span>
                      <span className="font-semibold text-gray-100">{car.specs.fuelConsumption}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                    <span className="text-gray-400">Số chỗ ngồi:</span>
                    <span className="font-semibold text-gray-100">{car.seats} chỗ</span>
                  </div>
                  {car.specs.dimensions && (
                    <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                      <span className="text-gray-400">Dài x Rộng x Cao:</span>
                      <span className="font-semibold text-gray-100">{car.specs.dimensions}</span>
                    </div>
                  )}
                  {car.specs.airbags && (
                    <div className="flex justify-between py-1.5 px-3 rounded-lg bg-gray-900/80 border border-gray-800/60">
                      <span className="text-gray-400">Túi khí:</span>
                      <span className="font-semibold text-gray-100">{car.specs.airbags} túi khí</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Contact Card */}
              <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Đơn vị quản lý:</p>
                  <p className="text-sm font-bold text-white">{car.sellerName}</p>
                  <p className="text-xs text-red-400 font-mono mt-0.5">{car.sellerPhone}</p>
                </div>
                <a
                  href={`tel:${car.sellerPhone.replace(/\s+/g, '')}`}
                  className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-all"
                  title="Gọi hotline tư vấn"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-gray-800 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => addToCompare(car)}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    inCompare
                      ? 'bg-red-950/60 text-red-400 border-red-500/50'
                      : 'bg-gray-900 text-gray-200 border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>{inCompare ? 'Đã trong so sánh' : 'So sánh xe này'}</span>
                </button>

                <button
                  onClick={() => toggleFavorite(car.id)}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    favorited
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-gray-900 text-gray-200 border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                  <span>{favorited ? 'Đã lưu yêu thích' : 'Lưu yêu thích'}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onBookTestDrive(car);
                }}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>ĐẶT LỊCH LÁI THỬ TRỰC TIẾP TẠI SHOWROOM</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
