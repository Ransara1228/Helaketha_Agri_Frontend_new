'use client';

import { useState, FormEvent } from 'react';
import { Service, ServiceFormData } from '@/types/service';

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SERVICE_TYPES = [
  'TRACTOR',
  'HARVESTER',
  'FERTILIZER'
];

const STATUS_OPTIONS = [
  'Pending',
  'Accepted',
  'Completed',
];

export default function ServiceForm({ service, onSubmit, onCancel, isLoading }: ServiceFormProps) {
  // Format time from HH:mm:ss to HH:mm for the input field
  const formatTimeForInput = (time: string | undefined): string => {
    if (!time) return '';
    // If time is in HH:mm:ss format, remove seconds for the input
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time.substring(0, 5); // Return HH:mm
    }
    return time;
  };

  const [formData, setFormData] = useState<ServiceFormData>({
    farmerId: service?.farmerId || 0,
    serviceType: service?.serviceType || '',
    providerId: service?.providerId || 0,
    bookingDate: service?.bookingDate || '',
    bookingTime: formatTimeForInput(service?.bookingTime),
    totalCost: service?.totalCost || 0,
    status: service?.status || 'Pending',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};

    if (formData.farmerId <= 0) {
      newErrors.farmerId = 'Farmer ID must be greater than 0';
    }
    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'Service type is required';
    }
    if (formData.providerId <= 0) {
      newErrors.providerId = 'Provider ID must be greater than 0';
    }
    if (!formData.bookingDate.trim()) {
      newErrors.bookingDate = 'Booking date is required';
    }
    if (!formData.bookingTime.trim()) {
      newErrors.bookingTime = 'Booking time is required';
    }
    if (formData.totalCost < 0) {
      newErrors.totalCost = 'Total cost cannot be negative';
    }
    if (!formData.status.trim()) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Format time to HH:mm:ss format (add seconds if missing)
        let formattedTime = formData.bookingTime.trim();
        // If time is in HH:mm format, convert to HH:mm:ss
        if (formattedTime && formattedTime.match(/^\d{2}:\d{2}$/)) {
          formattedTime = formattedTime + ':00';
        }
        
        // Ensure data types are correct before submission
        const submitData: ServiceFormData = {
          farmerId: Number(formData.farmerId),
          serviceType: formData.serviceType.trim(),
          providerId: Number(formData.providerId),
          bookingDate: formData.bookingDate.trim(),
          bookingTime: formattedTime,
          totalCost: Number(formData.totalCost),
          status: formData.status.trim(),
        };
        await onSubmit(submitData);
      } catch (error) {
        console.error('Error submitting form:', error);
        // Error is handled by parent component
      }
    }
  };

  const handleChange = (field: keyof ServiceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="farmerId" className="block text-sm font-semibold text-gray-700 mb-2">
          Farmer ID <span className="text-green-600">*</span>
        </label>
        <input
          type="number"
          id="farmerId"
          min="1"
          value={formData.farmerId}
          onChange={(e) => handleChange('farmerId', parseInt(e.target.value) || 0)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.farmerId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.farmerId && <p className="mt-1 text-sm text-red-600">{errors.farmerId}</p>}
      </div>

      <div>
        <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-2">
          Service Type <span className="text-green-600">*</span>
        </label>
        <select
          id="serviceType"
          value={formData.serviceType}
          onChange={(e) => handleChange('serviceType', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
            errors.serviceType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="">Select Service Type</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
            </option>
          ))}
        </select>
        {errors.serviceType && <p className="mt-1 text-sm text-red-600">{errors.serviceType}</p>}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="bookingDate" className="block text-sm font-semibold text-gray-700 mb-2">
            Booking Date <span className="text-green-600">*</span>
          </label>
          <input
            type="date"
            id="bookingDate"
            value={formData.bookingDate}
            onChange={(e) => handleChange('bookingDate', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.bookingDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.bookingDate && <p className="mt-1 text-sm text-red-600">{errors.bookingDate}</p>}
        </div>

        <div>
          <label htmlFor="bookingTime" className="block text-sm font-semibold text-gray-700 mb-2">
            Booking Time <span className="text-green-600">*</span>
          </label>
          <input
            type="time"
            id="bookingTime"
            value={formData.bookingTime}
            onChange={(e) => handleChange('bookingTime', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.bookingTime ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.bookingTime && <p className="mt-1 text-sm text-red-600">{errors.bookingTime}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="totalCost" className="block text-sm font-semibold text-gray-700 mb-2">
            Total Cost <span className="text-green-600">*</span>
          </label>
          <input
            type="number"
            id="totalCost"
            min="0"
            step="0.01"
            value={formData.totalCost}
            onChange={(e) => handleChange('totalCost', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.totalCost ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            disabled={isLoading}
          />
          {errors.totalCost && <p className="mt-1 text-sm text-red-600">{errors.totalCost}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
            Status <span className="text-green-600">*</span>
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
              errors.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
        </div>
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
              {service ? 'Update Service' : 'Add Service'}
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

