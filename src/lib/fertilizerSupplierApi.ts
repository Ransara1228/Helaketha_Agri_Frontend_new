import { FertilizerSupplier, FertilizerSupplierFormData } from '@/types/fertilizerSupplier';

// Use Next.js API routes as proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY !== 'false' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');

export const fertilizerSupplierApi = {
  // Get all fertilizer suppliers
  getAll: async (): Promise<FertilizerSupplier[]> => {
    const response = await fetch(`${API_BASE_URL}/fertilizer-suppliers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch fertilizer suppliers: ${response.statusText}`);
    }

    return response.json();
  },

  // Get fertilizer supplier by ID
  getById: async (id: number): Promise<FertilizerSupplier> => {
    const response = await fetch(`${API_BASE_URL}/fertilizer-suppliers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch fertilizer supplier: ${response.statusText}`);
    }

    return response.json();
  },

  // Create new fertilizer supplier
  create: async (fertilizerSupplier: FertilizerSupplierFormData): Promise<FertilizerSupplier> => {
    const response = await fetch(`${API_BASE_URL}/fertilizer-suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fertilizerSupplier),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Failed to create fertilizer supplier: ${response.statusText}`);
    }

    return response.json();
  },

  // Update fertilizer supplier
  update: async (id: number, fertilizerSupplier: FertilizerSupplierFormData): Promise<FertilizerSupplier> => {
    const response = await fetch(`${API_BASE_URL}/fertilizer-suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fertilizerSupplier),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Failed to update fertilizer supplier: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete fertilizer supplier
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/fertilizer-suppliers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete fertilizer supplier: ${response.statusText}`);
    }
  },
};

