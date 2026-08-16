export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}
