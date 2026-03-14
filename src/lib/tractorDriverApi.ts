import { TractorDriver, TractorDriverFormData } from '@/types/tractorDriver';

// Use Next.js API routes as proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY !== 'false' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');

export const tractorDriverApi = {
  // Get all tractor drivers
  getAll: async (): Promise<TractorDriver[]> => {
    const response = await fetch(`${API_BASE_URL}/tractor-drivers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch tractor drivers: ${response.statusText}`);
    }

    return response.json();
  },

  // Get tractor driver by ID
  getById: async (id: number): Promise<TractorDriver> => {
    const response = await fetch(`${API_BASE_URL}/tractor-drivers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch tractor driver: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new tractor driver
  create: async (tractorDriver: TractorDriverFormData): Promise<TractorDriver> => {
    const response = await fetch(`${API_BASE_URL}/tractor-drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tractorDriver),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Failed to create tractor driver: ${response.statusText}`);
    }

    return response.json();
  },

  // Update tractor driver
  update: async (id: number, tractorDriver: TractorDriverFormData): Promise<TractorDriver> => {
    const response = await fetch(`${API_BASE_URL}/tractor-drivers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tractorDriver),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Failed to update tractor driver: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete tractor driver
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tractor-drivers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete tractor driver: ${response.statusText}`);
    }
  },
};