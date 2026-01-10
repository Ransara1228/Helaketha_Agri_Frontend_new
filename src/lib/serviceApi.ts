import { Service, ServiceFormData } from '@/types/service';

// Use Next.js API routes as proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY !== 'false' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');

export const serviceApi = {
  // Get all services
  getAll: async (): Promise<Service[]> => {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch services: ${response.statusText}`);
    }

    return response.json();
  },

  // Get service by ID
  getById: async (id: number): Promise<Service> => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch service: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new service
  create: async (service: ServiceFormData): Promise<Service> => {
    // Ensure data types are correct and validate
    if (!service.farmerId || service.farmerId <= 0) {
      throw new Error('Farmer ID must be greater than 0');
    }
    if (!service.serviceType || !service.serviceType.trim()) {
      throw new Error('Service type is required');
    }
    if (!service.providerId || service.providerId <= 0) {
      throw new Error('Provider ID must be greater than 0');
    }
    if (!service.bookingDate || !service.bookingDate.trim()) {
      throw new Error('Booking date is required');
    }
    if (!service.bookingTime || !service.bookingTime.trim()) {
      throw new Error('Booking time is required');
    }
    if (service.totalCost < 0) {
      throw new Error('Total cost cannot be negative');
    }
    if (!service.status || !service.status.trim()) {
      throw new Error('Status is required');
    }

    // Format time to HH:mm:ss format (add seconds if missing)
    let formattedTime = service.bookingTime.trim();
    if (formattedTime && formattedTime.match(/^\d{2}:\d{2}$/)) {
      formattedTime = formattedTime + ':00';
    }

    const requestBody = {
      farmerId: Number(service.farmerId),
      serviceType: service.serviceType.trim(),
      providerId: Number(service.providerId),
      bookingDate: service.bookingDate.trim(),
      bookingTime: formattedTime,
      totalCost: Number(service.totalCost),
      status: service.status.trim(),
    };
    
    const response = await fetch(`${API_BASE_URL}/services`, {
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
        errorData = { message: responseText || 'Failed to create service' };
      }
      
      // Extract detailed error message
      let errorMessage = errorData.message || errorData.error || `Failed to create service: ${response.statusText}`;
      
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

  // Update service
  update: async (id: number, service: ServiceFormData): Promise<Service> => {
    // Format time to HH:mm:ss format (add seconds if missing)
    let formattedTime = service.bookingTime.trim();
    if (formattedTime && formattedTime.match(/^\d{2}:\d{2}$/)) {
      formattedTime = formattedTime + ':00';
    }

    // Ensure data types are correct
    const requestBody = {
      farmerId: Number(service.farmerId),
      serviceType: service.serviceType.trim(),
      providerId: Number(service.providerId),
      bookingDate: service.bookingDate.trim(),
      bookingTime: formattedTime,
      totalCost: Number(service.totalCost),
      status: service.status.trim(),
    };
    
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
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
        errorData = { message: responseText || 'Failed to update service' };
      }
      
      let errorMessage = errorData.message || errorData.error || `Failed to update service: ${response.statusText}`;
      
      if (errorData.details || errorData.validationErrors) {
        const details = errorData.details || errorData.validationErrors;
        if (Array.isArray(details)) {
          errorMessage += ` - ${details.join(', ')}`;
        } else if (typeof details === 'object') {
          const detailsArray = Object.entries(details).map(([key, value]) => `${key}: ${value}`);
          errorMessage += ` - ${detailsArray.join(', ')}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Delete service
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete service: ${response.statusText}`);
    }
  },
};

