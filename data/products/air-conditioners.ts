import type { Product } from "@/types/product";

// Mock air conditioner catalog: product listing, PDP, filters, and cart all read from this.
// Tonnage is the only variant axis (room-size options) for ACs; shared across all products below.
const tonnageAxis = { id: "tonnage", labelKey: "axis.tonnage.label", unit: "Ton" };

export const airConditionerProducts: Product[] = [
  {
    id: "ac-haier-hsu18",
    slug: "haier-inverter-ac-hsu18",
    categoryId: "air-conditioners",
    name: "Haier Inverter AC HSU-18",
    brand: "Haier",
    description:
      "Energy-efficient inverter air conditioner with fast cooling and whisper-quiet operation, built for Pakistani summers.",
    images: [
      "https://images.unsplash.com/photo-1757219525975-03b5984bc6e8?w=800&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1759772238012-9d5ad59ae637?w=800&h=800&fit=crop&auto=format&q=80",
    ],
    specs: {
      // shape defined by data/specs/air-conditioners.ts; used for spec table + compare
      energyRating: "5 Star",
      compressorType: "Inverter",
      refrigerantType: "R32",
      noiseLevel: 38,
      warrantyYears: 10,
      wifiEnabled: true,
    },
    variantAxes: [tonnageAxis],
    featured: true, // shown in "featured"/home page sections
    variants: [
      {
        id: "ac-haier-hsu18-1.0",
        productId: "ac-haier-hsu18",
        sku: "AC-HAI-HSU18-1.0T",
        axisValues: { tonnage: "1.0" }, // maps this variant to a value of each variantAxes entry
        price: 98000,
        compareAtPrice: 108000, // original price shown struck-through when set
        stock: 22,
      },
      {
        id: "ac-haier-hsu18-1.5",
        productId: "ac-haier-hsu18",
        sku: "AC-HAI-HSU18-1.5T",
        axisValues: { tonnage: "1.5" },
        price: 138000,
        compareAtPrice: 150000,
        stock: 15,
      },
    ],
  },
  {
    id: "ac-gree-pular",
    slug: "gree-pular-inverter-ac",
    categoryId: "air-conditioners",
    name: "Gree Pular Series Inverter AC",
    brand: "Gree",
    description:
      "Powerful cooling with a durable inverter compressor, designed for larger rooms and heavy daily use.",
    images: [
      "https://images.unsplash.com/photo-1759772238012-9d5ad59ae637?w=800&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1762341123870-d706f257a12e?w=800&h=800&fit=crop&auto=format&q=80",
    ],
    specs: {
      energyRating: "5 Star",
      compressorType: "Inverter",
      refrigerantType: "R32",
      noiseLevel: 40,
      warrantyYears: 5,
      wifiEnabled: true,
    },
    variantAxes: [tonnageAxis],
    featured: true,
    variants: [
      {
        id: "ac-gree-pular-1.5",
        productId: "ac-gree-pular",
        sku: "AC-GRE-PULAR-1.5T",
        axisValues: { tonnage: "1.5" },
        price: 145000,
        stock: 18,
      },
      {
        id: "ac-gree-pular-2.0",
        productId: "ac-gree-pular",
        sku: "AC-GRE-PULAR-2.0T",
        axisValues: { tonnage: "2.0" },
        price: 205000,
        stock: 9,
      },
    ],
  },
  {
    id: "ac-dawlance-powercon",
    slug: "dawlance-powercon-plus-ac",
    categoryId: "air-conditioners",
    name: "Dawlance Powercon+ AC",
    brand: "Dawlance",
    description:
      "Reliable everyday air conditioning at an accessible price point, with sturdy build quality.",
    images: [
      "https://images.unsplash.com/photo-1762341123870-d706f257a12e?w=800&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1757219525975-03b5984bc6e8?w=800&h=800&fit=crop&auto=format&q=80",
    ],
    specs: {
      energyRating: "4 Star",
      compressorType: "Non-Inverter",
      refrigerantType: "R22",
      noiseLevel: 45,
      warrantyYears: 3,
      wifiEnabled: false,
    },
    variantAxes: [tonnageAxis],
    variants: [
      {
        id: "ac-dawlance-powercon-1.0",
        productId: "ac-dawlance-powercon",
        sku: "AC-DAW-PWRCON-1.0T",
        axisValues: { tonnage: "1.0" },
        price: 82000,
        stock: 30,
      },
      {
        id: "ac-dawlance-powercon-1.5",
        productId: "ac-dawlance-powercon",
        sku: "AC-DAW-PWRCON-1.5T",
        axisValues: { tonnage: "1.5" },
        price: 112000,
        stock: 0,
      },
    ],
  },
  {
    id: "ac-orient-ultron-x",
    slug: "orient-ultron-x-ac",
    categoryId: "air-conditioners",
    name: "Orient Ultron X AC",
    brand: "Orient",
    description:
      "Premium inverter AC with rapid cooling mode and a sleek indoor unit design.",
    images: [
      "https://images.unsplash.com/photo-1757219525975-03b5984bc6e8?w=800&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1759772238012-9d5ad59ae637?w=800&h=800&fit=crop&auto=format&q=80",
    ],
    specs: {
      energyRating: "5 Star",
      compressorType: "Inverter",
      refrigerantType: "R32",
      noiseLevel: 36,
      warrantyYears: 7,
      wifiEnabled: true,
    },
    variantAxes: [tonnageAxis],
    featured: true,
    variants: [
      {
        id: "ac-orient-ultron-x-1.5",
        productId: "ac-orient-ultron-x",
        sku: "AC-ORI-ULTRONX-1.5T",
        axisValues: { tonnage: "1.5" },
        price: 156000,
        compareAtPrice: 168000,
        stock: 12,
      },
      {
        id: "ac-orient-ultron-x-2.0",
        productId: "ac-orient-ultron-x",
        sku: "AC-ORI-ULTRONX-2.0T",
        axisValues: { tonnage: "2.0" },
        price: 218000,
        compareAtPrice: 232000,
        stock: 7,
      },
    ],
  },
  {
    id: "ac-pel-inverteron",
    slug: "pel-inverteron-ac",
    categoryId: "air-conditioners",
    name: "PEL InverterOn AC",
    brand: "PEL",
    description:
      "Versatile inverter AC lineup available across multiple room sizes, with consistent year-round performance.",
    images: [
      "https://images.unsplash.com/photo-1759772238012-9d5ad59ae637?w=800&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1762341123870-d706f257a12e?w=800&h=800&fit=crop&auto=format&q=80",
    ],
    specs: {
      energyRating: "4 Star",
      compressorType: "Inverter",
      refrigerantType: "R410A",
      noiseLevel: 39,
      warrantyYears: 5,
      wifiEnabled: false,
    },
    variantAxes: [tonnageAxis],
    variants: [
      {
        id: "ac-pel-inverteron-1.0",
        productId: "ac-pel-inverteron",
        sku: "AC-PEL-INVON-1.0T",
        axisValues: { tonnage: "1.0" },
        price: 95000,
        stock: 25,
      },
      {
        id: "ac-pel-inverteron-1.5",
        productId: "ac-pel-inverteron",
        sku: "AC-PEL-INVON-1.5T",
        axisValues: { tonnage: "1.5" },
        price: 132000,
        stock: 19,
      },
      {
        id: "ac-pel-inverteron-2.0",
        productId: "ac-pel-inverteron",
        sku: "AC-PEL-INVON-2.0T",
        axisValues: { tonnage: "2.0" },
        price: 192000,
        stock: 4,
      },
    ],
  },
  {
    id: "ac-kenwood-eicon",
    slug: "kenwood-eicon-series-ac",
    categoryId: "air-conditioners",
    name: "Kenwood eICON Series AC",
    brand: "Kenwood",
    description:
      "Top-tier inverter AC with the lowest noise level in its class and a 10-year compressor warranty.",
    images: [
      "https://images.unsplash.com/photo-1762341123870-d706f257a12e?w=800&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1757219525975-03b5984bc6e8?w=800&h=800&fit=crop&auto=format&q=80",
    ],
    specs: {
      energyRating: "5 Star",
      compressorType: "Inverter",
      refrigerantType: "R32",
      noiseLevel: 35,
      warrantyYears: 10,
      wifiEnabled: true,
    },
    variantAxes: [tonnageAxis],
    variants: [
      {
        id: "ac-kenwood-eicon-1.5",
        productId: "ac-kenwood-eicon",
        sku: "AC-KEN-EICON-1.5T",
        axisValues: { tonnage: "1.5" },
        price: 168000,
        stock: 11,
      },
    ],
  },
];