import { notFound } from "next/navigation";
import { CouponForm } from "@/components/admin/coupons/coupon-form";
import { getCouponByIdForAdmin } from "@/lib/admin/coupons";

export default async function AdminEditCouponPage({ params }: PageProps<"/admin/coupons/[id]">) {
  const { id } = await params;
  const coupon = await getCouponByIdForAdmin(id);
  if (!coupon) notFound();

  return <CouponForm coupon={coupon} />;
}
