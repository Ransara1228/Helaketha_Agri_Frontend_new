'use client';

import { useState, FormEvent } from 'react';
import { ProviderSchedule, ProviderScheduleFormData } from '@/types/providerSchedule';

interface ProviderScheduleFormProps {
  providerSchedule?: ProviderSchedule;
  onSubmit: (data: ProviderScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PROVIDER_TYPES = [
  'TRACTOR',
  'HARVESTER',
  'FERTILIZER'
];

export default function ProviderScheduleForm({ providerSchedule, onSubmit, onCancel, isLoading }: ProviderScheduleFormProps) {
  const [formData, setFormData] = useState<ProviderScheduleFormData>({
    providerType: providerSchedule?.providerType || '',
    providerId: providerSchedule?.providerId || 0,
    availableDate: providerSchedule?.availableDate || '',
    isBooked: providerSchedule?.isBooked || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProviderScheduleFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProviderScheduleFormData, string>> = {};

    if (!formData.providerType.trim()) {
      newErrors.providerType = 'Provider type is required';
    }
    if (formData.providerId <= 0) {
      newErrors.providerId = 'Provider ID must be greater than 0';
    }
    if (!formData.availableDate.trim()) {
      newErrors.availableDate = 'Available date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Ensure data types are correct before submission
        const submitData: ProviderScheduleFormData = {
          providerType: formData.providerType.trim(),
          providerId: Number(formData.providerId),
          availableDate: formData.availableDate.trim(),
          isBooked: Boolean(formData.isBooked),
        };
        await onSubmit(submitData);
      } catch (error) {
        console.error('Error submitting form:', error);
        // Error is handled by parent component
      }
    }
  };

  const handleChange = (field: keyof ProviderScheduleFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="providerType" className="block text-sm font-semibold text-gray-700 mb-2">
          Provider Type <span className="text-green-600">*</span>
        </label>
        <select
          id="providerType"
          value={formData.providerType}
          onChange={(e) => handleChange('providerType', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.providerType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="">Select Provider Type</option>
          {PROVIDER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
            </option>
          ))}
        </select>
        {errors.providerType && <p className="mt-1 text-sm text-red-600">{errors.providerType}</p>}
      </div>

      <div>
        <label htmlFor="providerId" className="block text-sm font-semibold text-gray-700 mb-2">
          Provider ID <span className="text-green-600">*</span>
        </label>
        <input
          type="number"
          id="providerId"
          min="1"
          value={formData.providerId}
          onChange={(e) => handleChange('providerId', parseInt(e.target.value) || 0)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.providerId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.providerId && <p className="mt-1 text-sm text-red-600">{errors.providerId}</p>}
      </div>

      <div>
        <label htmlFor="availableDate" className="block text-sm font-semibold text-gray-700 mb-2">
          Available Date <span className="text-green-600">*</span>
        </label>
        <input
          type="date"
          id="availableDate"
          value={formData.availableDate}
          onChange={(e) => handleChange('availableDate', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.availableDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.availableDate && <p className="mt-1 text-sm text-red-600">{errors.availableDate}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isBooked"
          checked={formData.isBooked}
          onChange={(e) => handleChange('isBooked', e.target.checked)}
          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 transition-all duration-200 cursor-pointer"
          disabled={isLoading}
        />
        <label htmlFor="isBooked" className="block text-sm font-semibold text-gray-700 cursor-pointer">
          Is Booked
        </label>
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
              {providerSchedule ? 'Update Provider Schedule' : 'Add Provider Schedule'}
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

