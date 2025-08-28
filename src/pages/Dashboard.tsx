import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { dashboardApi } from '../utils/api';
import { DashboardStats, RecentActivities, StudentWithOutstanding } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivities | null>(null);
  const [outstandingStudents, setOutstandingStudents] = useState<StudentWithOutstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes, outstandingRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentActivities(5),
          dashboardApi.getStudentsWithOutstanding()
        ]);

        setStats(statsRes.data);
        setRecentActivities(activitiesRes.data);
        setOutstandingStudents(outstandingRes.data.slice(0, 5)); // Top 5 outstanding
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your training business CRM
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Students
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats?.students.total || 0}
                </dd>
                <dd className="text-sm text-green-600">
                  +{stats?.students.recentlyAdded || 0} this month
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Active Enrollments */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Enrollments
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stats?.enrollments.active || 0}
                </dd>
                <dd className="text-sm text-blue-600">
                  {stats?.enrollments.total || 0} total
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Revenue
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.payments.paidAmount || 0)}
                </dd>
                <dd className="text-sm text-gray-600">
                  {stats?.payments.paidPayments || 0} payments
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Payments
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.payments.pendingAmount || 0)}
                </dd>
                <dd className="text-sm text-red-600">
                  {stats?.payments.pendingPayments || 0} pending
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Outstanding Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
            <Link to="/students" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivities?.students.slice(0, 3).map((student) => (
              <div key={student.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.name}
                  </p>
                  <p className="text-sm text-gray-500">New student registered</p>
                </div>
                <div className="text-sm text-gray-400">
                  {formatDate(student.createdAt)}
                </div>
              </div>
            ))}
            
            {recentActivities?.enrollments.slice(0, 2).map((enrollment) => (
              <div key={enrollment.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {enrollment.student?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Enrolled in {enrollment.courseName}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {formatDate(enrollment.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Outstanding Payments</h3>
            <Link to="/payments" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {outstandingStudents.length > 0 ? (
              outstandingStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    {formatCurrency(student.totalOutstanding)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 text-sm text-gray-500">
                  No outstanding payments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/students"
            className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-blue-900">Add Student</span>
          </Link>
          <Link
            to="/enrollments"
            className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-green-900">New Enrollment</span>
          </Link>
          <Link
            to="/payments"
            className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <CreditCard className="h-5 w-5 text-yellow-600 mr-3" />
            <span className="text-sm font-medium text-yellow-900">Record Payment</span>
          </Link>
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-purple-900">View Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

