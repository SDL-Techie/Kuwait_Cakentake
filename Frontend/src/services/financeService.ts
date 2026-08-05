// import { api } from "./api";

// export interface Expense {
//   id: number;
//   category: string;
//   description?: string;
//   amount: number;
//   expense_date: string;
//   paid_by: number;
// }

// export interface CreateExpensePayload {
//   category: string;
//   description?: string;
//   amount: number;
// }

// // ─── Expenses ─────────────────────────────────────────────────────────────────

// /** GET /expenses  (ADMIN | SHOP_MANAGER) */
// export const getExpenses = async (): Promise<Expense[]> => {
//   const res = await api.get("/expenses");
//   return res.data.expenses;
// };

// /** POST /expenses  (ADMIN | SHOP_MANAGER) */
// export const createExpense = async (payload: CreateExpensePayload): Promise<Expense> => {
//   const res = await api.post("/expenses", payload);
//   return res.data.expense;
// };

// /** GET /expenses/:expense_id  (ADMIN | SHOP_MANAGER) */
// export const getExpense = async (expenseId: number): Promise<Expense> => {
//   const res = await api.get(`/expenses/${expenseId}`);
//   return res.data.expense;
// };

// /** PUT /expenses/:expense_id  (ADMIN | SHOP_MANAGER) */
// export const updateExpense = async (
//   expenseId: number,
//   payload: Partial<CreateExpensePayload>
// ): Promise<Expense> => {
//   const res = await api.put(`/expenses/${expenseId}`, payload);
//   return res.data.expense;
// };

// /** DELETE /expenses/:expense_id  (ADMIN) */
// export const deleteExpense = async (expenseId: number): Promise<void> => {
//   await api.delete(`/expenses/${expenseId}`);
// };

// /** GET /expenses/report  (ADMIN | SHOP_MANAGER) */
// export const getExpenseReport = async (): Promise<any> => {
//   const res = await api.get("/expenses/report");
//   return res.data;
// };

// /** GET /expenses/dashboard  (ADMIN | SHOP_MANAGER) */
// export const getExpensesDashboard = async (): Promise<any> => {
//   const res = await api.get("/expenses/dashboard");
//   return res.data;
// };

// // ─── Cash Drawer ──────────────────────────────────────────────────────────────

// /** GET /cash-drawer  (ADMIN | SHOP_MANAGER) */
// export const getCashDrawer = async (): Promise<{ balance: number }> => {
//   const res = await api.get("/cash-drawer");
//   return res.data;
// };

// /** POST /cash-drawer/add-cash  (ADMIN | SHOP_MANAGER) */
// export const addCash = async (amount: number, notes?: string): Promise<any> => {
//   const res = await api.post("/cash-drawer/add-cash", { amount, notes });
//   return res.data;
// };

// /** POST /cash-drawer/deposit  (ADMIN | SHOP_MANAGER) */
// export const cashDeposit = async (amount: number, notes?: string): Promise<any> => {
//   const res = await api.post("/cash-drawer/deposit", { amount, notes });
//   return res.data;
// };

// /** POST /cash-drawer/withdraw  (ADMIN | SHOP_MANAGER) */
// export const cashWithdraw = async (amount: number, notes?: string): Promise<any> => {
//   const res = await api.post("/cash-drawer/withdraw", { amount, notes });
//   return res.data;
// };

// /** GET /cash-drawer/statement  (ADMIN | SHOP_MANAGER) */
// export const getCashStatement = async (): Promise<any[]> => {
//   const res = await api.get("/cash-drawer/statement");
//   return res.data.transactions;
// };

// /** GET /cash-drawer/transactions  (ADMIN | SHOP_MANAGER) */
// export const getCashTransactions = async (): Promise<any[]> => {
//   const res = await api.get("/cash-drawer/transactions");
//   return res.data.transactions;
// };

// /** GET /cash-drawer/audit  (ADMIN) */
// export const getCashAudit = async (): Promise<any[]> => {
//   const res = await api.get("/cash-drawer/audit");
//   return res.data.audit;
// };

// /** GET /cash-drawer/daily-summary  (ADMIN | SHOP_MANAGER) */
// export const getCashDailySummary = async (): Promise<any> => {
//   const res = await api.get("/cash-drawer/daily-summary");
//   return res.data;
// };

// /** GET /cash-drawer/dashboard  (ADMIN | SHOP_MANAGER) */
// export const getCashDrawerDashboard = async (): Promise<any> => {
//   const res = await api.get("/cash-drawer/dashboard");
//   return res.data;
// };

// // ─── Bank ─────────────────────────────────────────────────────────────────────

// /** GET /bank/balance  (ADMIN | SHOP_MANAGER) */
// export const getBankBalance = async (): Promise<{ balance: number }> => {
//   const res = await api.get("/bank/balance");
//   return res.data;
// };

// /** GET /bank/statement  (ADMIN | SHOP_MANAGER) */
// export const getBankStatement = async (): Promise<any[]> => {
//   const res = await api.get("/bank/statement");
//   return res.data.transactions;
// };

// /** POST /bank/deposit  (ADMIN | SHOP_MANAGER) */
// export const bankDeposit = async (
//   amount: number,
//   reference?: string,
//   notes?: string
// ): Promise<any> => {
//   const res = await api.post("/bank/deposit", { amount, reference, notes });
//   return res.data;
// };

// /** POST /bank/withdraw  (ADMIN | SHOP_MANAGER) */
// export const bankWithdraw = async (
//   amount: number,
//   reference?: string,
//   notes?: string
// ): Promise<any> => {
//   const res = await api.post("/bank/withdraw", { amount, reference, notes });
//   return res.data;
// };

// /** GET /bank/transfers  (ADMIN | SHOP_MANAGER) */
// export const getBankTransfers = async (): Promise<any[]> => {
//   const res = await api.get("/bank/transfers");
//   return res.data.transfers;
// };

// /** GET /bank/reconciliation  (ADMIN) */
// export const getBankReconciliation = async (): Promise<any[]> => {
//   const res = await api.get("/bank/reconciliation");
//   return res.data.unreconciled;
// };

// /** POST /bank/reconciliation/verify  (ADMIN) */
// export const verifyReconciliation = async (transactionIds: number[]): Promise<any> => {
//   const res = await api.post("/bank/reconciliation/verify", { transaction_ids: transactionIds });
//   return res.data;
// };

// /** GET /bank/dashboard  (ADMIN | SHOP_MANAGER) */
// export const getBankDashboard = async (): Promise<any> => {
//   const res = await api.get("/bank/dashboard");
//   return res.data;
// };




import { api } from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedMeta {
  total?: number;
  page?: number;
  per_page?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSES
// ─────────────────────────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  category: string;
  description?: string;
  amount: number;
  payment_source: "CASH" | "BANK";
  reference?: string;
  paid_by: number;
  expense_date: string;
  created_at?: string;
}

export interface CreateExpensePayload {
  category: string;
  description?: string;
  amount: number;
  payment_source: "CASH" | "BANK";
  reference?: string;
}

export interface UpdateExpensePayload {
  category?: string;
  description?: string;
  amount?: number;
  payment_source?: "CASH" | "BANK";
  reference?: string;
}

export interface ExpenseReport {
  total: number;
  by_category: { category: string; total: number }[];
}

export interface ExpenseDashboard {
  total_amount: number;
  total_count: number;
  today_total: number;
  month_total: number;
  by_category: { category: string; count: number; total: number }[];
  chart: { date: string; total: number }[];
  recent_expenses: Expense[];
}

// export interface FinanceOrder {
//   id: number;
//   order_number: string;
//   customer_name: string;
//   payment_method: string;
//   payment_status: string;
//   status: string;
//   total_amount: number;
//   delivery_fee: number;
//   created_at: string;
// }


export interface FinanceOrder {
  order_id: number;
  customer: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
}


export const getFinanceOrders = async (): Promise<FinanceOrder[]> => {
  const res = await api.get("/finance/orders");
  return res.data;
};


export interface FinanceDriverSettlement {
  driver_id: number;
  driver_name: string;
  order_id: number;
  order_number: string;
  delivered_at: string;
  delivery_fee: number;
}

export const getFinanceDriverSettlements = async (): Promise<FinanceDriverSettlement[]> => {
  const res = await api.get("/finance/driver-settlements");
  return res.data.settlements;
};



/** GET /expenses  (ADMIN | SHOP_MANAGER) */
export const getExpenses = async (): Promise<Expense[]> => {
  const res = await api.get("/expenses");
  return res.data.expenses;
};

/** POST /expenses  (ADMIN | SHOP_MANAGER) */
export const createExpense = async (
  payload: CreateExpensePayload
): Promise<Expense> => {
  const res = await api.post("/expenses", payload);
  return res.data.expense;
};

/** GET /expenses/:expense_id  (ADMIN | SHOP_MANAGER) */
export const getExpense = async (expenseId: number): Promise<Expense> => {
  const res = await api.get(`/expenses/${expenseId}`);
  return res.data.expense;
};

/** PUT /expenses/:expense_id  (ADMIN | SHOP_MANAGER) */
export const updateExpense = async (
  expenseId: number,
  payload: UpdateExpensePayload
): Promise<Expense> => {
  const res = await api.put(`/expenses/${expenseId}`, payload);
  return res.data.expense;
};

/** DELETE /expenses/:expense_id  (ADMIN) */
export const deleteExpense = async (expenseId: number): Promise<void> => {
  await api.delete(`/expenses/${expenseId}`);
};

/** GET /expenses/report  (ADMIN | SHOP_MANAGER) */
export const getExpenseReport = async (): Promise<ExpenseReport> => {
  const res = await api.get("/expenses/report");
  return res.data;
};

/** GET /expenses/dashboard  (ADMIN | SHOP_MANAGER) */
export const getExpenseDashboard = async (): Promise<ExpenseDashboard> => {
  const res = await api.get("/expenses/dashboard");
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CASH DRAWER
// ─────────────────────────────────────────────────────────────────────────────

export interface CashDrawerTransaction {
  id: number;
  transaction_type: "ADD" | "DEPOSIT" | "WITHDRAW";
  amount: number;
  balance_after: number;
  notes?: string;
  reference?: string;
  performed_by?: number;
  created_at: string;
}

export interface CashDrawerBalance {
  balance: number;
}

export interface CashDrawerDailySummary {
  date: string;
  total_in: number;
  total_out: number;
  net: number;
  closing_balance: number;
}

export interface CashDrawerDashboard {
  current_balance: number;
  today: { in: number; out: number; net: number };
  this_week: { in: number; out: number; net: number };
  total_transactions: number;
  chart: { date: string; in: number; out: number }[];
  recent_transactions: CashDrawerTransaction[];
}

export interface CashDrawerTransactionPayload {
  amount: number;
  notes?: string;
}

/** GET /cash-drawer  (ADMIN | SHOP_MANAGER) */
export const getCashDrawerBalance = async (): Promise<number> => {
  const res = await api.get("/cash-drawer");
  return res.data.balance;
};

/** POST /cash-drawer/add-cash  (ADMIN | SHOP_MANAGER) */
export const addCash = async (
  payload: CashDrawerTransactionPayload
): Promise<any> => {
  const res = await api.post("/cash-drawer/add-cash", payload);
  return res.data;
};

/** POST /cash-drawer/deposit  (ADMIN | SHOP_MANAGER) */
export const cashDeposit = async (
  payload: CashDrawerTransactionPayload
): Promise<any> => {
  const res = await api.post("/cash-drawer/deposit", payload);
  return res.data;
};

/** POST /cash-drawer/withdraw  (ADMIN | SHOP_MANAGER) */
export const cashWithdraw = async (
  payload: CashDrawerTransactionPayload
): Promise<any> => {
  const res = await api.post("/cash-drawer/withdraw", payload);
  return res.data;
};

/** GET /cash-drawer/statement  (ADMIN | SHOP_MANAGER) */
export const getCashDrawerStatement = async (): Promise<
  CashDrawerTransaction[]
> => {
  const res = await api.get("/cash-drawer/statement");
  return res.data.transactions;
};

/** GET /cash-drawer/transactions  (ADMIN | SHOP_MANAGER) */
export const getCashDrawerTransactions = async (): Promise<
  CashDrawerTransaction[]
> => {
  const res = await api.get("/cash-drawer/transactions");
  return res.data.transactions;
};

/** GET /cash-drawer/audit  (ADMIN) */
export const getCashDrawerAudit = async (): Promise<
  CashDrawerTransaction[]
> => {
  const res = await api.get("/cash-drawer/audit");
  return res.data.audit;
};

/** GET /cash-drawer/daily-summary  (ADMIN | SHOP_MANAGER) */
export const getCashDrawerDailySummary =
  async (): Promise<CashDrawerDailySummary> => {
    const res = await api.get("/cash-drawer/daily-summary");
    return res.data;
  };

/** GET /cash-drawer/dashboard  (ADMIN | SHOP_MANAGER) */
export const getCashDrawerDashboard =
  async (): Promise<CashDrawerDashboard> => {
    const res = await api.get("/cash-drawer/dashboard");
    return res.data;
  };

// ─────────────────────────────────────────────────────────────────────────────
// BANK
// ─────────────────────────────────────────────────────────────────────────────

export interface BankTransaction {
  id: number;
  transaction_type:
    | "DEPOSIT"
    | "WITHDRAW"
    | "BANK_CHARGE"
    | "BANK_CHARGE_EDIT"
    | "BANK_CHARGE_REVERSAL";
  amount: number;
  balance_after: number;
  reference?: string;
  notes?: string;
  is_reconciled?: boolean;
  performed_by?: number;
  created_at: string;
}

export interface BankTransactionPayload {
  amount: number;
  reference?: string;
  notes?: string;
}

export interface BankDashboard {
  current_balance: number;
  today: { deposits: number; withdrawals: number; net: number };
  this_month: { deposits: number; withdrawals: number; net: number };
  total_transactions: number;
  pending_reconciliation: number;
  total_bank_charges: number;
  chart: { date: string; deposits: number; withdrawals: number }[];
  recent_transactions: BankTransaction[];
}

export interface ReconciliationPayload {
  transaction_ids: number[];
}

/** GET /bank/balance  (ADMIN | SHOP_MANAGER) */
export const getBankBalance = async (): Promise<number> => {
  const res = await api.get("/bank/balance");
  return res.data.balance;
};

/** GET /bank/statement  (ADMIN | SHOP_MANAGER) */
export const getBankStatement = async (): Promise<BankTransaction[]> => {
  const res = await api.get("/bank/statement");
  return res.data.transactions;
};

/** POST /bank/deposit  (ADMIN | SHOP_MANAGER) */
export const bankDeposit = async (
  payload: BankTransactionPayload
): Promise<{ message: string; balance: number }> => {
  const res = await api.post("/bank/deposit", payload);
  return res.data;
};

/** POST /bank/withdraw  (ADMIN | SHOP_MANAGER) */
export const bankWithdraw = async (
  payload: BankTransactionPayload
): Promise<{ message: string; balance: number }> => {
  const res = await api.post("/bank/withdraw", payload);
  return res.data;
};

/** GET /bank/transfers  (ADMIN | SHOP_MANAGER) */
export const getBankTransfers = async (): Promise<BankTransaction[]> => {
  const res = await api.get("/bank/transfers");
  return res.data.transfers;
};

/** GET /bank/reconciliation  (ADMIN) */
export const getBankReconciliation = async (): Promise<BankTransaction[]> => {
  const res = await api.get("/bank/reconciliation");
  return res.data.unreconciled;
};

/** POST /bank/reconciliation/verify  (ADMIN) */
export const verifyReconciliation = async (
  payload: ReconciliationPayload
): Promise<{ message: string }> => {
  const res = await api.post("/bank/reconciliation/verify", payload);
  return res.data;
};

/** GET /bank/dashboard  (ADMIN | SHOP_MANAGER) */
export const getBankDashboard = async (): Promise<BankDashboard> => {
  const res = await api.get("/bank/dashboard");
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// BANK CHARGES
// ─────────────────────────────────────────────────────────────────────────────

export interface BankCharge {
  id: number;
  title: string;
  charge_type: "SERVICE_FEE" | "TRANSACTION_FEE" | "PENALTY" | "OTHER";
  amount: number;
  description?: string;
  charged_on: string;
  created_by?: number;
}

export interface CreateBankChargePayload {
  title: string;
  charge_type: "SERVICE_FEE" | "TRANSACTION_FEE" | "PENALTY" | "OTHER";
  amount: number;
  description?: string;
}

export interface BankChargesReport {
  total_charges: number;
  total_count: number;
  by_type: { charge_type: string; count: number; total: number }[];
}

/** GET /bank/charges  (ADMIN | SHOP_MANAGER) */
export const getBankCharges = async (): Promise<BankCharge[]> => {
  const res = await api.get("/bank/charges");
  return res.data.bank_charges;
};

/** POST /bank/charges  (ADMIN | SHOP_MANAGER) */
export const createBankCharge = async (
  payload: CreateBankChargePayload
): Promise<BankCharge> => {
  const res = await api.post("/bank/charges", payload);
  return res.data.bank_charge;
};

/** PUT /bank/charges/:charge_id  (ADMIN | SHOP_MANAGER) */
export const updateBankCharge = async (
  chargeId: number,
  payload: Partial<CreateBankChargePayload>
): Promise<BankCharge> => {
  const res = await api.put(`/bank/charges/${chargeId}`, payload);
  return res.data.bank_charge;
};

/** DELETE /bank/charges/:charge_id  (ADMIN) */
export const deleteBankCharge = async (chargeId: number): Promise<void> => {
  await api.delete(`/bank/charges/${chargeId}`);
};

/** GET /bank/charges/report  (ADMIN | SHOP_MANAGER) */
export const getBankChargesReport = async (): Promise<BankChargesReport> => {
  const res = await api.get("/bank/charges/report");
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type?: string;
  reference_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationPayload {
  user_id?: number;
  title: string;
  message: string;
  notification_type?: string;
  reference_id?: number;
}

/** GET /notifications  (any authenticated user — own notifications) */
export const getNotifications = async (): Promise<Notification[]> => {
  const res = await api.get("/notifications");
  return res.data.notifications;
};

/** POST /notifications/send  (ADMIN | SHOP_MANAGER) */
export const sendNotification = async (
  payload: CreateNotificationPayload
): Promise<Notification> => {
  const res = await api.post("/notifications/send", payload);
  return res.data.notification;
};

/** PUT /notifications/:notif_id/read  (any authenticated user) */
export const markNotificationRead = async (
  notifId: number
): Promise<{ message: string }> => {
  const res = await api.put(`/notifications/${notifId}/read`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  reference_type?: string;
  reference_id?: number;
  details?: any;
  created_at: string;
}

/** GET /audit-logs  (ADMIN) */
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const res = await api.get("/audit-logs");
  return res.data.logs;
};

/** GET /audit-logs/user/:user_id  (ADMIN) */
export const getAuditLogsByUser = async (
  userId: number
): Promise<AuditLog[]> => {
  const res = await api.get(`/audit-logs/user/${userId}`);
  return res.data.logs;
};

/** GET /audit-logs/order/:order_id  (ADMIN | SHOP_MANAGER) */
export const getAuditLogsByOrder = async (
  orderId: number
): Promise<AuditLog[]> => {
  const res = await api.get(`/audit-logs/order/${orderId}`);
  return res.data.logs;
};

// ─────────────────────────────────────────────────────────────────────────────
// PARTNERS
// ─────────────────────────────────────────────────────────────────────────────

export interface Partner {
  id: number;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  commission_percent: number;
  is_active: boolean;
  created_at?: string;
}

export interface CreatePartnerPayload {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  commission_percent?: number;
}

export interface UpdatePartnerPayload {
  name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  commission_percent?: number;
  is_active?: boolean;
}

/** GET /partners  (ADMIN | SHOP_MANAGER) */
export const getPartners = async (): Promise<Partner[]> => {
  const res = await api.get("/partners");
  return res.data.partners;
};

/** POST /partners  (ADMIN) */
export const createPartner = async (
  payload: CreatePartnerPayload
): Promise<Partner> => {
  const res = await api.post("/partners", payload);
  return res.data.partner;
};

/** PUT /partners/:partner_id  (ADMIN) */
export const updatePartner = async (
  partnerId: number,
  payload: UpdatePartnerPayload
): Promise<Partner> => {
  const res = await api.put(`/partners/${partnerId}`, payload);
  return res.data.partner;
};

/** DELETE /partners/:partner_id  (ADMIN) */
export const deletePartner = async (partnerId: number): Promise<void> => {
  await api.delete(`/partners/${partnerId}`);
};

/** GET /partners/:partner_id/orders  (ADMIN | SHOP_MANAGER) */
export const getPartnerOrders = async (partnerId: number): Promise<any[]> => {
  const res = await api.get(`/partners/${partnerId}/orders`);
  return res.data.orders;
};

/** GET /partners/:partner_id/report  (ADMIN | SHOP_MANAGER) */
export const getPartnerReport = async (partnerId: number): Promise<any> => {
  const res = await api.get(`/partners/${partnerId}/report`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────────────────────────────────────────

export interface Brand {
  id: number;
  name: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateBrandPayload {
  name: string;
  logo_url?: string;
  description?: string;
}

export interface UpdateBrandPayload {
  name?: string;
  logo_url?: string;
  description?: string;
  is_active?: boolean;
}

/** GET /brands  (public) */
export const getBrands = async (): Promise<Brand[]> => {
  const res = await api.get("/brands");
  return res.data.brands;
};

/** POST /brands  (ADMIN | SHOP_MANAGER) */
export const createBrand = async (
  payload: CreateBrandPayload
): Promise<Brand> => {
  const res = await api.post("/brands", payload);
  return res.data.brand;
};

/** PUT /brands/:brand_id  (ADMIN | SHOP_MANAGER) */
export const updateBrand = async (
  brandId: number,
  payload: UpdateBrandPayload
): Promise<Brand> => {
  const res = await api.put(`/brands/${brandId}`, payload);
  return res.data.brand;
};

/** DELETE /brands/:brand_id  (ADMIN | SHOP_MANAGER) */
export const deleteBrand = async (brandId: number): Promise<void> => {
  await api.delete(`/brands/${brandId}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER SETTLEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export interface DriverSettlement {
  id: number;
  driver_id: number;
  amount: number;
  orders_count: number;
  period_start?: string;
  period_end?: string;
  status: "PENDING" | "PAID";
  paid_at?: string;
  paid_by?: number;
  payment_source: "CASH" | "BANK";
  reference?: string;
  notes?: string;
  created_at?: string;
}

export interface PendingSettlement {
  driver_id: number;
  total_orders: number;
  delivery_amount: number;
  already_paid: number;
  pending_amount: number;
  orders: { order_id: number; amount: number }[];
}

export interface PaySettlementPayload {
  driver_id: number;
  amount: number;
  payment_source: "CASH" | "BANK";
  orders_count?: number;
  period_start?: string;
  period_end?: string;
  reference?: string;
  notes?: string;
}

/** GET /driver-settlements  (ADMIN | SHOP_MANAGER) */
export const getDriverSettlements = async (): Promise<DriverSettlement[]> => {
  const res = await api.get("/driver-settlements");
  return res.data.settlements;
};

/** GET /driver-settlements/:driver_id  (ADMIN | SHOP_MANAGER) */
export const getDriverSettlementsByDriver = async (
  driverId: number
): Promise<DriverSettlement[]> => {
  const res = await api.get(`/driver-settlements/${driverId}`);
  return res.data.settlements;
};

/** GET /driver-settlements/pending/:driver_id  (ADMIN | SHOP_MANAGER) */
export const getPendingSettlement = async (
  driverId: number
): Promise<PendingSettlement> => {
  const res = await api.get(`/driver-settlements/pending/${driverId}`);
  return res.data;
};

/** POST /driver-settlements/pay  (ADMIN | SHOP_MANAGER) */
export const payDriverSettlement = async (
  payload: PaySettlementPayload
): Promise<DriverSettlement> => {
  const res = await api.post("/driver-settlements/pay", payload);
  return res.data.settlement;
};

/** GET /driver-settlements/report  (ADMIN | SHOP_MANAGER) */
export const getSettlementReport = async (): Promise<{
  total_paid: number;
}> => {
  const res = await api.get("/driver-settlements/report");
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomOrder {
  id: number;
  customer_id: number;
  description: string;
  budget?: number;
  notes?: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CONVERTED";
  quoted_price?: number;
  delivery_date?: string;
  rejection_reason?: string;
  images?: { url: string; public_id: string }[];
  created_at?: string;
}

export interface CreateCustomOrderPayload {
  customer_id: number;
  description: string;
  budget?: number;
  notes?: string;
}

export interface UpdateCustomOrderPayload {
  description?: string;
  budget?: number;
  notes?: string;
  quoted_price?: number;
  delivery_date?: string;
}

/** GET /custom-orders  (ADMIN | SHOP_MANAGER | SALES_AGENT) */
export const getCustomOrders = async (): Promise<CustomOrder[]> => {
  const res = await api.get("/custom-orders");
  return res.data.custom_orders;
};

/** POST /custom-orders  (any authenticated user) */
export const createCustomOrder = async (
  payload: CreateCustomOrderPayload
): Promise<CustomOrder> => {
  const res = await api.post("/custom-orders", payload);
  return res.data.custom_order;
};

/** GET /custom-orders/:co_id  (any authenticated user) */
export const getCustomOrder = async (coId: number): Promise<CustomOrder> => {
  const res = await api.get(`/custom-orders/${coId}`);
  return res.data.custom_order;
};

/** PUT /custom-orders/:co_id  (ADMIN | SHOP_MANAGER) */
export const updateCustomOrder = async (
  coId: number,
  payload: UpdateCustomOrderPayload
): Promise<CustomOrder> => {
  const res = await api.put(`/custom-orders/${coId}`, payload);
  return res.data.custom_order;
};

/** DELETE /custom-orders/:co_id  (ADMIN | SHOP_MANAGER) */
export const deleteCustomOrder = async (coId: number): Promise<void> => {
  await api.delete(`/custom-orders/${coId}`);
};

/** POST /custom-orders/:co_id/upload-image  (any authenticated user) — multipart/form-data */
export const uploadCustomOrderImage = async (
  coId: number,
  imageFile: File
): Promise<{ message: string; image_url: string }> => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const res = await api.post(`/custom-orders/${coId}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** GET /custom-orders/:co_id/images  (any authenticated user) */
export const getCustomOrderImages = async (
  coId: number
): Promise<{ url: string; public_id: string }[]> => {
  const res = await api.get(`/custom-orders/${coId}/images`);
  return res.data.images;
};

/** DELETE /custom-orders/:co_id/images/:image_id  (ADMIN | SHOP_MANAGER) */
export const deleteCustomOrderImage = async (
  coId: number,
  imageId: string
): Promise<void> => {
  await api.delete(`/custom-orders/${coId}/images/${imageId}`);
};

/** POST /custom-orders/:co_id/approve  (ADMIN | SHOP_MANAGER) */
export const approveCustomOrder = async (
  coId: number,
  quotedPrice?: number
): Promise<CustomOrder> => {
  const res = await api.post(`/custom-orders/${coId}/approve`, {
    quoted_price: quotedPrice,
  });
  return res.data.custom_order;
};

/** POST /custom-orders/:co_id/reject  (ADMIN | SHOP_MANAGER) */
export const rejectCustomOrder = async (
  coId: number,
  reason?: string
): Promise<{ message: string }> => {
  const res = await api.post(`/custom-orders/${coId}/reject`, {
    reason,
  });
  return res.data;
};

/** POST /custom-orders/:co_id/convert-to-order  (ADMIN | SHOP_MANAGER) */
export const convertCustomOrderToOrder = async (
  coId: number
): Promise<{ message: string; custom_order: CustomOrder }> => {
  const res = await api.post(`/custom-orders/${coId}/convert-to-order`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SOURCES
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderSource {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateOrderSourcePayload {
  name: string;
  description?: string;
}

export interface UpdateOrderSourcePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}

/** GET /order-sources  (any authenticated user) */
export const getOrderSources = async (): Promise<OrderSource[]> => {
  const res = await api.get("/order-sources");
  return res.data.sources;
};

/** POST /order-sources  (ADMIN | SHOP_MANAGER) */
export const createOrderSource = async (
  payload: CreateOrderSourcePayload
): Promise<OrderSource> => {
  const res = await api.post("/order-sources", payload);
  return res.data.source;
};

/** PUT /order-sources/:source_id  (ADMIN | SHOP_MANAGER) */
export const updateOrderSource = async (
  sourceId: number,
  payload: UpdateOrderSourcePayload
): Promise<OrderSource> => {
  const res = await api.put(`/order-sources/${sourceId}`, payload);
  return res.data.source;
};

/** DELETE /order-sources/:source_id  (ADMIN | SHOP_MANAGER) */
export const deleteOrderSource = async (sourceId: number): Promise<void> => {
  await api.delete(`/order-sources/${sourceId}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP
// ─────────────────────────────────────────────────────────────────────────────

export interface WhatsAppOrderPayload {
  order_id: number;
}

export interface WhatsAppPaymentLinkPayload {
  order_id: number;
}

export interface WhatsAppDeliveryUpdatePayload {
  order_id: number;
}

/** POST /whatsapp/send-order  (any authenticated user) */
export const whatsappSendOrder = async (
  payload: WhatsAppOrderPayload
): Promise<{ message: string; order_id: number }> => {
  const res = await api.post("/whatsapp/send-order", payload);
  return res.data;
};

/** POST /whatsapp/send-payment-link  (any authenticated user) */
export const whatsappSendPaymentLink = async (
  payload: WhatsAppPaymentLinkPayload
): Promise<{ message: string; order_id: number }> => {
  const res = await api.post("/whatsapp/send-payment-link", payload);
  return res.data;
};

/** POST /whatsapp/send-delivery-update  (any authenticated user) */
export const whatsappSendDeliveryUpdate = async (
  payload: WhatsAppDeliveryUpdatePayload
): Promise<{ message: string; order_id: number }> => {
  const res = await api.post("/whatsapp/send-delivery-update", payload);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT — grouped namespace for convenience
// ─────────────────────────────────────────────────────────────────────────────

const financeService = {
  // Expenses
  getExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseReport,
  getExpenseDashboard,

  // Cash Drawer
  getCashDrawerBalance,
  addCash,
  cashDeposit,
  cashWithdraw,
  getCashDrawerStatement,
  getCashDrawerTransactions,
  getCashDrawerAudit,
  getCashDrawerDailySummary,
  getCashDrawerDashboard,

  // Bank
  getBankBalance,
  getBankStatement,
  bankDeposit,
  bankWithdraw,
  getBankTransfers,
  getBankReconciliation,
  verifyReconciliation,
  getBankDashboard,

  // Bank Charges
  getBankCharges,
  createBankCharge,
  updateBankCharge,
  deleteBankCharge,
  getBankChargesReport,

  // Notifications
  getNotifications,
  sendNotification,
  markNotificationRead,

  // Audit Logs
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByOrder,

  // Partners
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerOrders,
  getPartnerReport,

  // Brands
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,

  // Driver Settlements
  getDriverSettlements,
  getDriverSettlementsByDriver,
  getPendingSettlement,
  payDriverSettlement,
  getSettlementReport,

  // Custom Orders
  getCustomOrders,
  createCustomOrder,
  getCustomOrder,
  updateCustomOrder,
  deleteCustomOrder,
  uploadCustomOrderImage,
  getCustomOrderImages,
  deleteCustomOrderImage,
  approveCustomOrder,
  rejectCustomOrder,
  convertCustomOrderToOrder,

  // Order Sources
  getOrderSources,
  createOrderSource,
  updateOrderSource,
  deleteOrderSource,

  // WhatsApp
  whatsappSendOrder,
  whatsappSendPaymentLink,
  whatsappSendDeliveryUpdate,
};

export default financeService;