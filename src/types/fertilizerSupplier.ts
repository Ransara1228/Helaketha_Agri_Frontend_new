export interface FertilizerSupplier {
  supplierId?: number;
  name: string;
  phone: string;
  fertilizerType: string;
  stockQuantityLiters: number;
  pricePerLiter: number;
  username: string;
  password: string;
}

export interface FertilizerSupplierFormData {
  name: string;
  phone: string;
  fertilizerType: string;
  stockQuantityLiters: number;
  pricePerLiter: number;
  username: string;
  password: string;
}

