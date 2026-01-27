export interface Farmer {
  farmerId?: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  nic: string;
  username: string;
  keycloakUserId?: string;
}

export interface FarmerFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  nic: string;
  username: string;
}

