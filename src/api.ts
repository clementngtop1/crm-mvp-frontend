import axios from 'axios';
import {
  Student,
  Enrollment,
  Payment,
  DashboardStats,
  RecentActivities,
  CourseStats,
  PaymentTrend,
  StudentWithOutstanding
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Students API
export const studentsApi = {
  getAll: (params?: { course?: string; status?: string; search?: string }) =>
    api.get<Student[]>('/students', { params }),
  
  getById: (id: string) =>
    api.get<Student>(`/students/${id}`),
  
  create: (data: { name: string; email: string; phone?: string }) =>
    api.post<Student>('/students', data),
  
  update: (id: string, data: { name?: string; email?: string; phone?: string }) =>
    api.put<Student>(`/students/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/students/${id}`),
  
  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    return api.post('/students/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Enrollments API
export const enrollmentsApi = {
  getAll: (params?: { course?: string; batch?: string; studentId?: string }) =>
    api.get<Enrollment[]>('/enrollments', { params }),
  
  getById: (id: string) =>
    api.get<Enrollment>(`/enrollments/${id}`),
  
  create: (data: { courseName: string; batch?: string; startDate: string; studentId: string }) =>
    api.post<Enrollment>('/enrollments', data),
  
  update: (id: string, data: { courseName?: string; batch?: string; startDate?: string }) =>
    api.put<Enrollment>(`/enrollments/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/enrollments/${id}`),
  
  getCourses: () =>
    api.get<string[]>('/enrollments/courses/list'),
  
  getBatches: () =>
    api.get<string[]>('/enrollments/batches/list'),
};

// Payments API
export const paymentsApi = {
  getAll: (params?: { 
    status?: string; 
    method?: string; 
    studentId?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  }) =>
    api.get<Payment[]>('/payments', { params }),
  
  getById: (id: string) =>
    api.get<Payment>(`/payments/${id}`),
  
  create: (data: { 
    amount: number; 
    date: string; 
    method: string; 
    status?: string; 
    studentId: string; 
  }) =>
    api.post<Payment>('/payments', data),
  
  update: (id: string, data: { 
    amount?: number; 
    date?: string; 
    method?: string; 
    status?: string; 
  }) =>
    api.put<Payment>(`/payments/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/payments/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.put<Payment>(`/payments/${id}/status`, { status }),
  
  getStudentSummary: (studentId: string) =>
    api.get(`/payments/student/${studentId}/summary`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats'),
  
  getRecentActivities: (limit?: number) =>
    api.get<RecentActivities>('/dashboard/recent-activities', { 
      params: { limit } 
    }),
  
  getCourseStats: () =>
    api.get<CourseStats[]>('/dashboard/course-stats'),
  
  getPaymentTrends: (period?: 'week' | 'month' | 'year') =>
    api.get<PaymentTrend[]>('/dashboard/payment-trends', { 
      params: { period } 
    }),
  
  getStudentsWithOutstanding: () =>
    api.get<StudentWithOutstanding[]>('/dashboard/students-with-outstanding'),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;

