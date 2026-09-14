import Link from "next/link";
import { Plus } from "lucide-react";
import { CouponsTable } from "@/components/admin/coupons/coupons-table";
import { Button } from "@/components/ui/button";
import { getAllCouponsForAdmin } from "@/lib/admin/coupons";
import { t } from "@/lib/i18n";

export default async function AdminCouponsPage() {
  const coupons = await getAllCouponsForAdmin();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="size-4" />
            {t("admin.coupons.newCoupon")}
          </Link>
        </Button>
      </div>
      <CouponsTable coupons={coupons} />
    </div>
  );
}
