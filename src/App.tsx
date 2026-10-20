import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompareProvider } from './contexts/CompareContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { CarDetailModal } from './components/CarDetailModal';
import { TestDriveModal } from './components/TestDriveModal';
import { ComparisonModal } from './components/ComparisonModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { HomePage } from './pages/HomePage';
import { InventoryPage } from './pages/InventoryPage';
import { BookingsPage } from './pages/BookingsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutPage, ContactPage } from './pages/AboutContactPages';
import { Car, Brand, TestDriveBooking, FilterParams } from './types';
import { api } from './services/api';

const MainApp: React.FC = () => {
  const { user, isAdmin, isSeller } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bookings, setBookings] = useState<TestDriveBooking[]>([]);

  // Modals state
  const [selectedCarForDetail, setSelectedCarForDetail] = useState<Car | null>(null);
  const [selectedCarForTestDrive, setSelectedCarForTestDrive] = useState<Car | null>(null);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inventoryFilters, setInventoryFilters] = useState<FilterParams | undefined>(undefined);

  const loadData = async () => {
    const [carsData, brandsData, bookingsData] = await Promise.all([
      api.getCars(),
      api.getBrands(),
      api.getBookings(),
    ]);
    setCars(carsData);
    setBrands(brandsData);
    setBookings(bookingsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenTestDrive = (car: Car) => {
    setSelectedCarForTestDrive(car);
    setIsTestDriveModalOpen(true);
  };

  const handleNavigateWithFilter = (tab: string, filterOpts?: { brand?: string; priceRange?: string }) => {
    if (filterOpts) {
      const newFilter: FilterParams = {};
      if (filterOpts.brand && filterOpts.brand !== 'all') {
        newFilter.brand = filterOpts.brand;
      }
      if (filterOpts.priceRange) {
        if (filterOpts.priceRange === 'under500') newFilter.maxPrice = 500000000;
        else if (filterOpts.priceRange === '500to800') { newFilter.minPrice = 500000000; newFilter.maxPrice = 800000000; }
        else if (filterOpts.priceRange === '800to1200') { newFilter.minPrice = 800000000; newFilter.maxPrice = 1200000000; }
        else if (filterOpts.priceRange === 'above1200') newFilter.minPrice = 1200000000;
      }
      setInventoryFilters(newFilter);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-gray-100 selection:bg-red-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            cars={cars}
            brands={brands}
            onSelectDetail={(car) => setSelectedCarForDetail(car)}
            onBookTestDrive={handleOpenTestDrive}
            onNavigateTab={handleNavigateWithFilter}
            onOpenChat={() => {
              // Trigger chat widget by simulating click or setting state
              const chatBtn = document.querySelector('button[aria-label="Mở Trợ lý AI tư vấn ô tô"]') as HTMLButtonElement;
              if (chatBtn) chatBtn.click();
            }}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryPage
            cars={cars}
            brands={brands}
            onSelectDetail={(car) => setSelectedCarForDetail(car)}
            onBookTestDrive={handleOpenTestDrive}
            initialFilters={inventoryFilters}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingsPage
            bookings={bookings}
            onExploreCars={() => setCurrentTab('inventory')}
          />
        )}

        {currentTab === 'favorites' && (
          <FavoritesPage
            cars={cars}
            onSelectDetail={(car) => setSelectedCarForDetail(car)}
            onBookTestDrive={handleOpenTestDrive}
            onExploreCars={() => setCurrentTab('inventory')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            cars={cars}
            onCarUpdated={loadData}
            bookings={bookings}
            onBookingUpdated={loadData}
            brands={brands}
          />
        )}

        {currentTab === 'about' && <AboutPage />}

        {currentTab === 'contact' && <ContactPage />}
      </main>

      {/* Modals & Overlays */}
      <CarDetailModal
        car={selectedCarForDetail}
        onClose={() => setSelectedCarForDetail(null)}
        onBookTestDrive={handleOpenTestDrive}
      />

      <TestDriveModal
        car={selectedCarForTestDrive}
        cars={cars}
        isOpen={isTestDriveModalOpen}
        onClose={() => setIsTestDriveModalOpen(false)}
        onBookingSuccess={() => loadData()}
      />

      <ComparisonModal
        cars={cars}
        onBookTestDrive={handleOpenTestDrive}
        onSelectCar={(car) => setSelectedCarForDetail(car)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Floating AI RAG Chatbot (Not shown when inside Admin screen to keep view focused) */}
      {currentTab !== 'admin' && (
        <ChatWidget
          cars={cars}
          onSelectCar={(car) => setSelectedCarForDetail(car)}
          onBookTestDrive={handleOpenTestDrive}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={(tab) => {
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <FavoritesProvider>
          <MainApp />
        </FavoritesProvider>
      </CompareProvider>
    </AuthProvider>
  );
}
