/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  subCategories: string[]; // List of names
}

export interface ProductVariant {
  id: string;
  name: string;
  priceDelta: number; // e.g., +2.00
}

export interface ProductAddOn {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  variants: ProductVariant[];
  addOns: ProductAddOn[];
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  products: { productId: string; quantity: number }[];
  isAvailable: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  image?: string;
  isActive: boolean;
  validUntil: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'assigned'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  selectedAddOns: string[]; // names
  addOnPriceTotal: number;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cash' | 'card' | 'loyalty';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  timeline: OrderTimeline[];
  notes?: string;
  staffId?: string; // assigned kitchen staff / order manager
  driverId?: string; // assigned driver
  agentId?: string; // agent credit if created by sales agent
  commissionPaid?: number;
  loyaltyPointsEarned?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: string[];
  loyaltyPoints: number;
  createdAt: string;
}

export type StaffRole =
  | 'Owner'
  | 'Shop Manager'
  | 'Sales Agent'
  | 'Kitchen Staff'
  | 'Delivery Agent'
  | 'Driver';

export type StaffAvailability = 'Online' | 'Offline' | 'On Leave';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  availability: StaffAvailability;
  checkedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  currentStock: number; // in kg, units, etc.
  reorderLevel: number;
  unit: string; // e.g., kg, liters, boxes
}

export interface StockMovement {
  id: string;
  materialId: string;
  type: 'In' | 'Out';
  quantity: number;
  reason: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  materialId: string;
  materialName: string;
  quantity: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface CashDrawerLog {
  id: string;
  type: 'Opening' | 'Closing' | 'Deposit' | 'Withdrawal';
  amount: number;
  timestamp: string;
  staffName: string;
  notes?: string;
}

export interface DeliveryArea {
  id: string;
  name: string;
  charge: number;
  minOrderValue: number;
}

export interface LoyaltySettings {
  pointsPerDollar: number;
  pointsValueInDollars: number; // e.g., 100 points = $1.00
  minRedemptionPoints: number;
}

export interface AppState {
  categories: Category[];
  products: Product[];
  combos: Combo[];
  promotions: Promotion[];
  promoCodes: PromoCode[];
  orders: Order[];
  customers: Customer[];
  staff: Staff[];
  rawMaterials: RawMaterial[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  purchases: Purchase[];
  expenses: Expense[];
  cashDrawer: CashDrawerLog[];
  deliveryAreas: DeliveryArea[];
  loyaltySettings: LoyaltySettings;
}
