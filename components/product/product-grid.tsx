import type { ReactNode } from "react";

// Responsive grid layout wrapper for arranging ProductCards (2-4 columns by screen size).
export function ProductGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}