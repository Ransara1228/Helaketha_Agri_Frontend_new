export interface Service {
  bookingId?: number;
  farmerId: number;
  serviceType: string;
  providerId: number;
  bookingDate: string;
  bookingTime: string;
  totalCost: number;
  status: string;
}

export interface ServiceFormData {
  farmerId: number;
  serviceType: string;
  providerId: number;
  bookingDate: string;
  bookingTime: string;
  totalCost: number;
  status: string;
}

