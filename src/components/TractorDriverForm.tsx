'use client';

import { useState, FormEvent } from 'react';
import { TractorDriver, TractorDriverFormData } from '@/types/tractorDriver';

interface TractorDriverFormProps {
  tractorDriver?: TractorDriver;
  onSubmit: (data: TractorDriverFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TractorDriverForm({ tractorDriver, onSubmit, onCancel, isLoading }: TractorDriverFormProps) {
  const [formData, setFormData] = useState<TractorDriverFormData>({
    name: tractorDriver?.name || '',
    phone: tractorDriver?.phone || '',
    machineQuantity: tractorDriver?.machineQuantity || 0,
    pricePerAcre: tractorDriver?.pricePerAcre || 0,
    username: tractorDriver?.username || '',
    password: tractorDriver?.password || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TractorDriverFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TractorDriverFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.machineQuantity <= 0) {
      newErrors.machineQuantity = 'Machine quantity must be greater than 0';
    }
    if (formData.pricePerAcre <= 0) {
      newErrors.pricePerAcre = 'Price per acre must be greater than 0';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

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

  const handleChange = (field: keyof TractorDriverFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Name <span className="text-green-600">*</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="machineQuantity" className="block text-sm font-semibold text-gray-700 mb-2">
            Machine Quantity <span className="text-green-600">*</span>
          </label>
          <input
            type="number"
            id="machineQuantity"
            min="1"
            value={formData.machineQuantity}
            onChange={(e) => handleChange('machineQuantity', parseInt(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.machineQuantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.machineQuantity && <p className="mt-1 text-sm text-red-600">{errors.machineQuantity}</p>}
        </div>

        <div>
          <label htmlFor="pricePerAcre" className="block text-sm font-semibold text-gray-700 mb-2">
            Price Per Acre (LKR) <span className="text-green-600">*</span>
          </label>
          <input
            type="number"
            id="pricePerAcre"
            min="0"
            step="0.01"
            value={formData.pricePerAcre}
            onChange={(e) => handleChange('pricePerAcre', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.pricePerAcre ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.pricePerAcre && <p className="mt-1 text-sm text-red-600">{errors.pricePerAcre}</p>}
        </div>
      </div>

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

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
          Password <span className="text-green-600">*</span>
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

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
              {tractorDriver ? 'Update Tractor Driver' : 'Add Tractor Driver'}
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

