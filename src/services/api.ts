import { Car, Brand, TestDriveBooking, User, FilterParams } from '../types';
import { INITIAL_CARS, INITIAL_BRANDS, INITIAL_BOOKINGS } from '../data/mockCars';

const CARS_STORAGE_KEY = 'autosmart_cars_v1';
const BOOKINGS_STORAGE_KEY = 'autosmart_bookings_v1';
const FAVORITES_STORAGE_KEY = 'autosmart_favorites_v1';
const USER_STORAGE_KEY = 'autosmart_user_v1';

// Initial storage bootstrap
function getStoredCars(): Car[] {
  try {
    const raw = localStorage.getItem(CARS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(INITIAL_CARS));
  return INITIAL_CARS;
}

function saveCars(cars: Car[]) {
  localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(cars));
}

function getStoredBookings(): TestDriveBooking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
}

function saveBookings(bookings: TestDriveBooking[]) {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

export const api = {
  // Cars
  async getCars(params?: FilterParams): Promise<Car[]> {
    let list = getStoredCars();

    if (params) {
      if (params.query) {
        const q = params.query.toLowerCase().trim();
        list = list.filter(
          c =>
            c.title.toLowerCase().includes(q) ||
            c.brand.toLowerCase().includes(q) ||
            c.model.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q)
        );
      }
      if (params.brand && params.brand !== 'all') {
        list = list.filter(c => c.brand.toLowerCase() === params.brand!.toLowerCase());
      }
      if (params.minPrice !== undefined) {
        list = list.filter(c => c.price >= params.minPrice!);
      }
      if (params.maxPrice !== undefined) {
        list = list.filter(c => c.price <= params.maxPrice!);
      }
      if (params.bodyType && params.bodyType !== 'all') {
        list = list.filter(c => c.bodyType.toLowerCase() === params.bodyType!.toLowerCase());
      }
      if (params.fuel && params.fuel !== 'all') {
        list = list.filter(c => c.fuel.toLowerCase() === params.fuel!.toLowerCase());
      }
      if (params.transmission && params.transmission !== 'all') {
        list = list.filter(c => c.transmission.toLowerCase() === params.transmission!.toLowerCase());
      }
      if (params.seats && params.seats > 0) {
        list = list.filter(c => c.seats === params.seats);
      }
      if (params.condition && params.condition !== 'all') {
        list = list.filter(c => c.condition.toLowerCase() === params.condition!.toLowerCase());
      }

      // Sort
      if (params.sort) {
        switch (params.sort) {
          case 'price_asc':
            list.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            list.sort((a, b) => b.price - a.price);
            break;
          case 'year_desc':
            list.sort((a, b) => b.year - a.year);
            break;
          case 'mileage_asc':
            list.sort((a, b) => a.mileage - b.mileage);
            break;
          case 'newest':
          default:
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }
    }

    return list;
  },

  async getCarById(id: string): Promise<Car | undefined> {
    const list = getStoredCars();
    return list.find(c => c.id === id);
  },

  async createCar(carData: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
    const list = getStoredCars();
    const newCar: Car = {
      ...carData,
      id: `car-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newCar);
    saveCars(list);
    return newCar;
  },

  async updateCar(id: string, updates: Partial<Car>): Promise<Car> {
    const list = getStoredCars();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Không tìm thấy xe');
    list[idx] = { ...list[idx], ...updates };
    saveCars(list);
    return list[idx];
  },

  async deleteCar(id: string): Promise<boolean> {
    let list = getStoredCars();
    list = list.filter(c => c.id !== id);
    saveCars(list);
    return true;
  },

  // Brands
  async getBrands(): Promise<Brand[]> {
    const cars = getStoredCars();
    return INITIAL_BRANDS.map(b => ({
      ...b,
      carCount: cars.filter(c => c.brand.toLowerCase() === b.name.toLowerCase() && c.status === 'AVAILABLE').length,
    }));
  },

  // Bookings
  async getBookings(): Promise<TestDriveBooking[]> {
    return getStoredBookings();
  },

  async createBooking(data: Omit<TestDriveBooking, 'id' | 'status' | 'createdAt'>): Promise<TestDriveBooking> {
    const bookings = getStoredBookings();
    const newBooking: TestDriveBooking = {
      ...data,
      id: `book-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    bookings.unshift(newBooking);
    saveBookings(bookings);
    return newBooking;
  },

  async updateBookingStatus(id: string, status: TestDriveBooking['status']): Promise<TestDriveBooking> {
    const bookings = getStoredBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Không tìm thấy lịch hẹn');
    bookings[idx].status = status;
    saveBookings(bookings);
    return bookings[idx];
  },

  // Favorites
  getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(carId: string): string[] {
    const favs = this.getFavorites();
    const exists = favs.includes(carId);
    const updated = exists ? favs.filter(id => id !== carId) : [...favs, carId];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Current session user helper
  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveStoredUser(user: User | null) {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  resetDemoData() {
    localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(INITIAL_CARS));
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
  }
};
