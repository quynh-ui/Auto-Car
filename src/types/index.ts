export type Role = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export type FuelType = 'Xăng' | 'Dầu' | 'Điện' | 'Hybrid';
export type TransmissionType = 'Tự động' | 'Số sàn';
export type BodyType = 'Sedan' | 'SUV' | 'Hatchback' | 'MPV' | 'Pickup';
export type CarCondition = 'Mới 100%' | 'Đã qua sử dụng';
export type CarStatus = 'AVAILABLE' | 'SOLD' | 'HIDDEN';

export interface CarSpecs {
  engine?: string; // Động cơ (vd: 1.5L Dual VVT-i, Điện 300kW)
  horsepower?: string; // Công suất (vd: 106 hp, 402 hp)
  torque?: string; // Mô-men xoắn (vd: 140 Nm, 620 Nm)
  transmission?: string; // Hộp số (vd: Vô cấp CVT, 8 cấp)
  drivetrain?: string; // Dẫn động (vd: FWD, AWD, RWD)
  fuelConsumption?: string; // Tiêu thụ (vd: 5.8L/100km, 0L/100km)
  dimensions?: string; // Dài x Rộng x Cao (vd: 4,425 x 1,730 x 1,475 mm)
  wheelbase?: string; // Chiều dài cơ sở
  groundClearance?: string; // Khoảng sáng gầm xe
  airbags?: number; // Số túi khí
}

export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  price: number; // VND
  bodyType: BodyType;
  condition: CarCondition;
  mileage: number; // km (0 nếu mới)
  fuel: FuelType;
  transmission: TransmissionType;
  seats: number;
  color: string;
  origin: string; // 'Lắp ráp trong nước' | 'Nhập khẩu'
  description: string;
  features: string[];
  specs: CarSpecs;
  images: string[];
  location: string;
  status: CarStatus;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: string;
  isFeatured?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  logo: string;
  carCount?: number;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface TestDriveBooking {
  id: string;
  carId: string;
  carTitle: string;
  carImage: string;
  carPrice: number;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  preferredDate: string;
  preferredTime: string;
  branch: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedCars?: Car[];
  suggestions?: string[];
  intent?: string;
}

export interface FilterParams {
  query?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuel?: string;
  transmission?: string;
  seats?: number;
  condition?: string;
  sort?: 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc' | 'newest';
}
