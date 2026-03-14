'use client';

import { useState, useEffect, useMemo } from 'react';
import { FertilizerSupplier, FertilizerSupplierFormData } from '@/types/fertilizerSupplier';
import { fertilizerSupplierApi } from '@/lib/fertilizerSupplierApi';
import FertilizerSupplierForm from '@/components/FertilizerSupplierForm';
import AdminManagementHeader from '@/components/AdminManagementHeader';

type ViewMode = 'table' | 'card';

export default function FertilizerSuppliersPage() {
  const [fertilizerSuppliers, setFertilizerSuppliers] = useState<FertilizerSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFertilizerSupplier, setEditingFertilizerSupplier] = useState<FertilizerSupplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<keyof FertilizerSupplier | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchFertilizerSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fertilizerSupplierApi.getAll();
      setFertilizerSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fertilizer suppliers');
      console.error('Error fetching fertilizer suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFertilizerSuppliers();
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

  // Filter and sort fertilizer suppliers
  const filteredAndSortedFertilizerSuppliers = useMemo(() => {
    let result = [...fertilizerSuppliers];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(query) ||
          supplier.phone.includes(query) ||
          (supplier.email && supplier.email.toLowerCase().includes(query)) ||
          supplier.username.toLowerCase().includes(query) ||
          supplier.fertilizerType.toLowerCase().includes(query) ||
          String(supplier.stockQuantityLiters).includes(query) ||
          String(supplier.pricePerLiter).includes(query)
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
  }, [fertilizerSuppliers, searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof FertilizerSupplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    setEditingFertilizerSupplier(null);
    setShowForm(true);
  };

  const handleEdit = (fertilizerSupplier: FertilizerSupplier) => {
    setEditingFertilizerSupplier(fertilizerSupplier);
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
      await fertilizerSupplierApi.delete(id);
      await fetchFertilizerSuppliers();
      setDeleteConfirm(null);
      setSuccess('Delete Successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fertilizer supplier');
      setSuccess(null);
      console.error('Error deleting fertilizer supplier:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (formData: FertilizerSupplierFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      if (editingFertilizerSupplier?.supplierId) {
        await fertilizerSupplierApi.update(editingFertilizerSupplier.supplierId, formData);
        setSuccess('Edit Successfully!');
      } else {
        await fertilizerSupplierApi.create(formData);
        setSuccess('Add New Fertilizer Supplier Successfully!');
      }

      setShowForm(false);
      setEditingFertilizerSupplier(null);
      await fetchFertilizerSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fertilizer supplier');
      setSuccess(null);
      console.error('Error saving fertilizer supplier:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFertilizerSupplier(null);
    setError(null);
    setSuccess(null);
  };

  const stats = useMemo(() => {
    const totalStock = fertilizerSuppliers.reduce((sum, supplier) => sum + (supplier.stockQuantityLiters || 0), 0);
    const avgPrice = fertilizerSuppliers.length > 0
      ? fertilizerSuppliers.reduce((sum, supplier) => sum + (supplier.pricePerLiter || 0), 0) / fertilizerSuppliers.length
      : 0;
    
    return {
      total: fertilizerSuppliers.length,
      filtered: filteredAndSortedFertilizerSuppliers.length,
      totalStock,
      avgPrice,
    };
  }, [fertilizerSuppliers, filteredAndSortedFertilizerSuppliers.length]);

  if (loading && fertilizerSuppliers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <div className="text-xl font-medium text-gray-700">Loading fertilizer suppliers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          {!showForm && (
            <AdminManagementHeader
              badge="Fertilizer Suppliers Module"
              title="Fertilizer Suppliers Management"
              description="Manage supplier profiles, fertilizer stock, and pricing with the same admin-style interface."
              actionLabel="Add New Supplier"
              onAction={handleAdd}
            />
          )}

          {/* Statistics Cards */}
          {!showForm && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5 origin-top [transform:scale(0.94)]">
              <div className="group relative glass-effect rounded-2xl p-6 border border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Suppliers</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.total}</p>
                    <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-emerald-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Filtered Results</p>
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
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Stock (Liters)</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalStock.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">In stock</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-cyan-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Avg Price/Liter</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">LKR {stats.avgPrice.toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 font-medium">Market rate</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-emerald-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">System Status</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Active</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 font-medium">All systems operational</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.066 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.294c.299.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.294a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and View Controls */}
          {!showForm && fertilizerSuppliers.length > 0 && (
            <div className="glass-effect rounded-xl shadow-lg p-4 border border-green-200/50 mb-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-green-500 group-focus-within:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search fertilizer suppliers by name, phone, email, username, fertilizer type, stock quantity, or price..."
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {editingFertilizerSupplier ? 'Edit Fertilizer Supplier' : 'Add New Fertilizer Supplier'}
                </h2>
                <p className="text-gray-500 mt-1 font-medium">
                  {editingFertilizerSupplier ? 'Update fertilizer supplier information' : 'Register a new fertilizer supplier to the system'}
                </p>
              </div>
            </div>
            <div className="relative">
              <FertilizerSupplierForm
                fertilizerSupplier={editingFertilizerSupplier || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        ) : (
          <>
            {filteredAndSortedFertilizerSuppliers.length === 0 ? (
              <div className="glass-effect rounded-2xl shadow-xl p-12 text-center border border-green-200/50 backdrop-blur-xl">
                <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg mb-2 font-medium">
                  {searchQuery ? 'No fertilizer suppliers found matching your search.' : 'No fertilizer suppliers found in your database.'}
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
                    Add Your First Fertilizer Supplier
                  </button>
                )}
              </div>
            ) : viewMode === 'table' ? (
              <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden border border-green-200/50 backdrop-blur-xl animate-slide-up">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative">
                      <tr>
                        {(['supplierId', 'name', 'phone', 'email', 'fertilizerType', 'stockQuantityLiters', 'pricePerLiter', 'username'] as const).map((field) => (
                          <th
                            key={field}
                            onClick={() => handleSort(field)}
                            className="px-6 py-5 text-left text-xs font-extrabold text-white uppercase tracking-wider cursor-pointer hover:bg-white/20 transition-all duration-300 relative group"
                          >
                            <div className="flex items-center gap-2">
                              {field === 'supplierId' ? 'ID' : field === 'stockQuantityLiters' ? 'Stock (Liters)' : field === 'pricePerLiter' ? 'Price/Liter (LKR)' : field === 'fertilizerType' ? 'Fertilizer Type' : field.charAt(0).toUpperCase() + field.slice(1)}
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
                      {filteredAndSortedFertilizerSuppliers.map((supplier, index) => (
                        <tr key={supplier.supplierId} className={`group hover:bg-gradient-to-r hover:from-green-50/80 hover:to-emerald-50/80 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'} hover:shadow-lg`}>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold text-sm shadow-lg">
                              #{supplier.supplierId}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-green-600 font-bold text-sm">{supplier.name.charAt(0)}</span>
                              </div>
                              <div className="text-sm font-bold text-gray-900">{supplier.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {supplier.phone}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {supplier.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 shadow-sm">
                              {supplier.fertilizerType}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border border-teal-200 shadow-sm font-mono">
                              {supplier.stockQuantityLiters} L
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border border-cyan-200 shadow-sm font-mono">
                              LKR {supplier.pricePerLiter.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                              @{supplier.username}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(supplier)}
                                className="group/edit px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
                                title="Edit Fertilizer Supplier"
                              >
                                <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(supplier.supplierId!)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                  deleteConfirm === supplier.supplierId
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:scale-110'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 border border-red-200'
                                }`}
                                disabled={isSubmitting}
                                title="Delete Fertilizer Supplier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {deleteConfirm === supplier.supplierId ? 'Confirm?' : 'Delete'}
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
                {filteredAndSortedFertilizerSuppliers.map((supplier, index) => (
                  <div
                    key={supplier.supplierId}
                    className="group relative glass-effect rounded-2xl shadow-xl p-6 border border-green-200/50 backdrop-blur-xl card-hover-effect overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 p-1 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300">
                              {supplier.name}
                            </h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                              ID: #{supplier.supplierId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-green-50/50 transition-colors duration-200">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-blue-50/50 transition-colors duration-200">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{supplier.email || 'N/A'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50/50 hover:bg-amber-50/50 transition-colors duration-200">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Type</span>
                          </div>
                          <p className="text-lg font-extrabold text-amber-600">{supplier.fertilizerType}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-gray-50/50 hover:bg-teal-50/50 transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Stock</span>
                            </div>
                            <p className="text-2xl font-extrabold text-teal-600 font-mono">{supplier.stockQuantityLiters} L</p>
                          </div>
                          <div className="p-3 rounded-xl bg-gray-50/50 hover:bg-cyan-50/50 transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Price/Liter</span>
                            </div>
                            <p className="text-lg font-extrabold text-cyan-600 font-mono">LKR {supplier.pricePerLiter.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                            @{supplier.username}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-5 border-t-2 border-gradient-to-r from-green-100 to-emerald-100">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="flex-1 group/edit bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                        >
                          <svg className="w-5 h-5 group-hover/edit:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.supplierId!)}
                          className={`flex-1 px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform ${
                            deleteConfirm === supplier.supplierId
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                          }`}
                          disabled={isSubmitting}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deleteConfirm === supplier.supplierId ? 'Confirm' : 'Delete'}
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