import { Service, ServiceFormData } from '@/types/service';

// Use Next.js API routes as proxy to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_USE_PROXY !== 'false' 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');

function normalizeTimeForBackend(time: string): string {
  const trimmed = (time || '').trim();
  if (!trimmed) return '';
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return trimmed;
}

function normalizeDateForBackend(date: string): string {
  const trimmed = (date || '').trim();
  if (!trimmed) return '';
  // If ISO datetime comes from backend/edit form, keep only yyyy-mm-dd
  if (trimmed.includes('T')) return trimmed.slice(0, 10);
  return trimmed;
}

function normalizeServiceTypeForBackend(serviceType: string): string {
  const normalized = (serviceType || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized.includes('TRACTOR')) return 'TRACTOR';
  if (normalized.includes('HARVESTER')) return 'HARVESTER';
  if (normalized.includes('FERTILIZER')) return 'FERTILIZER';
  return normalized;
}

function normalizeStatusForBackend(status: string): string {
  const normalized = (status || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized === 'PENDING') return 'Pending';
  if (normalized === 'ACCEPTED' || normalized === 'CONFIRMED' || normalized === 'IN_PROGRESS' || normalized === 'INPROGRESS') {
    return 'Accepted';
  }
  if (normalized === 'COMPLETED') return 'Completed';
  // Backend does not support Cancelled/Canceled; map to Pending.
  if (normalized === 'CANCELLED' || normalized === 'CANCELED') return 'Pending';
  return 'Pending';
}

function normalizeStatusTitleCase(status: string): string {
  const raw = (status || '').trim().replace(/_/g, ' ');
  if (!raw) return '';
  return raw
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildServicePayloadCandidates(service: ServiceFormData) {
  const formattedTime = normalizeTimeForBackend(service.bookingTime);
  const formattedDate = normalizeDateForBackend(service.bookingDate);
  const rawServiceType = (service.serviceType || '').trim();
  const normalizedServiceType = normalizeServiceTypeForBackend(rawServiceType);
  const rawStatus = (service.status || '').trim();
  const normalizedStatus = normalizeStatusForBackend(rawStatus);
  const titleStatus = normalizeStatusTitleCase(rawStatus);

  const base = {
    farmerId: Number(service.farmerId),
    providerId: Number(service.providerId),
    bookingDate: formattedDate,
    bookingTime: formattedTime,
    totalCost: Number(service.totalCost),
  };

  const candidates = [
    {
      ...base,
      serviceType: normalizedServiceType,
      status: normalizedStatus,
    },
    {
      ...base,
      serviceType: normalizedServiceType,
      status: titleStatus === 'Confirmed' ? 'Accepted' : titleStatus || normalizedStatus,
    },
    {
      ...base,
      serviceType: rawServiceType.toUpperCase() || normalizedServiceType,
      status: normalizedStatus,
    },
  ];

  const unique: typeof candidates = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const key = JSON.stringify(candidate);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(candidate);
    }
  }
  return unique;
}

async function parseServiceError(response: Response): Promise<string> {
  let errorData: any = {};
  const responseText = await response.text();

  try {
    errorData = JSON.parse(responseText);
  } catch {
    errorData = { message: responseText || `Request failed: ${response.status}` };
  }

  let errorMessage =
    errorData.message ||
    errorData.error ||
    `Request failed: ${response.status} ${response.statusText}`;

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
    if (Array.isArray(errorData.validationErrors)) {
      errorMessage += ` - ${errorData.validationErrors.join(', ')}`;
    } else if (typeof errorData.validationErrors === 'object') {
      const detailsArray = Object.entries(errorData.validationErrors).map(([key, value]) => `${key}: ${value}`);
      errorMessage += ` - ${detailsArray.join(', ')}`;
    } else {
      errorMessage += ` - ${JSON.stringify(errorData.validationErrors)}`;
    }
  }

  return errorMessage;
}

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

    const candidates = buildServicePayloadCandidates(service);
    let lastError = 'Failed to create service';

    for (let i = 0; i < candidates.length; i++) {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidates[i]),
      });

      if (response.ok) {
        return response.json();
      }

      lastError = await parseServiceError(response);
      const isValidationError = response.status === 400 || response.status === 422;
      if (!isValidationError || i === candidates.length - 1) {
        throw new Error(lastError);
      }
    }

    throw new Error(lastError);
  },

  // Update service
  update: async (id: number, service: ServiceFormData): Promise<Service> => {
    const candidates = buildServicePayloadCandidates(service);
    let lastError = 'Failed to update service';

    for (let i = 0; i < candidates.length; i++) {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidates[i]),
      });

      if (response.ok) {
        return response.json();
      }

      lastError = await parseServiceError(response);
      const isValidationError = response.status === 400 || response.status === 422;
      if (!isValidationError || i === candidates.length - 1) {
        throw new Error(lastError);
      }
    }

    throw new Error(lastError);
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

