import { HarvesterDriver, HarvesterDriverFormData } from '@/types/harvesterDriver';

// Use Next.js API routes as proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY !== 'false' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');

export const harvesterDriverApi = {
  // Get all harvester drivers
  getAll: async (): Promise<HarvesterDriver[]> => {
    const response = await fetch(`${API_BASE_URL}/harvester-drivers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch harvester drivers: ${response.statusText}`);
    }

    return response.json();
  },

  // Get harvester driver by ID
  getById: async (id: number): Promise<HarvesterDriver> => {
    const response = await fetch(`${API_BASE_URL}/harvester-drivers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch harvester driver: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new harvester driver
  create: async (harvesterDriver: HarvesterDriverFormData): Promise<HarvesterDriver> => {
    const response = await fetch(`${API_BASE_URL}/harvester-drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(harvesterDriver),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Updated to display specific backend messages (e.g. "User name already exists")
      const errorMessage = errorData.message || errorData.error || `Failed to create harvester driver: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Update harvester driver
  update: async (id: number, harvesterDriver: HarvesterDriverFormData): Promise<HarvesterDriver> => {
    const response = await fetch(`${API_BASE_URL}/harvester-drivers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(harvesterDriver),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Failed to update harvester driver: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete harvester driver
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/harvester-drivers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete harvester driver: ${response.statusText}`);
    }
  },
};