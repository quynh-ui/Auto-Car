import React, { createContext, useContext, useState, useEffect } from 'react';
import { Car } from '../types';

interface CompareContextType {
  compareList: Car[];
  addToCompare: (car: Car) => boolean;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  isInCompare: (carId: string) => boolean;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'autosmart_compare_v1';

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Car[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (car: Car): boolean => {
    if (compareList.some(c => c.id === car.id)) {
      // Đã có, gỡ ra
      removeFromCompare(car.id);
      return false;
    }

    if (compareList.length >= 3) {
      alert('Bạn chỉ có thể so sánh tối đa 3 xe cùng một lúc. Vui lòng bỏ bớt 1 xe trước.');
      return false;
    }

    setCompareList(prev => [...prev, car]);
    return true;
  };

  const removeFromCompare = (carId: string) => {
    setCompareList(prev => prev.filter(c => c.id !== carId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (carId: string) => {
    return compareList.some(c => c.id === carId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
};
