import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, Store, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(name, email, phone, selectedRole);
      } else {
        await login(email, selectedRole, name);
      }
      onClose();
    } catch (err) {
      alert('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (role: Role) => {
    if (role === 'ADMIN') {
      setEmail('admin@autosmart.vn');
      setPassword('admin123');
      setSelectedRole('ADMIN');
      setName('Quản Trị Viên Auto Smart');
    } else if (role === 'SELLER') {
      setEmail('seller@autosmart.vn');
      setPassword('seller123');
      setSelectedRole('SELLER');
      setName('Nguyễn Văn Minh (Đại Lý)');
    } else {
      setEmail('khachhang@autosmart.vn');
      setPassword('khach123');
      setSelectedRole('CUSTOMER');
      setName('Trần Văn Hoàng');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-gray-950 border border-gray-800 shadow-2xl p-6 sm:p-8 my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-900 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Xác Thực Người Dùng (JWT & PBKDF2)</span>
          </div>
          <h3 className="text-2xl font-black text-white font-['Space_Grotesk']">
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập AUTO SMART'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister 
              ? 'Tạo tài khoản khách hàng hoặc đại lý bán xe' 
              : 'Đăng nhập để lưu xe yêu thích và đặt lịch lái thử'}
          </p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="mb-5 p-3 rounded-2xl bg-gray-900 border border-gray-800 text-xs">
          <p className="text-gray-400 mb-2 font-semibold">Tài khoản demo sẵn sàng:</p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('ADMIN')}
              className="p-1.5 rounded-lg bg-gray-950 border border-red-500/30 text-red-400 hover:bg-red-950/40 text-[11px] font-bold"
            >
              Admin Tổng
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('SELLER')}
              className="p-1.5 rounded-lg bg-gray-950 border border-amber-500/30 text-amber-400 hover:bg-amber-950/40 text-[11px] font-bold"
            >
              Seller Xe
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('CUSTOMER')}
              className="p-1.5 rounded-lg bg-gray-950 border border-blue-500/30 text-blue-400 hover:bg-blue-950/40 text-[11px] font-bold"
            >
              Khách Hàng
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Họ và tên</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                />
                <User className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@autosmart.vn"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Số điện thoại</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0988 xxx xxx"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                  <Phone className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Loại tài khoản đăng ký</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
                >
                  <option value="CUSTOMER">Khách hàng (Tìm mua xe)</option>
                  <option value="SELLER">Đại lý / Chuyên viên bán xe (Đăng tin)</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-gray-400 hover:text-red-400 text-xs transition-colors"
            >
              {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký miễn phí'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
