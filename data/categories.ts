import { airConditionerSpecs } from "@/data/specs/air-conditioners";
import { mobilePhoneSpecs } from "@/data/specs/mobile-phones";
import { televisionSpecs } from "@/data/specs/televisions";
import type { Category } from "@/types/category";

// The three product categories the shop sells; drives nav, filters, and category pages.
export const categories: Category[] = [
  {
    id: "air-conditioners",
    slug: "air-conditioners",
    nameKey: "category.airConditioners.name", // key into the i18n strings dictionary
    installationRequired: true, // shows installation notice/scheduling at checkout
    specFields: airConditionerSpecs, // spec definitions used to build filters/compare tables
  },
  {
    id: "televisions",
    slug: "televisions",
    nameKey: "category.televisions.name",
    installationRequired: false,
    specFields: televisionSpecs,
  },
  {
    id: "mobile-phones",
    slug: "mobile-phones",
    nameKey: "category.mobilePhones.name",
    installationRequired: false,
    specFields: mobilePhoneSpecs,
  },
];