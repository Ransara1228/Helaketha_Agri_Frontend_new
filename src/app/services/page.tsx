'use client';

import { useState, useEffect, useMemo } from 'react';
import { Service, ServiceFormData } from '@/types/service';
import { serviceApi } from '@/lib/serviceApi';
import ServiceForm from '@/components/ServiceForm';

type ViewMode = 'table' | 'card';

// Helper function to format service type names for display
const formatServiceType = (type: string): string => {
  return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<keyof Service | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceApi.getAll();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.serviceType.toLowerCase().includes(query) ||
          String(service.farmerId).includes(query) ||
          String(service.providerId).includes(query) ||
          service.bookingDate.includes(query) ||
          service.bookingTime.includes(query) ||
          String(service.totalCost).includes(query) ||
          service.status.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [services, searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof Service) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await serviceApi.delete(id);
      await fetchServices();
      setDeleteConfirm(null);
      setSuccess('Delete Successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
      setSuccess(null);
      console.error('Error deleting service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (formData: ServiceFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      if (editingService?.bookingId) {
        await serviceApi.update(editingService.bookingId, formData);
        setSuccess('Edit Successfully!');
      } else {
        await serviceApi.create(formData);
        setSuccess('Add New Service Successfully!');
      }

      setShowForm(false);
      setEditingService(null);
      await fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
      setSuccess(null);
      console.error('Error saving service:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    setError(null);
    setSuccess(null);
  };

  const stats = useMemo(() => {
    const pendingCount = services.filter(s => s.status === 'Pending').length;
    const confirmedCount = services.filter(s => s.status === 'Confirmed').length;
    const completedCount = services.filter(s => s.status === 'Completed').length;
    const totalRevenue = services.reduce((sum, service) => sum + (service.totalCost || 0), 0);
    
    return {
      total: services.length,
      filtered: filteredAndSortedServices.length,
      pending: pendingCount,
      confirmed: confirmedCount,
      completed: completedCount,
      totalRevenue,
    };
  }, [services, filteredAndSortedServices.length]);

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <div className="text-xl font-medium text-gray-700">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 via-teal-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-3 relative">
                <span className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 blur-2xl opacity-50"></span>
                <span className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Services Management
                </span>
              </h1>
              <p className="text-lg text-gray-600 font-medium">Manage your service bookings with precision</p>
            </div>
            {!showForm && (
              <button
                onClick={handleAdd}
                className="group relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-green-500/50 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 font-bold text-lg flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <svg className="w-6 h-6 relative z-10 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="relative z-10">Add New Service</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          {!showForm && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="group relative glass-effect rounded-2xl p-6 border border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Services</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.total}</p>
                    <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-emerald-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Filtered</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.filtered}</p>
                    <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.filtered / stats.total) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-teal-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Pending</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{stats.pending}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 font-medium">Waiting</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-cyan-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Completed</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{stats.completed}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 font-medium">Done</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Rs. {stats.totalRevenue.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">Income</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and View Controls */}
          {!showForm && services.length > 0 && (
            <div className="glass-effect rounded-2xl shadow-2xl p-6 border border-green-200/50 mb-8 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-green-500 group-focus-within:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search services by service type, farmer ID, provider ID, date, time, cost, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-200 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 glass-effect rounded-xl p-1.5 border border-green-200/50 shadow-lg">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-3 rounded-lg transition-all duration-300 relative overflow-hidden ${
                      viewMode === 'table'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-white/50 hover:text-green-600'
                    }`}
                    title="Table View"
                  >
                    {viewMode === 'table' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    )}
                    <svg className="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-3 rounded-lg transition-all duration-300 relative overflow-hidden ${
                      viewMode === 'card'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-white/50 hover:text-green-600'
                    }`}
                    title="Card View"
                  >
                    {viewMode === 'card' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    )}
                    <svg className="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 glass-effect bg-red-50/90 border-l-4 border-red-500 text-red-700 px-6 py-5 rounded-2xl shadow-2xl animate-slide-up backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <svg className="w-6 h-6 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-bold text-lg">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 glass-effect bg-gradient-to-r from-green-50 to-emerald-50/90 border-l-4 border-green-500 text-green-800 px-6 py-5 rounded-2xl shadow-2xl animate-slide-up backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-extrabold text-lg">{success}</span>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm ? (
          <div className="glass-effect rounded-3xl shadow-2xl p-10 border border-green-200/50 backdrop-blur-xl animate-slide-up overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-4 mb-8 pb-6 border-b-2 border-gradient-to-r from-green-200 to-emerald-200">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <p className="text-gray-500 mt-1 font-medium">
                  {editingService ? 'Update service booking information' : 'Create a new service booking entry'}
                </p>
              </div>
            </div>
            <div className="relative">
              <ServiceForm
                service={editingService || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        ) : (
          <>
            {filteredAndSortedServices.length === 0 ? (
              <div className="glass-effect rounded-2xl shadow-xl p-12 text-center border border-green-200/50 backdrop-blur-xl">
                <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg mb-2 font-medium">
                  {searchQuery ? 'No services found matching your search.' : 'No services found in your database.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-green-600 hover:text-green-700 font-medium text-sm mb-6"
                  >
                    Clear search
                  </button>
                )}
                {!searchQuery && (
                  <button
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 font-semibold mt-4"
                  >
                    Add Your First Service
                  </button>
                )}
              </div>
            ) : viewMode === 'table' ? (
              <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden border border-green-200/50 backdrop-blur-xl animate-slide-up">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative">
                      <tr>
                        {(['bookingId', 'farmerId', 'serviceType', 'providerId', 'bookingDate', 'bookingTime', 'totalCost', 'status'] as const).map((field) => (
                          <th
                            key={field}
                            onClick={() => handleSort(field)}
                            className="px-6 py-5 text-left text-xs font-extrabold text-white uppercase tracking-wider cursor-pointer hover:bg-white/20 transition-all duration-300 relative group"
                          >
                            <div className="flex items-center gap-2">
                              {field === 'bookingId' ? 'ID' : field === 'farmerId' ? 'Farmer ID' : field === 'serviceType' ? 'Service Type' : field === 'providerId' ? 'Provider ID' : field === 'bookingDate' ? 'Date' : field === 'bookingTime' ? 'Time' : field === 'totalCost' ? 'Cost' : field === 'status' ? 'Status' : ''}
                              {sortField === field && (
                                <svg className={`w-5 h-5 transition-transform duration-300 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                </svg>
                              )}
                              {!sortField || sortField !== field ? (
                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                              ) : null}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                          </th>
                        ))}
                        <th className="px-6 py-5 text-left text-xs font-extrabold text-white uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            Actions
                            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                      {filteredAndSortedServices.map((service, index) => (
                        <tr key={service.bookingId} className={`group hover:bg-gradient-to-r hover:from-green-50/80 hover:to-emerald-50/80 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'} hover:shadow-lg`}>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold text-sm shadow-lg">
                              #{service.bookingId}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 font-medium">
                            F#{service.farmerId}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm">
                              {formatServiceType(service.serviceType)}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 font-medium">
                            P#{service.providerId}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(service.bookingDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {service.bookingTime.length > 5 ? service.bookingTime.substring(0, 5) : service.bookingTime}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 shadow-sm">
                              Rs. {service.totalCost.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold border shadow-sm ${
                              service.status === 'Pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200' :
                              service.status === 'Confirmed' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200' :
                              service.status === 'Completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' :
                              service.status === 'Cancelled' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200' :
                              'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
                            }`}>
                              {service.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(service)}
                                className="group/edit px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
                                title="Edit Service"
                              >
                                <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(service.bookingId!)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                  deleteConfirm === service.bookingId
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:scale-110'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 border border-red-200'
                                }`}
                                disabled={isSubmitting}
                                title="Delete Service"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {deleteConfirm === service.bookingId ? 'Confirm?' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {filteredAndSortedServices.map((service, index) => (
                  <div
                    key={service.bookingId}
                    className="group relative glass-effect rounded-2xl shadow-xl p-6 border border-green-200/50 backdrop-blur-xl card-hover-effect overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br p-1 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${
                              service.status === 'Completed' ? 'from-green-400 to-emerald-500' :
                              service.status === 'Pending' ? 'from-yellow-400 to-amber-500' :
                              service.status === 'Confirmed' ? 'from-blue-400 to-indigo-500' :
                              service.status === 'Cancelled' ? 'from-red-400 to-pink-500' :
                              'from-gray-400 to-slate-500'
                            }`}>
                              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                                <svg className={`w-8 h-8 ${
                                  service.status === 'Completed' ? 'text-green-600' :
                                  service.status === 'Pending' ? 'text-yellow-600' :
                                  service.status === 'Confirmed' ? 'text-blue-600' :
                                  service.status === 'Cancelled' ? 'text-red-600' :
                                  'text-gray-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                              service.status === 'Completed' ? 'bg-green-500' :
                              service.status === 'Pending' ? 'bg-yellow-500' :
                              service.status === 'Confirmed' ? 'bg-blue-500' :
                              service.status === 'Cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}>
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300">
                              Booking #{service.bookingId}
                            </h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                              {formatServiceType(service.serviceType)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/50 hover:bg-blue-50/50 transition-colors duration-200">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-700">F#{service.farmerId}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/50 hover:bg-purple-50/50 transition-colors duration-200">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-700">P#{service.providerId}</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50/50 hover:bg-green-50/50 transition-colors duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Booking Date & Time</span>
                          </div>
                          <p className="text-sm font-bold text-green-600">{new Date(service.bookingDate).toLocaleDateString()}</p>
                          <p className="text-xs font-medium text-gray-600 mt-1">{service.bookingTime.length > 5 ? service.bookingTime.substring(0, 5) : service.bookingTime}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50/50 hover:bg-yellow-50/50 transition-colors duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Total Cost</span>
                          </div>
                          <p className="text-lg font-extrabold text-yellow-600">Rs. {service.totalCost.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50/50 transition-colors duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className={`w-4 h-4 ${
                              service.status === 'Completed' ? 'text-green-600' :
                              service.status === 'Pending' ? 'text-yellow-600' :
                              service.status === 'Confirmed' ? 'text-blue-600' :
                              service.status === 'Cancelled' ? 'text-red-600' :
                              'text-gray-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold border shadow-sm ${
                            service.status === 'Pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200' :
                            service.status === 'Confirmed' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200' :
                            service.status === 'Completed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' :
                            service.status === 'Cancelled' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200' :
                            'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-5 border-t-2 border-gradient-to-r from-green-100 to-emerald-100">
                        <button
                          onClick={() => handleEdit(service)}
                          className="flex-1 group/edit bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                        >
                          <svg className="w-5 h-5 group-hover/edit:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.bookingId!)}
                          className={`flex-1 px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform ${
                            deleteConfirm === service.bookingId
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                          }`}
                          disabled={isSubmitting}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deleteConfirm === service.bookingId ? 'Confirm' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

