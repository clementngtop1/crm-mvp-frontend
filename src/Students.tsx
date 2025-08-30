import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Upload,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { studentsApi } from '../utils/api';
import { Student } from '../types';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsApi.getAll({ search: searchTerm });
      setStudents(response.data);
    } catch (err) {
      setError('Failed to load students');
      console.error('Students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsApi.delete(id);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentStatus = (student: Student) => {
    const totalPaid = student.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0;
    const totalPending = student.payments?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0) || 0;
    const totalOverdue = student.payments?.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0) || 0;

    if (totalOverdue > 0) return { status: 'Overdue', color: 'text-red-600 bg-red-50' };
    if (totalPending > 0) return { status: 'Pending', color: 'text-yellow-600 bg-yellow-50' };
    if (totalPaid > 0) return { status: 'Paid', color: 'text-green-600 bg-green-50' };
    return { status: 'No Payments', color: 'text-gray-600 bg-gray-50' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your student database
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const paymentStatus = getPaymentStatus(student);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.id.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-3 w-3 mr-1" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.enrollments?.length || 0} course(s)
                      </div>
                      {student.enrollments?.slice(0, 2).map((enrollment, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          {enrollment.courseName}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatus.color}`}>
                        {paymentStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/students/${student.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {students.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new student.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;

