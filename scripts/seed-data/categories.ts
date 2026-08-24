import { airConditionerSpecs } from "./specs/air-conditioners";
import { mobilePhoneSpecs } from "./specs/mobile-phones";
import { televisionSpecs } from "./specs/televisions";
import type { Category } from "@/types/category";

// The three product categories the shop sells; drives nav, filters, and category pages.
// Admins can add more from /admin/categories — these are just the starting fixtures.
export const categories: Category[] = [
  {
    id: "air-conditioners",
    slug: "air-conditioners",
    name: "Air Conditioners",
    description: "Split and inverter ACs to keep every room cool, with free installation booking at checkout.",
    thumbnailUrl: null,
    bannerUrl: null,
    isActive: true,
    displayOrder: 0,
    installationRequired: true, // shows installation notice/scheduling at checkout
    specFields: airConditionerSpecs, // spec definitions used to build filters/compare tables
  },
  {
    id: "televisions",
    slug: "televisions",
    name: "Televisions",
    description: "Smart, LED, and 4K televisions from the brands you know, in every screen size.",
    thumbnailUrl: null,
    bannerUrl: null,
    isActive: true,
    displayOrder: 1,
    installationRequired: false,
    specFields: televisionSpecs,
  },
  {
    id: "mobile-phones",
    slug: "mobile-phones",
    name: "Mobile Phones",
    description: "The latest smartphones, with the storage, camera, and battery options to match.",
    thumbnailUrl: null,
    bannerUrl: null,
    isActive: true,
    displayOrder: 2,
    installationRequired: false,
    specFields: mobilePhoneSpecs,
  },
];
