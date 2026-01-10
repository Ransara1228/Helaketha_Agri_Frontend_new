import { Farmer, FarmerFormData } from '@/types/farmer';

// Use Next.js API routes as proxy to avoid CORS issues
// If you want to call backend directly, change this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY !== 'false' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');

export const farmerApi = {
  // Get all farmers
  getAll: async (): Promise<Farmer[]> => {
    const response = await fetch(`${API_BASE_URL}/farmers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch farmers: ${response.statusText}`);
    }

    return response.json();
  },

  // Get farmer by ID
  getById: async (id: number): Promise<Farmer> => {
    const response = await fetch(`${API_BASE_URL}/farmers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch farmer: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new farmer
  create: async (farmer: FarmerFormData): Promise<Farmer> => {
    const response = await fetch(`${API_BASE_URL}/farmers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farmer),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Failed to create farmer: ${response.statusText}`);
    }

    return response.json();
  },

  // Update farmer
  update: async (id: number, farmer: FarmerFormData): Promise<Farmer> => {
    const response = await fetch(`${API_BASE_URL}/farmers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farmer),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Failed to update farmer: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete farmer
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/farmers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete farmer: ${response.statusText}`);
    }
  },
};

