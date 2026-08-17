import { airConditionerSpecs } from "@/data/specs/air-conditioners";
import { mobilePhoneSpecs } from "@/data/specs/mobile-phones";
import { televisionSpecs } from "@/data/specs/televisions";
import type { Category } from "@/types/category";

export const categories: Category[] = [
  {
    id: "air-conditioners",
    slug: "air-conditioners",
    nameKey: "category.airConditioners.name",
    installationRequired: true,
    specFields: airConditionerSpecs,
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