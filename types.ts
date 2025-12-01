export enum ExpenseStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  PAID = 'Paid',
  REJECTED = 'Rejected'
}

export interface ExpenseReport {
  id: string;
  reportNumber: string;
  date: string;
  company: string;
  businessPurpose: string;
  reimbursementType: string;
  memo: string;
  status: ExpenseStatus;
  total: number;
  lineItems: ExpenseLineItem[];
}

export interface ExpenseLineItem {
  id: string;
  date: string;
  expenseItem: string;
  quantity?: number; // For mileage
  perUnitAmount?: number; // For mileage
  amount: number;
  memo: string;
  costCenter: string;
  fund: string;
  additionalWorktags?: string;
  businessReason: string;
  receiptAttached: boolean;
  complianceWarning?: string;
}

export interface DashboardTile {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}
