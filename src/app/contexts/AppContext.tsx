import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  currency: 'AED' | 'USD' | 'INR' | 'KWD';
  setCurrency: (curr: 'AED' | 'USD' | 'INR' | 'KWD') => void;
  isRTL: boolean;
  convertPrice: (price: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const currencySymbols = {
  AED: 'د.إ',
  USD: '$',
  INR: '₹',
  KWD: 'د.ك'
};

const conversionRates = {
  AED: 1,
  USD: 0.27,
  INR: 22.5,
  KWD: 0.08
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');
  const [currency, setCurrencyState] = useState<'AED' | 'USD' | 'INR' | 'KWD'>('AED');
  const isRTL = language === 'ar';

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const setCurrency = (curr: 'AED' | 'USD' | 'INR' | 'KWD') => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  const convertPrice = (price: number): string => {
    const converted = (price * conversionRates[currency]).toFixed(2);
    return `${currencySymbols[currency]} ${converted}`;
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' | null;
    const savedCurr = localStorage.getItem('currency') as 'AED' | 'USD' | 'INR' | 'KWD' | null;
    
    if (savedLang) {
      setLanguage(savedLang);
    }
    if (savedCurr) {
      setCurrencyState(savedCurr);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        isRTL,
        convertPrice
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
