export interface HarvesterDriver {
  harvesterDriverId?: number;
  name: string;
  phone: string;
  availableMachines: number;
  pricePerAcre: number;
  username: string;
  password: string;
}

export interface HarvesterDriverFormData {
  name: string;
  phone: string;
  availableMachines: number;
  pricePerAcre: number;
  username: string;
  password: string;
}

