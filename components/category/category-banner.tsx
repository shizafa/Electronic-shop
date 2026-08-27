import Image from "next/image";
import type { Category } from "@/types/category";

const BANNER_WIDTH = 1200;
const BANNER_HEIGHT = 400;

interface CategoryBannerProps {
  category: Category;
}

// Category page hero banner — real category.bannerUrl, uploaded via the admin panel. No
// template markup was pasted for this piece (the shop page's PromoBanner is a different,
// generic section), so this is plain next/image in a .container, not a ported section.
export function CategoryBanner({ category }: CategoryBannerProps) {
  if (!category.bannerUrl) return null;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <Image
            src={category.bannerUrl}
            alt={category.name}
            width={BANNER_WIDTH}
            height={BANNER_HEIGHT}
            className="w-100 mt--24"
            style={{ borderRadius: "8px", height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
}
