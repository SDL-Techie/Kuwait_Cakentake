import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setCurrencyHeader } from '../services/api';

type CurrencyContextValue = {
  currency: string;
  setCurrency: (currency: string) => void;
};

const getInitialCurrency = () => {
  if (typeof window === 'undefined') return 'KWD';
  const storedCurrency = localStorage.getItem('currency');
  return storedCurrency ? storedCurrency.toUpperCase() : 'KWD';
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: getInitialCurrency(),
  setCurrency: () => undefined,
});

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState(getInitialCurrency);

  const setCurrency = useCallback((nextCurrency: string) => {
    const normalizedCurrency = (nextCurrency || 'KWD').toUpperCase();
    setCurrencyState(normalizedCurrency);
    // Persist the selected currency so it remains after a page reload or in other tabs
    try {
      localStorage.setItem('currency', normalizedCurrency);
    } catch (err) {
      console.warn('Unable to persist currency to localStorage:', err);
    }
    setCurrencyHeader(normalizedCurrency);
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: normalizedCurrency }));
  }, []);

  useEffect(() => {
    const storedCurrency = localStorage.getItem('currency');
    if (storedCurrency) {
      const normalizedCurrency = storedCurrency.toUpperCase();
      setCurrencyState(normalizedCurrency);
      setCurrencyHeader(normalizedCurrency);
    } else {
      setCurrency('KWD');
    }
  }, [setCurrency]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'currency' && event.newValue) {
        setCurrency(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [setCurrency]);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => useContext(CurrencyContext);
