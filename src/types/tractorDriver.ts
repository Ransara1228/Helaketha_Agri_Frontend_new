export interface TractorDriver {
  tractorDriverId?: number;
  name: string;
  phone: string;
  machineQuantity: number;
  pricePerAcre: number;
  username: string;
  password: string;
}

export interface TractorDriverFormData {
  name: string;
  phone: string;
  machineQuantity: number;
  pricePerAcre: number;
  username: string;
  password: string;
}

