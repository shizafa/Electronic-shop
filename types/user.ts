// A saved delivery address in a user's account
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

// A registered user account
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  addresses: Address[];
}
