export interface FertilizerSupplier {
  supplierId?: number;
  name: string;
  phone: string;
  email: string;          // <--- ADDED
  fertilizerType: string;
  stockQuantityLiters: number;
  pricePerLiter: number;
  username: string;
  // password field removed (backend handles it)
}

export interface FertilizerSupplierFormData {
  name: string;
  phone: string;
  email: string;          // <--- ADDED
  fertilizerType: string;
  stockQuantityLiters: number;
  pricePerLiter: number;
  username: string;
  // password field removed
}