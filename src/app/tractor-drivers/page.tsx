'use client';

import { useState, useEffect, useMemo } from 'react';
import { TractorDriver, TractorDriverFormData } from '@/types/tractorDriver';
import { tractorDriverApi } from '@/lib/tractorDriverApi';
import TractorDriverForm from '@/components/TractorDriverForm';

type ViewMode = 'table' | 'card';

export default function TractorDriversPage() {
  const [tractorDrivers, setTractorDrivers] = useState<TractorDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTractorDriver, setEditingTractorDriver] = useState<TractorDriver | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<keyof TractorDriver | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchTractorDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tractorDriverApi.getAll();
      setTractorDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tractor drivers');
      console.error('Error fetching tractor drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTractorDrivers();
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

  // Filter and sort tractor drivers
  const filteredAndSortedTractorDrivers = useMemo(() => {
    let result = [...tractorDrivers];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (driver) =>
          driver.name.toLowerCase().includes(query) ||
          driver.phone.includes(query) ||
          driver.username.toLowerCase().includes(query) ||
          String(driver.machineQuantity).includes(query) ||
          String(driver.pricePerAcre).includes(query)
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
  }, [tractorDrivers, searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof TractorDriver) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    setEditingTractorDriver(null);
    setShowForm(true);
  };

  const handleEdit = (tractorDriver: TractorDriver) => {
    setEditingTractorDriver(tractorDriver);
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
      await tractorDriverApi.delete(id);
      await fetchTractorDrivers();
      setDeleteConfirm(null);
      setSuccess('Delete Successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tractor driver');
      setSuccess(null);
      console.error('Error deleting tractor driver:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (formData: TractorDriverFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      if (editingTractorDriver?.tractorDriverId) {
        await tractorDriverApi.update(editingTractorDriver.tractorDriverId, formData);
        setSuccess('Edit Successfully!');
      } else {
        await tractorDriverApi.create(formData);
        setSuccess('Add New Tractor Driver Successfully!');
      }

      setShowForm(false);
      setEditingTractorDriver(null);
      await fetchTractorDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tractor driver');
      setSuccess(null);
      console.error('Error saving tractor driver:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTractorDriver(null);
    setError(null);
    setSuccess(null);
  };

  const stats = useMemo(() => {
    const totalMachines = tractorDrivers.reduce((sum, driver) => sum + (driver.machineQuantity || 0), 0);
    const avgPrice = tractorDrivers.length > 0
      ? tractorDrivers.reduce((sum, driver) => sum + (driver.pricePerAcre || 0), 0) / tractorDrivers.length
      : 0;
    
    return {
      total: tractorDrivers.length,
      filtered: filteredAndSortedTractorDrivers.length,
      totalMachines,
      avgPrice,
    };
  }, [tractorDrivers, filteredAndSortedTractorDrivers.length]);

  if (loading && tractorDrivers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <div className="text-xl font-medium text-gray-700">Loading tractor drivers...</div>
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
                  Tractor Drivers Management
                </span>
              </h1>
              <p className="text-lg text-gray-600 font-medium">Manage your tractor driver community with precision</p>
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
                <span className="relative z-10">Add New Driver</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          {!showForm && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="group relative glass-effect rounded-2xl p-6 border border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Drivers</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.total}</p>
                    <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Total Machines</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalMachines}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium">Available</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="group relative glass-effect rounded-2xl p-6 border border-cyan-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 card-hover-effect overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Avg Price/Acre</p>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">LKR {stats.avgPrice.toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 font-medium">Active pricing</span>
                    </div>
                  </div>
                  <div className="relative p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and View Controls */}
          {!showForm && tractorDrivers.length > 0 && (
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
                    placeholder="Search tractor drivers by name, phone, username, machine quantity, or price..."
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
                  {editingTractorDriver ? 'Edit Tractor Driver' : 'Add New Tractor Driver'}
                </h2>
                <p className="text-gray-500 mt-1 font-medium">
                  {editingTractorDriver ? 'Update tractor driver information' : 'Register a new tractor driver to the system'}
                </p>
              </div>
            </div>
            <div className="relative">
              <TractorDriverForm
                tractorDriver={editingTractorDriver || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        ) : (
          <>
            {filteredAndSortedTractorDrivers.length === 0 ? (
              <div className="glass-effect rounded-2xl shadow-xl p-12 text-center border border-green-200/50 backdrop-blur-xl">
                <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg mb-2 font-medium">
                  {searchQuery ? 'No tractor drivers found matching your search.' : 'No tractor drivers found in your database.'}
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
                    Add Your First Tractor Driver
                  </button>
                )}
              </div>
            ) : viewMode === 'table' ? (
              <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden border border-green-200/50 backdrop-blur-xl animate-slide-up">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative">
                      <tr>
                        {(['tractorDriverId', 'name', 'phone', 'machineQuantity', 'pricePerAcre', 'username'] as const).map((field) => (
                          <th
                            key={field}
                            onClick={() => handleSort(field)}
                            className="px-6 py-5 text-left text-xs font-extrabold text-white uppercase tracking-wider cursor-pointer hover:bg-white/20 transition-all duration-300 relative group"
                          >
                            <div className="flex items-center gap-2">
                              {field === 'tractorDriverId' ? 'ID' : field === 'machineQuantity' ? 'Machines' : field === 'pricePerAcre' ? 'Price/Acre (LKR)' : field.charAt(0).toUpperCase() + field.slice(1)}
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
                      {filteredAndSortedTractorDrivers.map((driver, index) => (
                        <tr key={driver.tractorDriverId} className={`group hover:bg-gradient-to-r hover:from-green-50/80 hover:to-emerald-50/80 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'} hover:shadow-lg`}>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold text-sm shadow-lg">
                              #{driver.tractorDriverId}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-green-600 font-bold text-sm">{driver.name.charAt(0)}</span>
                              </div>
                              <div className="text-sm font-bold text-gray-900">{driver.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {driver.phone}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border border-teal-200 shadow-sm">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              {driver.machineQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 border border-cyan-200 shadow-sm font-mono">
                              LKR {driver.pricePerAcre.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                              @{driver.username}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(driver)}
                                className="group/edit px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
                                title="Edit Tractor Driver"
                              >
                                <svg className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(driver.tractorDriverId!)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                                  deleteConfirm === driver.tractorDriverId
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:scale-110'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 border border-red-200'
                                }`}
                                disabled={isSubmitting}
                                title="Delete Tractor Driver"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {deleteConfirm === driver.tractorDriverId ? 'Confirm?' : 'Delete'}
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
                {filteredAndSortedTractorDrivers.map((driver, index) => (
                  <div
                    key={driver.tractorDriverId}
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300">
                              {driver.name}
                            </h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                              ID: #{driver.tractorDriverId}
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
                          <span className="text-sm font-semibold text-gray-700">{driver.phone}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-gray-50/50 hover:bg-teal-50/50 transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Machines</span>
                            </div>
                            <p className="text-2xl font-extrabold text-teal-600">{driver.machineQuantity}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-gray-50/50 hover:bg-cyan-50/50 transition-colors duration-200">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-semibold text-gray-500 uppercase">Price/Acre</span>
                            </div>
                            <p className="text-lg font-extrabold text-cyan-600 font-mono">LKR {driver.pricePerAcre.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                            @{driver.username}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-5 border-t-2 border-gradient-to-r from-green-100 to-emerald-100">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="flex-1 group/edit bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                        >
                          <svg className="w-5 h-5 group-hover/edit:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(driver.tractorDriverId!)}
                          className={`flex-1 px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform ${
                            deleteConfirm === driver.tractorDriverId
                              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                          }`}
                          disabled={isSubmitting}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deleteConfirm === driver.tractorDriverId ? 'Confirm' : 'Delete'}
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

