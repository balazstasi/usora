export interface Installment {
  id: string;
  amount: number;
  date: Date | undefined;
}

export interface TransactionData {
  mode: "lending" | "scheduled_payments";
  recipientEmail: string;
  totalAmount: number;
  installments: Installment[];
}

export interface TrackedTransaction {
  id: string;
  type: "lending" | "receiving";
  recipientEmail: string;
  totalAmount: number;
  remainingAmount: number;
  nextPaymentDate: Date;
  nextPaymentAmount: number;
  status: "active" | "completed" | "overdue" | "pending";
  installments: TrackedInstallment[];
  createdAt: Date;
}

export interface TrackedInstallment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: "pending" | "paid" | "overdue";
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
}

export interface Step1Data {
  recipientEmail: string;
  totalAmount: string;
  isLendingMode: boolean;
}

export interface Step2Data {
  numberOfInstallments: number;
  startDate: Date | undefined;
  frequency: "weekly" | "monthly";
}

export interface MobileHeaderProps {
  currentPage: "form" | "tracking" | "dashboard";
  onPageChange: (page: "form" | "tracking" | "dashboard") => void;
  onBack?: () => void;
  showBack?: boolean;
}
