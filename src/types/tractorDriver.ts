export interface TractorDriver {
  tractorDriverId?: number;
  name: string;
  phone: string;
  email: string; // Added email
  machineQuantity: number;
  pricePerAcre: number;
  username: string;
  // password removed (backend handles it)
}

export interface TractorDriverFormData {
  name: string;
  phone: string;
  email: string; // Added email
  machineQuantity: number;
  pricePerAcre: number;
  username: string;
  // password removed
}