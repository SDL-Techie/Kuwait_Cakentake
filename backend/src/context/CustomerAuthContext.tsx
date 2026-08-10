import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ✅ Updated Customer interface
interface Customer {
  id: string;
  name: string;
  mobile: string;
  role?: string; 
  email?: string;
  address?: string;
  landmark?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  login: (customerData: Customer, token: string) => void;
  logout: () => void;
  updateCustomer: (updates: Partial<Customer>) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ✅ FIX: Initialize state SYNCHRONOUSLY from localStorage
  // This prevents the "flash" of logged-out state on refresh
  const [customer, setCustomer] = useState<Customer | null>(() => {
    const id = localStorage.getItem('customerId');
    const name = localStorage.getItem('customerName');
    const mobile = localStorage.getItem('customerMobile');
    const role = localStorage.getItem('customerRole');

    if (id && name && mobile) {
      return { id, name, mobile, role: role || 'customer', address: '', landmark: '' };
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isCustomerLoggedIn') === 'true';
  });

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Since we are no longer using Firebase, we just confirm initialization is done
    setAuthLoading(false);
  }, []);

  // ✅ LOGIN (Used with your Node.js backend)
  const login = (customerData: Customer, token: string) => {
    setCustomer(customerData);
    setIsLoggedIn(true);

    localStorage.setItem('token', token); // Store your JWT token from Node
    localStorage.setItem('customerId', customerData.id);
    localStorage.setItem('customerName', customerData.name);
    localStorage.setItem('customerMobile', customerData.mobile);
    localStorage.setItem('customerRole', customerData.role || 'customer');
    localStorage.setItem('isCustomerLoggedIn', 'true');
  };

  // ✅ LOGOUT
  // const logout = () => {
  //   setCustomer(null);
  //   setIsLoggedIn(false);
  //   localStorage.clear(); 
  // };

  // ✅ FIXED LOGOUT
const logout = () => {
  setCustomer(null);
  setIsLoggedIn(false);
  
  // ✅ Only clear auth-related data, not everything
  localStorage.removeItem('token');
  localStorage.removeItem('customerId');
  localStorage.removeItem('customerName');
  localStorage.removeItem('customerMobile');
  localStorage.removeItem('customerRole');
  localStorage.removeItem('isCustomerLoggedIn');
  localStorage.removeItem('userPhone'); // From your navbar
};

  // ✅ UPDATE CUSTOMER
  const updateCustomer = (updates: Partial<Customer>) => {
    setCustomer((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      
      // Sync localStorage so refresh keeps the new data
      if (updates.name) localStorage.setItem('customerName', updates.name);
      if (updates.mobile) localStorage.setItem('customerMobile', updates.mobile);
      if (updates.role) localStorage.setItem('customerRole', updates.role);
      
      return updated;
    });
  };

  const value = {
    customer,
    isLoggedIn,
    authLoading,
    login,
    logout,
    updateCustomer
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {!authLoading && children}
    </CustomerAuthContext.Provider>
  );
};