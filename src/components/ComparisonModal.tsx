import React from 'react';
import { 
  X, 
  Scale, 
  Trash2, 
  Calendar, 
  Fuel, 
  Gauge, 
  Users, 
  Sparkles, 
  Plus, 
  Check, 
  Minus 
} from 'lucide-react';
import { Car } from '../types';
import { useCompare } from '../contexts/CompareContext';
import { formatVNDCurrency } from '../services/ragBot';

interface ComparisonModalProps {
  cars: Car[];
  onBookTestDrive: (car: Car) => void;
  onSelectCar: (car: Car) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  cars,
  onBookTestDrive,
  onSelectCar,
}) => {
  const { compareList, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen, addToCompare } = useCompare();

  if (!isCompareOpen) return null;

  // Filter available cars not yet in comparison to show in quick-add
  const availableToAdd = cars.filter(c => !compareList.some(item => item.id === c.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl rounded-3xl bg-gray-950 border border-gray-800 shadow-2xl overflow-hidden my-auto p-5 sm:p-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk']">
                Bảng So Sánh Ô Tô Chi Tiết
              </h3>
              <p className="text-xs text-gray-400">
                So sánh tối đa 3 mẫu xe trực tiếp trên từng thông số kỹ thuật chuẩn D1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-gray-900 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-6">
          {compareList.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Scale className="w-16 h-16 text-gray-700 mx-auto stroke-[1.5]" />
              <h4 className="text-lg font-bold text-gray-300">Chưa có xe nào trong danh sách so sánh</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Hãy nhấn vào biểu tượng chiếc cân trên thẻ xe để đưa tối đa 3 mẫu xe vào bảng so sánh.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {cars.slice(0, 3).map((car) => (
                  <button
                    key={car.id}
                    onClick={() => addToCompare(car)}
                    className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-500/50 text-xs text-gray-200 transition-all"
                  >
                    + Thêm {car.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-gray-400 font-semibold w-40 sm:w-48 bg-gray-950 sticky left-0 z-10 border-b border-gray-800">
                      Tiêu chí so sánh
                    </th>
                    {compareList.map((car) => (
                      <th key={car.id} className="p-3 w-64 min-w-[220px] bg-gray-950 border-b border-gray-800 align-top">
                        <div className="relative rounded-2xl bg-gray-900 border border-gray-800 p-3 flex flex-col justify-between">
                          <button
                            onClick={() => removeFromCompare(car.id)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-gray-400 hover:text-red-400 hover:bg-black/90 transition-all"
                            title="Xóa xe khỏi so sánh"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div 
                            className="aspect-[16/10] rounded-xl overflow-hidden bg-black mb-2.5 cursor-pointer"
                            onClick={() => {
                              onSelectCar(car);
                              setIsCompareOpen(false);
                            }}
                          >
                            <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>

                          <h4 
                            onClick={() => {
                              onSelectCar(car);
                              setIsCompareOpen(false);
                            }}
                            className="font-bold text-sm text-white line-clamp-1 hover:text-red-400 cursor-pointer"
                          >
                            {car.title}
                          </h4>

                          <p className="text-base font-black text-red-500 my-1 font-['Space_Grotesk']">
                            {formatVNDCurrency(car.price)}
                          </p>

                          <button
                            onClick={() => {
                              onBookTestDrive(car);
                              setIsCompareOpen(false);
                            }}
                            className="mt-2 w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Lái thử
                          </button>
                        </div>
                      </th>
                    ))}

                    {/* Slot for adding up to 3 */}
                    {compareList.length < 3 && (
                      <th className="p-3 w-64 min-w-[220px] bg-gray-950 border-b border-gray-800 align-middle text-center">
                        <div className="rounded-2xl border-2 border-dashed border-gray-800 hover:border-gray-700 p-6 flex flex-col items-center justify-center space-y-2 h-[260px]">
                          <Plus className="w-8 h-8 text-gray-600" />
                          <span className="text-gray-400 font-semibold text-xs">Thêm xe so sánh</span>
                          <span className="text-[11px] text-gray-600">(Còn {3 - compareList.length} vị trí)</span>

                          <select
                            onChange={(e) => {
                              const found = cars.find(c => c.id === e.target.value);
                              if (found) addToCompare(found);
                            }}
                            defaultValue=""
                            className="mt-2 text-xs bg-gray-900 border border-gray-800 rounded-lg p-2 text-gray-200 w-full"
                          >
                            <option value="" disabled>-- Chọn xe thêm --</option>
                            {availableToAdd.map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800/80">
                  {/* Brand & Model */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Hãng & Phiên bản</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200">
                        {c.brand} ({c.version})
                      </td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Body Type */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Kiểu dáng</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200">{c.bodyType}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Condition & Year */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Năm sản xuất & Tình trạng</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200">
                        Đời {c.year} • <span className={c.condition === 'Mới 100%' ? 'text-red-400' : 'text-gray-300'}>{c.condition}</span>
                      </td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Fuel */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Loại nhiên liệu</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200 font-medium">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          c.fuel === 'Điện' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                          c.fuel === 'Hybrid' ? 'bg-teal-950 text-teal-400 border border-teal-500/30' :
                          c.fuel === 'Dầu' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {c.fuel}
                        </span>
                      </td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Seats */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Số chỗ ngồi</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200 font-bold">{c.seats} chỗ ngồi</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Engine */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Động cơ</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200">{c.specs.engine || '-'}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Horsepower */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Công suất cực đại</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-white font-bold">{c.specs.horsepower || '-'}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Torque */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Mô-men xoắn</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200">{c.specs.torque || '-'}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Transmission */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Hộp số</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200">{c.transmission}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Fuel Consumption */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Mức tiêu hao nhiên liệu</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-emerald-400 font-semibold">{c.specs.fuelConsumption || '-'}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Dimensions */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Kích thước (D x R x C)</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-300 font-mono text-[11px]">{c.specs.dimensions || '-'}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>

                  {/* Airbags */}
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 bg-gray-950 sticky left-0 z-10">Túi khí an toàn</td>
                    {compareList.map(c => (
                      <td key={c.id} className="p-3 text-gray-200">{c.specs.airbags ? `${c.specs.airbags} túi khí` : '-'}</td>
                    ))}
                    {compareList.length < 3 && <td className="p-3"></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
