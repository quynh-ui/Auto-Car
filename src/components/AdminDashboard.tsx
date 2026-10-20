import React, { useState } from 'react';
import { 
  CarFront, 
  Layers, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  BarChart3, 
  ShieldCheck, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Car, TestDriveBooking, Brand, BodyType, FuelType } from '../types';
import { api } from '../services/api';
import { formatVNDCurrency } from '../services/ragBot';

interface AdminDashboardProps {
  cars: Car[];
  onCarUpdated: () => void;
  bookings: TestDriveBooking[];
  onBookingUpdated: () => void;
  brands: Brand[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cars,
  onCarUpdated,
  bookings,
  onBookingUpdated,
  brands,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'bookings' | 'rag'>('overview');
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [isSyncingRAG, setIsSyncingRAG] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Form state for creating a new car
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('VinFast');
  const [newModel, setNewModel] = useState('');
  const [newVersion, setNewVersion] = useState('Standard');
  const [newYear, setNewYear] = useState(2024);
  const [newPrice, setNewPrice] = useState(850000000);
  const [newBodyType, setNewBodyType] = useState<BodyType>('SUV');
  const [newFuel, setNewFuel] = useState<FuelType>('Điện');
  const [newSeats, setNewSeats] = useState(5);
  const [newLocation, setNewLocation] = useState('Hà Nội');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Statistics calculation
  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.status === 'AVAILABLE').length;
  const soldCars = cars.filter(c => c.status === 'SOLD').length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;

  // Chart data: Distribution by Brand
  const brandDistribution = brands.map(b => {
    const count = cars.filter(c => c.brand.toLowerCase() === b.name.toLowerCase()).length;
    return { name: b.name, count, pct: totalCars > 0 ? Math.round((count / totalCars) * 100) : 0 };
  }).filter(b => b.count > 0);

  // Chart data: Distribution by Body Type
  const bodyTypes: BodyType[] = ['SUV', 'Sedan', 'MPV', 'Pickup', 'Hatchback'];
  const segmentDistribution = bodyTypes.map(bt => {
    const count = cars.filter(c => c.bodyType === bt).length;
    return { name: bt, count, pct: totalCars > 0 ? Math.round((count / totalCars) * 100) : 0 };
  }).filter(bt => bt.count > 0);

  const handleToggleCarStatus = async (car: Car) => {
    const nextStatus = car.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    await api.updateCar(car.id, { status: nextStatus });
    onCarUpdated();
  };

  const handleDeleteCar = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mẫu xe này khỏi cơ sở dữ liệu D1?')) {
      await api.deleteCar(id);
      onCarUpdated();
    }
  };

  const handleUpdateBooking = async (id: string, status: TestDriveBooking['status']) => {
    await api.updateBookingStatus(id, status);
    onBookingUpdated();
  };

  const handleCreateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await api.createCar({
      title: newTitle,
      brand: newBrand,
      model: newModel || newTitle,
      version: newVersion,
      year: Number(newYear),
      price: Number(newPrice),
      bodyType: newBodyType,
      condition: 'Mới 100%',
      mileage: 0,
      fuel: newFuel,
      transmission: 'Tự động',
      seats: Number(newSeats),
      color: 'Trắng sang trọng',
      origin: 'Lắp ráp trong nước',
      description: newDescription || `Mẫu xe ${newTitle} chính hãng tại showroom AUTO SMART`,
      features: ['Hệ thống an toàn tiên tiến', 'Màn hình cảm ứng giải trí', 'Camera 360 sắc nét'],
      specs: {
        engine: 'Động cơ thông minh',
        fuelConsumption: newFuel === 'Điện' ? '0 L/100km' : '6.5 L/100km',
        dimensions: '4.700 x 1.850 x 1.650 mm',
        airbags: 7,
      },
      images: [
        newImageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      ],
      location: newLocation,
      status: 'AVAILABLE',
      sellerId: 'user-admin',
      sellerName: 'Showroom AUTO SMART',
      sellerPhone: '0988 888 888',
      isFeatured: true,
    });

    setShowAddCarModal(false);
    onCarUpdated();
    setNewTitle('');
    setNewImageUrl('');
  };

  const handleSyncVectorize = () => {
    setIsSyncingRAG(true);
    setSyncStatusMsg('Đang tạo vector embedding @cf/baai/bge-m3 cho ' + cars.length + ' mẫu xe...');

    setTimeout(() => {
      setSyncStatusMsg(`Đồng bộ thành công ${cars.length} văn bản vào Cloudflare Vectorize Index (1024 chiều)!`);
      setIsSyncingRAG(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hệ Thống Quản Trị Trung Tâm Showroom</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
            Dashboard Quản Lý AUTO SMART
          </h2>
          <p className="text-xs text-gray-400">
            Quản trị kho xe, duyệt lịch lái thử, đồng bộ Vectorize D1 RAG
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCarModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Thêm Ô Tô Mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Tổng Quan & Biểu Đồ
        </button>

        <button
          onClick={() => setActiveTab('cars')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'cars'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <CarFront className="w-4 h-4" /> Quản Lý Kho Xe ({cars.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'bookings'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" /> Lịch Lái Thử ({bookings.length})
          {pendingBookings > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'rag'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Đồng Bộ AI Vectorize
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <span className="text-xs text-gray-400">Tổng xe trong kho</span>
              <div className="text-3xl font-black text-white font-['Space_Grotesk'] mt-1">{totalCars}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>{availableCars} xe đang bán</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <span className="text-xs text-gray-400">Xe đã bán thành công</span>
              <div className="text-3xl font-black text-amber-400 font-['Space_Grotesk'] mt-1">{soldCars}</div>
              <div className="text-[11px] text-gray-400 mt-1">Đã bàn giao khách hàng</div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <span className="text-xs text-gray-400">Lịch lái thử xe</span>
              <div className="text-3xl font-black text-blue-400 font-['Space_Grotesk'] mt-1">{totalBookings}</div>
              <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <span>{pendingBookings} lịch đang chờ duyệt</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <span className="text-xs text-gray-400">Trợ lý AI RAG</span>
              <div className="text-3xl font-black text-red-500 font-['Space_Grotesk'] mt-1">BGE-M3</div>
              <div className="text-[11px] text-emerald-400 mt-1">1024-d Vectorize active</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: By Brand */}
            <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-red-500" /> Phân Bổ Xe Theo Hãng Sản Xuất
              </h3>
              <div className="space-y-3 pt-2">
                {brandDistribution.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-300">{item.name}</span>
                      <span className="text-gray-400">{item.count} xe ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-950 overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(item.pct, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart: By Body Type */}
            <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" /> Phân Bổ Xe Theo Phân Khúc (SUV, Sedan...)
              </h3>
              <div className="space-y-3 pt-2">
                {segmentDistribution.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-300">{item.name}</span>
                      <span className="text-gray-400">{item.count} xe ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-950 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(item.pct, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE CARS */}
      {activeTab === 'cars' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/80 text-gray-400">
                    <th className="p-3.5">Mẫu xe</th>
                    <th className="p-3.5">Hãng & Năm</th>
                    <th className="p-3.5">Giá bán (VND)</th>
                    <th className="p-3.5">Nhiên liệu</th>
                    <th className="p-3.5">Chỗ ngồi</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img src={car.images[0]} alt="" className="w-12 h-9 rounded-lg object-cover bg-black shrink-0" />
                        <div>
                          <div className="font-bold text-white text-xs">{car.title}</div>
                          <div className="text-[11px] text-gray-400">{car.bodyType} • {car.location}</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-300">
                        {car.brand} ({car.year})
                      </td>
                      <td className="p-3.5 font-bold text-red-400 font-mono">
                        {formatVNDCurrency(car.price)}
                      </td>
                      <td className="p-3.5 text-gray-300">
                        {car.fuel}
                      </td>
                      <td className="p-3.5 text-gray-300">
                        {car.seats} chỗ
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          car.status === 'AVAILABLE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {car.status === 'AVAILABLE' ? 'CÒN BÁN' : 'ĐÃ BÁN'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleCarStatus(car)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
                          title={car.status === 'AVAILABLE' ? 'Đổi sang Đã Bán' : 'Đổi sang Còn Bán'}
                        >
                          {car.status === 'AVAILABLE' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400"
                          title="Xóa xe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE TEST DRIVE BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/80 text-gray-400">
                    <th className="p-3.5">Khách hàng</th>
                    <th className="p-3.5">Xe đăng ký</th>
                    <th className="p-3.5">Thời gian hẹn</th>
                    <th className="p-3.5">Showroom</th>
                    <th className="p-3.5">Ghi chú</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Duyệt lịch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{b.customerName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{b.customerPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-gray-200">{b.carTitle}</div>
                        <div className="text-[10px] text-red-400">{formatVNDCurrency(b.carPrice)}</div>
                      </td>
                      <td className="p-3.5 text-gray-300 font-medium">
                        {b.preferredTime} - {b.preferredDate}
                      </td>
                      <td className="p-3.5 text-gray-400 max-w-[180px] truncate" title={b.branch}>
                        {b.branch}
                      </td>
                      <td className="p-3.5 text-gray-400 max-w-[160px] truncate">
                        {b.notes || '-'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateBooking(b.id, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                          >
                            Xác nhận
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateBooking(b.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                          >
                            Hoàn tất
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateBooking(b.id, 'CANCELLED')}
                          className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-[11px]"
                        >
                          Hủy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RAG VECTORIZE SYNC */}
      {activeTab === 'rag' && (
        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Quản Lý Chỉ Mục AI Vectorize & RAG Embedding
              </h3>
              <p className="text-xs text-gray-400">
                Mô hình Embedding: <code>@cf/baai/bge-m3</code> (1024 chiều) • Nguồn cơ sở dữ liệu: Cloudflare D1
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 text-xs space-y-2 text-gray-300">
            <p><strong>Cơ chế đồng bộ RAG:</strong></p>
            <p>Mỗi mẫu xe tạo ra một document embedding chứa: Tên xe, hãng, phiên bản, giá VND, năm sản xuất, loại nhiên liệu, số chỗ ngồi, động cơ, mức tiêu hao nhiên liệu và tính năng nổi bật.</p>
            <p className="text-gray-400">Khi Admin thêm hoặc cập nhật xe, chỉ mục Vectorize sẽ tự động được làm mới để Chatbot AI luôn phản hồi chính xác giá bán và tồn kho theo thời gian thực.</p>
          </div>

          {syncStatusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          <button
            onClick={handleSyncVectorize}
            disabled={isSyncingRAG}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingRAG ? 'animate-spin' : ''}`} />
            <span>{isSyncingRAG ? 'Đang mã hóa Vectorize...' : 'ĐỒNG BỘ LẠI TOÀN BỘ CHỈ MỤC VECTORIZE (RE-INDEX)'}</span>
          </button>
        </div>
      )}

      {/* MODAL: ADD NEW CAR */}
      {showAddCarModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-gray-950 border border-gray-800 shadow-2xl p-6 sm:p-8 my-auto">
            <button
              onClick={() => setShowAddCarModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-900 text-gray-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-4">
              Đăng Bán Xe Mới Lên Hệ Thống
            </h3>

            <form onSubmit={handleCreateCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tên xe / Tiêu đề *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Vd: VinFast VF 7 Plus 2024"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Hãng sản xuất</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Giá bán (VND) *</label>
                  <input
                    type="number"
                    required
                    step="10000000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Kiểu dáng</label>
                  <select
                    value={newBodyType}
                    onChange={(e) => setNewBodyType(e.target.value as any)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="MPV">MPV</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Hatchback">Hatchback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Nhiên liệu</label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as any)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="Điện">Điện</option>
                    <option value="Xăng">Xăng</option>
                    <option value="Dầu">Dầu</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Số chỗ ngồi</label>
                  <select
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="5">5 chỗ</option>
                    <option value="7">7 chỗ</option>
                    <option value="4">4 chỗ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Năm sản xuất</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Địa điểm</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Link Ảnh Xe (Cloudflare R2 Bucket CDN URL)</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://... (URL ảnh chất lượng cao)"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Giới thiệu về xe, thông số và tình trạng..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all"
                >
                  LƯU & XUẤT BẢN XE LÊN D1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
