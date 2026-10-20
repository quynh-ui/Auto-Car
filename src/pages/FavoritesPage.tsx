import React from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Car } from '../types';
import { CarCard } from '../components/CarCard';
import { useFavorites } from '../contexts/FavoritesContext';

interface FavoritesPageProps {
  cars: Car[];
  onSelectDetail: (car: Car) => void;
  onBookTestDrive: (car: Car) => void;
  onExploreCars: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  cars,
  onSelectDetail,
  onBookTestDrive,
  onExploreCars,
}) => {
  const { favorites } = useFavorites();
  const favoriteCars = cars.filter(c => favorites.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold mb-2">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Danh Sách Xe Quan Tâm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
          Xe Đã Lưu Yêu Thích ({favoriteCars.length})
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Các mẫu xe bạn đã lưu lại để so sánh thông số và theo dõi ưu đãi giảm giá
        </p>
      </div>

      {favoriteCars.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800 p-8 space-y-4">
          <Heart className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-300">Bạn chưa lưu mẫu xe nào</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Bấm vào biểu tượng trái tim ở góc mỗi xe trong danh mục để lưu vào danh sách yêu thích của bạn!
          </p>
          <button
            onClick={onExploreCars}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <span>Khám phá kho xe ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onSelectDetail={onSelectDetail}
              onBookTestDrive={onBookTestDrive}
            />
          ))}
        </div>
      )}
    </div>
  );
};
