import React, { useState } from 'react';
import { 
  CarFront, 
  Scale, 
  Heart, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Store, 
  LogOut, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCompare } from '../contexts/CompareContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Role } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { user, logout, switchRole, isAdmin, isSeller } = useAuth();
  const { compareList, setIsCompareOpen } = useCompare();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'inventory', label: 'Danh sách xe' },
    { id: 'compare', label: 'So sánh xe', badge: compareList.length },
    { id: 'about', label: 'Giới thiệu' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'compare') {
      setIsCompareOpen(true);
    } else {
      setCurrentTab(id);
    }
    setMobileMenuOpen(false);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin Tổng', bg: 'bg-red-500/20 text-red-400 border-red-500/40', icon: ShieldCheck };
      case 'SELLER':
        return { label: 'Đại Lý / Seller', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: Store };
      case 'CUSTOMER':
      default:
        return { label: 'Khách Hàng', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: User };
    }
  };

  const currentBadge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-gray-950/85 border-b border-gray-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo AUTO SMART */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
              <CarFront className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-wider text-white font-['Space_Grotesk']">AUTO</span>
                <span className="text-2xl font-extrabold tracking-wider text-red-500 font-['Space_Grotesk']">SMART</span>
              </div>
              <p className="text-[10px] tracking-widest uppercase text-gray-400 font-medium">Showroom Ô Tô & AI RAG</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id && link.id !== 'compare';
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive 
                      ? 'text-white bg-gray-800/70 shadow-sm' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-900/60'
                  }`}
                >
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-red-500 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Admin or Seller Direct Link */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  currentTab === 'admin'
                    ? 'text-red-400 bg-red-950/40 border border-red-500/40'
                    : 'text-gray-300 hover:text-red-400 hover:bg-gray-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-red-500" />
                Quản Trị
              </button>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            
            {/* Quick Role Switcher for seamless testing */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
                  currentBadge?.bg || 'bg-gray-800 text-gray-300 border-gray-700'
                }`}
                title="Chuyển vai trò để kiểm thử phân quyền"
              >
                {currentBadge && <currentBadge.icon className="w-3.5 h-3.5" />}
                <span>{currentBadge?.label || 'Chọn vai trò'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Chuyển nhanh vai trò (Demo)
                  </div>
                  <button
                    onClick={() => { switchRole('ADMIN'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-gray-200 hover:bg-gray-800 hover:text-red-400 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-red-500" /> Admin Tổng
                    </span>
                    {user?.role === 'ADMIN' && <span className="text-[10px] text-red-400">Đang chọn</span>}
                  </button>
                  <button
                    onClick={() => { switchRole('SELLER'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-gray-200 hover:bg-gray-800 hover:text-amber-400 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-500" /> Seller / Đại Lý
                    </span>
                    {user?.role === 'SELLER' && <span className="text-[10px] text-amber-400">Đang chọn</span>}
                  </button>
                  <button
                    onClick={() => { switchRole('CUSTOMER'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-gray-200 hover:bg-gray-800 hover:text-blue-400 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" /> Khách Hàng
                    </span>
                    {user?.role === 'CUSTOMER' && <span className="text-[10px] text-blue-400">Đang chọn</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Compare Button */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="relative p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 hover:bg-gray-800 transition-all"
              title="So sánh xe"
            >
              <Scale className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-gray-950">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Favorites Button */}
            <button
              onClick={() => handleNavClick('favorites')}
              className="relative p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-red-400 hover:border-gray-700 hover:bg-gray-800 transition-all"
              title="Xe đã lưu yêu thích"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-gray-950">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-gray-700"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-gray-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl p-2 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="p-3 border-b border-gray-800">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-800 text-red-400 border border-gray-700">
                        Vai trò: {user.role}
                      </div>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <button
                          onClick={() => { setCurrentTab('admin'); setUserMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-800 hover:text-red-400 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-500" /> Bảng điều khiển Quản Trị
                        </button>
                      )}
                      {isSeller && (
                        <button
                          onClick={() => { setCurrentTab('admin'); setUserMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-800 hover:text-amber-400 flex items-center gap-2"
                        >
                          <Store className="w-4 h-4 text-amber-500" /> Quản lý xe đăng bán
                        </button>
                      )}
                      <button
                        onClick={() => { setCurrentTab('bookings'); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4 text-blue-400" /> Lịch lái thử của tôi
                      </button>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/40 flex items-center gap-2 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800 bg-gray-950 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-200 hover:bg-gray-900 flex items-center justify-between"
            >
              <span>{link.label}</span>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-red-400 bg-red-950/20 border border-red-500/20 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Trang Quản Trị Hệ Thống
            </button>
          )}

          <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider px-2">Chuyển vai trò test:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { switchRole('ADMIN'); setMobileMenuOpen(false); }}
                className="p-2 text-xs rounded-lg bg-gray-900 text-red-400 border border-gray-800 font-medium"
              >
                Admin
              </button>
              <button
                onClick={() => { switchRole('SELLER'); setMobileMenuOpen(false); }}
                className="p-2 text-xs rounded-lg bg-gray-900 text-amber-400 border border-gray-800 font-medium"
              >
                Seller
              </button>
              <button
                onClick={() => { switchRole('CUSTOMER'); setMobileMenuOpen(false); }}
                className="p-2 text-xs rounded-lg bg-gray-900 text-blue-400 border border-gray-800 font-medium"
              >
                Khách
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
