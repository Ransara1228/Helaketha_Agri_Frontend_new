'use client';

import { useState, FormEvent } from 'react';
import { FertilizerSupplier, FertilizerSupplierFormData } from '@/types/fertilizerSupplier';

interface FertilizerSupplierFormProps {
  fertilizerSupplier?: FertilizerSupplier;
  onSubmit: (data: FertilizerSupplierFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const FERTILIZER_TYPES = [
  'Urea',
  'NPK',
  'Phosphate',
  'Potassium',
  'Compost',
  'Organic',
  'Other'
];

export default function FertilizerSupplierForm({ fertilizerSupplier, onSubmit, onCancel, isLoading }: FertilizerSupplierFormProps) {
  const [formData, setFormData] = useState<FertilizerSupplierFormData>({
    name: fertilizerSupplier?.name || '',
    phone: fertilizerSupplier?.phone || '',
    email: fertilizerSupplier?.email || '', // Added initial state for email
    fertilizerType: fertilizerSupplier?.fertilizerType || '',
    stockQuantityLiters: fertilizerSupplier?.stockQuantityLiters || 0,
    pricePerLiter: fertilizerSupplier?.pricePerLiter || 0,
    username: fertilizerSupplier?.username || '',
    // Password removed
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FertilizerSupplierFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FertilizerSupplierFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    // Added email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.fertilizerType.trim()) {
      newErrors.fertilizerType = 'Fertilizer type is required';
    }
    if (formData.stockQuantityLiters < 0) {
      newErrors.stockQuantityLiters = 'Stock quantity cannot be negative';
    }
    if (formData.pricePerLiter <= 0) {
      newErrors.pricePerLiter = 'Price per liter must be greater than 0';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    // Password validation removed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  const handleChange = (field: keyof FertilizerSupplierFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Supplier Name <span className="text-green-600">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Phone Input */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
          Phone <span className="text-green-600">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      {/* NEW EMAIL INPUT FIELD */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address <span className="text-green-600">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="supplier@example.com"
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Fertilizer Type Select */}
      <div>
        <label htmlFor="fertilizerType" className="block text-sm font-semibold text-gray-700 mb-2">
          Fertilizer Type <span className="text-green-600">*</span>
        </label>
        <select
          id="fertilizerType"
          value={formData.fertilizerType}
          onChange={(e) => handleChange('fertilizerType', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.fertilizerType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="">Select Fertilizer Type</option>
          {FERTILIZER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.fertilizerType && <p className="mt-1 text-sm text-red-600">{errors.fertilizerType}</p>}
      </div>

      {/* Stock and Price Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="stockQuantityLiters" className="block text-sm font-semibold text-gray-700 mb-2">
            Stock Quantity (Liters) <span className="text-green-600">*</span>
          </label>
          <input
            type="number"
            id="stockQuantityLiters"
            min="0"
            value={formData.stockQuantityLiters}
            onChange={(e) => handleChange('stockQuantityLiters', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.stockQuantityLiters ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.stockQuantityLiters && <p className="mt-1 text-sm text-red-600">{errors.stockQuantityLiters}</p>}
        </div>

        <div>
          <label htmlFor="pricePerLiter" className="block text-sm font-semibold text-gray-700 mb-2">
            Price Per Liter (LKR) <span className="text-green-600">*</span>
          </label>
          <input
            type="number"
            id="pricePerLiter"
            min="0"
            step="0.01"
            value={formData.pricePerLiter}
            onChange={(e) => handleChange('pricePerLiter', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.pricePerLiter ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.pricePerLiter && <p className="mt-1 text-sm text-red-600">{errors.pricePerLiter}</p>}
        </div>
      </div>

      {/* Username Input */}
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
          Username <span className="text-green-600">*</span>
        </label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
      </div>

      {/* PASSWORD FIELD REMOVED */}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {fertilizerSupplier ? 'Update Fertilizer Supplier' : 'Add Fertilizer Supplier'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}