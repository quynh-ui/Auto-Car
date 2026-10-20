import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Sparkles, RotateCcw } from 'lucide-react';
import { Car, Brand, FilterParams } from '../types';
import { CarFilter } from '../components/CarFilter';
import { CarCard } from '../components/CarCard';

interface InventoryPageProps {
  cars: Car[];
  brands: Brand[];
  onSelectDetail: (car: Car) => void;
  onBookTestDrive: (car: Car) => void;
  initialFilters?: FilterParams;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  cars,
  brands,
  onSelectDetail,
  onBookTestDrive,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterParams>(initialFilters || {
    brand: 'all',
    bodyType: 'all',
    fuel: 'all',
    sort: 'newest',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  // Filter cars client-side
  let filtered = [...cars];

  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    filtered = filtered.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }

  if (filters.brand && filters.brand !== 'all') {
    filtered = filtered.filter(c => c.brand.toLowerCase() === filters.brand!.toLowerCase());
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(c => c.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(c => c.price <= filters.maxPrice!);
  }

  if (filters.bodyType && filters.bodyType !== 'all') {
    filtered = filtered.filter(c => c.bodyType.toLowerCase() === filters.bodyType!.toLowerCase());
  }

  if (filters.fuel && filters.fuel !== 'all') {
    filtered = filtered.filter(c => c.fuel.toLowerCase() === filters.fuel!.toLowerCase());
  }

  if (filters.seats && filters.seats > 0) {
    filtered = filtered.filter(c => c.seats === filters.seats);
  }

  // Sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'year_desc':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'mileage_asc':
        filtered.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-['Space_Grotesk']">
            Kho Ô Tô AUTO SMART
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Danh sách tất cả các mẫu xe đang sẵn sàng giao ngay tại showroom Hà Nội, TP.HCM và Đà Nẵng
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            title="Dạng lưới"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            title="Dạng danh sách"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <CarFilter
        filters={filters}
        setFilters={setFilters}
        brands={brands}
        totalResults={filtered.length}
      />

      {/* Cars Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800 p-8 space-y-4">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-300">Không tìm thấy mẫu xe nào khớp với bộ lọc</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Vui lòng thử chọn khoảng giá rộng hơn hoặc xóa bớt các tiêu chí lọc hãng/số chỗ.
          </p>
          <button
            onClick={() => setFilters({ brand: 'all', bodyType: 'all', fuel: 'all', sort: 'newest' })}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'grid grid-cols-1 sm:grid-cols-2 gap-6'
        }>
          {filtered.map((car) => (
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
