export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  enrollments: Enrollment[];
  payments: Payment[];
}

export interface Enrollment {
  id: string;
  courseName: string;
  batch?: string;
  startDate: string;
  studentId: string;
  student?: Student;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  studentId: string;
  student?: Student;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface DashboardStats {
  students: {
    total: number;
    recentlyAdded: number;
  };
  enrollments: {
    total: number;
    active: number;
    recent: number;
  };
  payments: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
    overduePayments: number;
  };
  recent: {
    enrollments: number;
    payments: number;
  };
}

export interface RecentActivities {
  students: Student[];
  enrollments: Enrollment[];
  payments: Payment[];
}

export interface CourseStats {
  courseName: string;
  enrollmentCount: number;
}

export interface PaymentTrend {
  date: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  count: number;
}

export interface StudentWithOutstanding {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pendingAmount: number;
  overdueAmount: number;
  totalOutstanding: number;
  enrollments: Enrollment[];
  outstandingPayments: Payment[];
}

