import React from 'react';
import { Brand } from '../types';

interface BrandSliderProps {
  brands: Brand[];
  selectedBrand: string;
  onSelectBrand: (brandName: string) => void;
}

export const BrandSlider: React.FC<BrandSliderProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
}) => {
  return (
    <div className="py-8 bg-gray-950 border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Thương Hiệu Phổ Biến Tại Showroom
          </h3>
          <span className="text-xs text-gray-500">
            Chính hãng & bảo hành toàn quốc
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
          {brands.map((b) => {
            const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
            return (
              <button
                key={b.id}
                onClick={() => onSelectBrand(isSelected ? 'all' : b.name)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 border ${
                  isSelected
                    ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30'
                    : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900'
                }`}
              >
                <span className="text-2xl">{b.logo}</span>
                <span className={`text-xs font-bold truncate max-w-full ${
                  isSelected ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {b.name}
                </span>
                {b.carCount !== undefined && b.carCount > 0 && (
                  <span className="text-[10px] text-gray-500 font-mono">
                    {b.carCount} xe
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
