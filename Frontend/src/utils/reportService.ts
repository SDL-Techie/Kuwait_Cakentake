// Define Order interface locally since orderService doesn't exist
export interface Order {
  id: string;
  createdAt: Date | any; // Firestore timestamp or Date
  total: number;
  status: string;
}

export interface ReportData {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface DashboardReport {
  period: 'weekly' | 'monthly' | 'annual';
  data: ReportData[];
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

// Helper to normalize createdAt (Date or Firestore Timestamp)
export const getOrderDate = (o: Order): Date => {
  if (!o.createdAt) return new Date();
  if ((o.createdAt as any).toDate) {
    return (o.createdAt as any).toDate();
  }
  if (o.createdAt instanceof Date) {
    return o.createdAt;
  }
  return new Date();
};

// Generate weekly report (last 7 days with daily breakdown)
export const generateWeeklyReport = (orders: Order[]): DashboardReport => {
  const data: { [key: string]: ReportData } = {};
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = dayNames[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    data[dateStr] = {
      label: dayName,
      revenue: 0,
      orderCount: 0,
    };
  }

  // Aggregate orders
  orders.forEach(o => {
    const date = getOrderDate(o);
    const dateStr = date.toISOString().split('T')[0];
    if (data[dateStr]) {
      data[dateStr].revenue += o.total || 0;
      data[dateStr].orderCount += 1;
    }
  });

  const chartData = Object.values(data);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orderCount, 0);

  return {
    period: 'weekly',
    data: chartData,
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
};

// Generate monthly report (last 12 months with monthly breakdown)
export const generateMonthlyReport = (orders: Order[]): DashboardReport => {
  const data: { [key: string]: ReportData } = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = monthNames[d.getMonth()];
    const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
    data[monthKey] = {
      label: monthName,
      revenue: 0,
      orderCount: 0,
    };
  }

  // Aggregate orders
  orders.forEach(o => {
    const date = getOrderDate(o);
    const monthKey = date.toISOString().slice(0, 7);
    if (data[monthKey]) {
      data[monthKey].revenue += o.total || 0;
      data[monthKey].orderCount += 1;
    }
  });

  const chartData = Object.values(data);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orderCount, 0);

  return {
    period: 'monthly',
    data: chartData,
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
};

// Generate annual report (last 5 years with yearly breakdown)
export const generateAnnualReport = (orders: Order[]): DashboardReport => {
  const data: { [key: number]: ReportData } = {};
  const currentYear = new Date().getFullYear();

  // Initialize last 5 years
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i;
    data[year] = {
      label: year.toString(),
      revenue: 0,
      orderCount: 0,
    };
  }

  // Aggregate orders
  orders.forEach(o => {
    const date = getOrderDate(o);
    const year = date.getFullYear();
    if (data[year]) {
      data[year].revenue += o.total || 0;
      data[year].orderCount += 1;
    }
  });

  const chartData = Object.values(data);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orderCount, 0);

  return {
    period: 'annual',
    data: chartData,
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
};
