import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

import "./i18n";


// Sample data helper is kept for manual testing only
import { initializeSampleData } from './utils/sampleData';
import { SettingsProvider } from './context/SettingsContext';
import { CurrencyProvider } from './context/CurrencyContext';

// ensure storage keys exist; we no longer auto-populate with dummy items
if (!localStorage.getItem('rasi_cart')) {
  localStorage.setItem('rasi_cart', JSON.stringify([]));
}
if (!localStorage.getItem('rasi_orders')) {
  localStorage.setItem('rasi_orders', JSON.stringify([]));
}
if (!localStorage.getItem('rasi_wishlist')) {
  localStorage.setItem('rasi_wishlist', JSON.stringify([]));
}

// developers can call `initializeSampleData()` from the console if they
// want to seed test values; it is not invoked automatically anymore.

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then((success) => {
        if (success) {

        }
      });
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <SettingsProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </SettingsProvider>
    </HelmetProvider>
  </StrictMode>,
);
