import React from 'react';
import { 
  Search, 
  RotateCcw, 
  Filter, 
  Check, 
  ChevronDown, 
  Sparkles 
} from 'lucide-react';
import { FilterParams, Brand } from '../types';
import { formatVND } from '../services/ragBot';

interface CarFilterProps {
  filters: FilterParams;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
  brands: Brand[];
  totalResults: number;
}

const PRICE_PRESETS = [
  { label: 'Tất cả mức giá', min: undefined, max: undefined },
  { label: 'Dưới 500 triệu', min: undefined, max: 500000000 },
  { label: '500 - 800 triệu', min: 500000000, max: 800000000 },
  { label: '800tr - 1.2 tỷ', min: 800000000, max: 1200000000 },
  { label: 'Trên 1.2 tỷ', min: 1200000000, max: undefined },
];

const BODY_TYPES = ['Tất cả', 'Sedan', 'SUV', 'MPV', 'Hatchback', 'Pickup'];
const FUELS = ['Tất cả', 'Xăng', 'Dầu', 'Điện', 'Hybrid'];
const SEATS = [
  { label: 'Tất cả chỗ', val: 0 },
  { label: '5 chỗ', val: 5 },
  { label: '7 chỗ', val: 7 },
];

export const CarFilter: React.FC<CarFilterProps> = ({
  filters,
  setFilters,
  brands,
  totalResults,
}) => {
  const handlePricePreset = (min?: number, max?: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      brand: 'all',
      minPrice: undefined,
      maxPrice: undefined,
      bodyType: 'all',
      fuel: 'all',
      transmission: 'all',
      seats: 0,
      condition: 'all',
      sort: 'newest',
    });
  };

  const isFiltered = 
    Boolean(filters.query) ||
    (filters.brand && filters.brand !== 'all') ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.bodyType && filters.bodyType !== 'all') ||
    (filters.fuel && filters.fuel !== 'all') ||
    Boolean(filters.seats && filters.seats > 0);

  return (
    <div className="rounded-3xl bg-gray-900/80 border border-gray-800 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5">
      
      {/* Top Search & Results Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div className="relative flex-1">
          <input
            type="text"
            value={filters.query || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Tìm theo tên xe, model hoặc địa điểm... (Vd: VF 8, Vios, CX-5)"
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-gray-400">
            Tìm thấy <strong className="text-red-400 font-bold">{totalResults}</strong> xe
          </span>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
            </button>
          )}

          {/* Sort Dropdown */}
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
            className="bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="newest">Mới cập nhật</option>
            <option value="price_asc">Giá: Thấp đến Cao</option>
            <option value="price_desc">Giá: Cao đến Thấp</option>
            <option value="year_desc">Năm sản xuất mới nhất</option>
            <option value="mileage_asc">Số km thấp nhất</option>
          </select>
        </div>
      </div>

      {/* Filter Row 1: Brand Pills */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          Hãng sản xuất
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, brand: 'all' }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !filters.brand || filters.brand === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            Tất cả
          </button>
          {brands.map((b) => {
            const isSelected = filters.brand?.toLowerCase() === b.name.toLowerCase();
            return (
              <button
                key={b.id}
                onClick={() => setFilters(prev => ({ ...prev, brand: isSelected ? 'all' : b.name }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
                }`}
              >
                <span>{b.logo}</span>
                <span>{b.name}</span>
                {b.carCount !== undefined && b.carCount > 0 && (
                  <span className="text-[10px] opacity-70">({b.carCount})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Row 2: Price Presets */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          Khoảng giá ngân sách
        </label>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset, idx) => {
            const isMatch = filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={idx}
                onClick={() => handlePricePreset(preset.min, preset.max)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isMatch
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Row 3: Segment / Body Type & Seats & Fuel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Body Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Kiểu dáng xe
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BODY_TYPES.map((bt) => {
              const val = bt === 'Tất cả' ? 'all' : bt;
              const isSelected = (!filters.bodyType && bt === 'Tất cả') || filters.bodyType === val;
              return (
                <button
                  key={bt}
                  onClick={() => setFilters(prev => ({ ...prev, bodyType: val }))}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gray-200 text-gray-950 font-bold'
                      : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                  }`}
                >
                  {bt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Nhiên liệu
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FUELS.map((f) => {
              const val = f === 'Tất cả' ? 'all' : f;
              const isSelected = (!filters.fuel && f === 'Tất cả') || filters.fuel === val;
              return (
                <button
                  key={f}
                  onClick={() => setFilters(prev => ({ ...prev, fuel: val }))}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gray-200 text-gray-950 font-bold'
                      : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seats */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Số chỗ ngồi
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SEATS.map((s) => {
              const isSelected = (!filters.seats && s.val === 0) || filters.seats === s.val;
              return (
                <button
                  key={s.label}
                  onClick={() => setFilters(prev => ({ ...prev, seats: s.val }))}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gray-200 text-gray-950 font-bold'
                      : 'bg-gray-950 text-gray-400 border border-gray-800 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
