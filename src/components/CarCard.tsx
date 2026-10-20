import React from 'react';
import { 
  Fuel, 
  Gauge, 
  Users, 
  MapPin, 
  Scale, 
  Heart, 
  Calendar,
  CheckCircle2,
  Sparkles,
  Zap,
  PhoneCall
} from 'lucide-react';
import { Car } from '../types';
import { formatVNDCurrency, formatVND } from '../services/ragBot';
import { useCompare } from '../contexts/CompareContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface CarCardProps {
  car: Car;
  onSelectDetail: (car: Car) => void;
  onBookTestDrive: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onSelectDetail, onBookTestDrive }) => {
  const { addToCompare, isInCompare } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();

  const inCompare = isInCompare(car.id);
  const favorited = isFavorite(car.id);

  // Tính ước lượng tiền góp hàng tháng (vay 70% trong 5 năm, lãi suất 8%/năm)
  const loanPrincipal = car.price * 0.7;
  const monthlyEstimate = Math.round((loanPrincipal / 60) + (loanPrincipal * 0.08 / 12));
  const monthlyFormatted = (monthlyEstimate / 1_000_000).toFixed(1);

  return (
    <div className="group relative rounded-2xl bg-gray-900/90 border border-gray-800/90 overflow-hidden hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 flex flex-col">
      
      {/* Image Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-950 cursor-pointer" onClick={() => onSelectDetail(car)}>
        <img
          src={car.images[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/40 opacity-70" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md uppercase tracking-wider ${
            car.condition === 'Mới 100%' 
              ? 'bg-red-600/90 text-white shadow-sm shadow-red-900/40' 
              : 'bg-gray-800/90 text-gray-200 border border-gray-700'
          }`}>
            {car.condition}
          </span>

          {car.fuel === 'Điện' && (
            <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3" /> Thuần điện
            </span>
          )}

          {car.fuel === 'Hybrid' && (
            <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-teal-600/90 text-white backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Hybrid
            </span>
          )}

          {car.status === 'SOLD' && (
            <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-gray-700 text-gray-300">
              ĐÃ BÁN
            </span>
          )}
        </div>

        {/* Top Right Actions: Favorite & Compare */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(car.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              favorited 
                ? 'bg-red-600 text-white' 
                : 'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
            }`}
            title="Lưu yêu thích"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCompare(car);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              inCompare 
                ? 'bg-red-600 text-white ring-2 ring-red-400' 
                : 'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
            }`}
            title="Thêm vào so sánh"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Image Info: Location & Year */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-gray-300 z-10">
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
            <MapPin className="w-3 h-3 text-red-400" /> {car.location}
          </span>
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md font-medium">
            <Calendar className="w-3 h-3 text-gray-400" /> Đời {car.year}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Title */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-red-400">{car.brand}</span>
            <span>{car.bodyType} • {car.origin}</span>
          </div>
          
          <h3 
            onClick={() => onSelectDetail(car)}
            className="text-lg font-bold text-white hover:text-red-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {car.title}
          </h3>

          {/* Key Specs Matrix */}
          <div className="grid grid-cols-3 gap-2 my-3.5 py-3 border-y border-gray-800/80 text-xs">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-950/60 text-center">
              <span className="text-gray-400 flex items-center gap-1">
                <Fuel className="w-3 h-3 text-red-500" /> Nhiên liệu
              </span>
              <span className="font-semibold text-gray-200 mt-0.5 truncate">{car.fuel}</span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-950/60 text-center">
              <span className="text-gray-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-blue-400" /> Đã chạy
              </span>
              <span className="font-semibold text-gray-200 mt-0.5">
                {car.mileage > 0 ? `${(car.mileage / 1000).toFixed(0)}k km` : '0 km'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gray-950/60 text-center">
              <span className="text-gray-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-400" /> Chỗ ngồi
              </span>
              <span className="font-semibold text-gray-200 mt-0.5">{car.seats} chỗ</span>
            </div>
          </div>

          {/* Key Features Bullet Tag */}
          {car.features && car.features.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 line-clamp-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{car.features.slice(0, 2).join(' • ')}</span>
            </div>
          )}
        </div>

        {/* Pricing & Call to Actions */}
        <div className="pt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-xl sm:text-2xl font-black text-red-500 tracking-tight font-['Space_Grotesk']">
                {formatVNDCurrency(car.price)}
              </div>
              <div className="text-[11px] text-gray-400">
                Ước tính trả góp từ <span className="text-gray-300 font-semibold">{monthlyFormatted} tr/tháng</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                {car.transmission}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectDetail(car)}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-all text-center border border-gray-700/60"
            >
              Xem chi tiết
            </button>

            <button
              onClick={() => onBookTestDrive(car)}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-all text-center flex items-center justify-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> Lái thử
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
