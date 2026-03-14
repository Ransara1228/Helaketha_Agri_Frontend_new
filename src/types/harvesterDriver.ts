export interface HarvesterDriver {
  harvesterDriverId?: number;
  name: string;
  phone: string;
  email: string; // Added email
  availableMachines: number;
  pricePerAcre: number;
  username: string;
  // password removed (backend handles it)
}

export interface HarvesterDriverFormData {
  name: string;
  phone: string;
  email: string; // Added email
  availableMachines: number;
  pricePerAcre: number;
  username: string;
  // password removed
}