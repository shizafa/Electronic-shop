import fs from "node:fs";
import path from "node:path";

const BRAND_LOGO_DIR = path.join(process.cwd(), "public", "assets", "images", "brands");
const BRAND_LOGO_EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

// Upload a brand's logo to /public/assets/images/brands/{slug}.{ext}, where {slug} is the
// brand name lowercased with runs of non-alphanumeric characters collapsed to a single "-"
// (e.g. "Sony" -> "sony", "Gree" -> "gree") and {ext} is whatever format the file is in —
// webp/png/jpg/jpeg are all resolved automatically, since real uploads arrived as a mix.
export function slugifyBrand(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveBrandLogo(brand: string): string | undefined {
  const slug = slugifyBrand(brand);
  const extension = BRAND_LOGO_EXTENSIONS.find((candidate) =>
    fs.existsSync(path.join(BRAND_LOGO_DIR, `${slug}.${candidate}`))
  );
  return extension ? `/assets/images/brands/${slug}.${extension}` : undefined;
}
