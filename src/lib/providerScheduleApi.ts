import { ProviderSchedule, ProviderScheduleFormData } from '@/types/providerSchedule';

// Use Next.js API routes as proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY !== 'false' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');

export const providerScheduleApi = {
  // Get all provider schedules
  getAll: async (): Promise<ProviderSchedule[]> => {
    const response = await fetch(`${API_BASE_URL}/provider-schedules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch provider schedules: ${response.statusText}`);
    }

    return response.json();
  },

  // Get provider schedule by ID
  getById: async (id: number): Promise<ProviderSchedule> => {
    const response = await fetch(`${API_BASE_URL}/provider-schedules/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch provider schedule: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new provider schedule
  create: async (providerSchedule: ProviderScheduleFormData): Promise<ProviderSchedule> => {
    // Ensure data types are correct and validate
    if (!providerSchedule.providerType || !providerSchedule.providerType.trim()) {
      throw new Error('Provider type is required');
    }
    if (!providerSchedule.providerId || providerSchedule.providerId <= 0) {
      throw new Error('Provider ID must be greater than 0');
    }
    if (!providerSchedule.availableDate || !providerSchedule.availableDate.trim()) {
      throw new Error('Available date is required');
    }

    const requestBody = {
      providerType: providerSchedule.providerType.trim(),
      providerId: Number(providerSchedule.providerId),
      availableDate: providerSchedule.availableDate.trim(),
      isBooked: Boolean(providerSchedule.isBooked),
    };
    
    const response = await fetch(`${API_BASE_URL}/provider-schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData: any = {};
      const responseText = await response.text();
      
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || 'Failed to create provider schedule' };
      }
      
      // Extract detailed error message
      let errorMessage = errorData.message || errorData.error || `Failed to create provider schedule: ${response.statusText}`;
      
      // Include validation details if available
      if (errorData.details) {
        if (Array.isArray(errorData.details)) {
          errorMessage += ` - ${errorData.details.join(', ')}`;
        } else if (typeof errorData.details === 'object') {
          const detailsArray = Object.entries(errorData.details).map(([key, value]) => `${key}: ${value}`);
          errorMessage += ` - ${detailsArray.join(', ')}`;
        } else {
          errorMessage += ` - ${JSON.stringify(errorData.details)}`;
        }
      } else if (errorData.validationErrors) {
        errorMessage += ` - ${JSON.stringify(errorData.validationErrors)}`;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Update provider schedule
  update: async (id: number, providerSchedule: ProviderScheduleFormData): Promise<ProviderSchedule> => {
    // Ensure data types are correct
    const requestBody = {
      providerType: providerSchedule.providerType,
      providerId: Number(providerSchedule.providerId),
      availableDate: providerSchedule.availableDate,
      isBooked: Boolean(providerSchedule.isBooked),
    };
    
    const response = await fetch(`${API_BASE_URL}/provider-schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `Failed to update provider schedule: ${response.statusText}`;
      
      // Include validation details if available
      if (errorData.details || errorData.validationErrors) {
        const details = errorData.details || errorData.validationErrors;
        throw new Error(`${errorMessage}${details ? ` - ${JSON.stringify(details)}` : ''}`);
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Delete provider schedule
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/provider-schedules/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete provider schedule: ${response.statusText}`);
    }
  },
};

