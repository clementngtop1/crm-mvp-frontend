import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, CreditCard, BookOpen } from 'lucide-react';
import { studentsApi } from '../utils/api';
import { Student } from '../types';

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchStudent(id);
    }
  }, [id]);

  const fetchStudent = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await studentsApi.getById(studentId);
      setStudent(response.data);
    } catch (err) {
      setError('Failed to load student details');
      console.error('Student detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Student not found</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Link to="/students" className="mt-4 btn-primary inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Link>
      </div>
    );
  }

  const totalPaid = student.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalPending = student.payments?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalOverdue = student.payments?.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/students" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-sm text-gray-500">Student Details</p>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900">{student.phone}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">
                Joined {formatDate(student.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Paid</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="text-sm font-medium text-yellow-600">
                {formatCurrency(totalPending)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Overdue</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(totalOverdue)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Total Outstanding</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(totalPending + totalOverdue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Summary */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollments</h3>
          <div className="space-y-3">
            {student.enrollments?.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {enrollment.courseName}
                  </div>
                  {enrollment.batch && (
                    <div className="text-xs text-gray-500">
                      Batch: {enrollment.batch}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(enrollment.startDate)}
                </div>
              </div>
            ))}
            {(!student.enrollments || student.enrollments.length === 0) && (
              <p className="text-sm text-gray-500">No enrollments yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {student.payments?.slice(0, 10).map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.method.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'PAID' ? 'text-green-800 bg-green-100' :
                      payment.status === 'PENDING' ? 'text-yellow-800 bg-yellow-100' :
                      'text-red-800 bg-red-100'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!student.payments || student.payments.length === 0) && (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No payments recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

