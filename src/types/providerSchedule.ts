export interface ProviderSchedule {
  scheduleId?: number;
  providerType: string;
  providerId: number;
  availableDate: string;
  isBooked: boolean;
}

export interface ProviderScheduleFormData {
  providerType: string;
  providerId: number;
  availableDate: string;
  isBooked: boolean;
}

