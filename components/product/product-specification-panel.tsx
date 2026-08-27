import { t } from "@/lib/i18n";
import { formatSpecValue, type SpecRow } from "@/lib/specs";
import type { Product } from "@/types/product";

interface ProductSpecificationPanelProps {
  product: Product;
  specRows: SpecRow[];
}

// The template's Specification tab also had two marketing bullet-list blocks specific to
// earbuds ("Custom acoustic platform...", "Active Noise Cancelling...") and a key-value list
// using fields this app doesn't have (Alternate names, Release date, Dimensions, Weight,
// Battery capacity) — one block was even mislabeled "Brand :" despite listing acoustic
// features. Same resolution as the Description tab: the earbuds-specific bullets are dropped
// (no generalizable field backs them), and the key-value LIST STRUCTURE is kept, populated
// with product.brand + the same real specRows already used elsewhere on this page instead of
// the fake demo fields. This list suits a single product better than SpecTable anyway, which
// is a multi-column layout built for the /compare page.
export function ProductSpecificationPanel({ product, specRows }: ProductSpecificationPanelProps) {
  return (
    <div className="rbt-prd-single-specification-info">
      <div className="rbt-single-specification">
        <label className="b1 title">
          {t("common.brand")}
        </label>
        <div className="rbt-specification-content">
          <span className="desc">
            {product.brand}
          </span>
        </div>
      </div>
      {specRows.map((row) => (
        <div className="rbt-single-specification" key={row.id}>
          <label className="b1 title">
            {row.label}
          </label>
          <div className="rbt-specification-content">
            <span className="desc">
              {formatSpecValue(row.values[0])}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
