import type { User } from "@/types/user";

export const users: User[] = [
  {
    id: "user-ayesha",
    name: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    phone: "0300-1234567",
    addresses: [
      {
        id: "addr-ayesha-1",
        label: "Home",
        fullName: "Ayesha Khan",
        phone: "0300-1234567",
        city: "Lahore",
        area: "Gulberg",
        addressLine: "House 45, Block C, Gulberg III",
        isDefault: true,
      },
    ],
  },
  {
    id: "user-bilal",
    name: "Bilal Ahmed",
    email: "bilal.ahmed@example.com",
    phone: "0321-9876543",
    addresses: [
      {
        id: "addr-bilal-1",
        label: "Home",
        fullName: "Bilal Ahmed",
        phone: "0321-9876543",
        city: "Karachi",
        area: "Clifton",
        addressLine: "Flat 12B, Sea View Apartments, Block 5",
        isDefault: true,
      },
    ],
  },
];

export interface MockCredential {
  email: string;
  password: string;
  userId: string;
}

export const mockCredentials: MockCredential[] = [
  { email: "ayesha.khan@example.com", password: "password123", userId: "user-ayesha" },
  { email: "bilal.ahmed@example.com", password: "password123", userId: "user-bilal" },
];