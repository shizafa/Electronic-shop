"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { setCouponActive } from "@/lib/actions/admin/coupons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminCoupon } from "@/lib/admin/coupons";
import { formatExpiryDate } from "@/lib/coupon-dates";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";

interface CouponsTableProps {
  coupons: AdminCoupon[];
}

export function CouponsTable({ coupons: initialCoupons }: CouponsTableProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  function setLocalActive(id: string, isActive: boolean) {
    setCoupons((current) => current.map((coupon) => (coupon.id === id ? { ...coupon, isActive } : coupon)));
  }

  // Optimistic: flips immediately, reverts if the save fails.
  async function handleToggleActive(id: string, isActive: boolean) {
    setLocalActive(id, isActive);
    setPendingIds((current) => new Set(current).add(id));

    const result = await setCouponActive(id, isActive);

    setPendingIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    if (result.success) {
      toast.success(t(isActive ? "admin.coupons.couponActivated" : "admin.coupons.couponDeactivated"));
    } else {
      setLocalActive(id, !isActive);
      toast.error(result.error);
    }
  }

  if (coupons.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.coupons.noCoupons")}</p>;
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.coupons.code")}</TableHead>
            <TableHead>{t("admin.coupons.type")}</TableHead>
            <TableHead>{t("admin.coupons.value")}</TableHead>
            <TableHead>{t("admin.coupons.usage")}</TableHead>
            <TableHead>{t("admin.coupons.expiry")}</TableHead>
            <TableHead>{t("admin.coupons.active")}</TableHead>
            <TableHead className="text-end">{t("admin.products.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>
                <Link href={`/admin/coupons/${coupon.id}`} className="font-mono font-medium hover:underline">
                  {coupon.code}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(coupon.type === "percent" ? "admin.coupons.typePercent" : "admin.coupons.typeFlat")}
                </Badge>
              </TableCell>
              <TableCell>{coupon.type === "percent" ? `${coupon.value}%` : formatPrice(coupon.value)}</TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {coupon.usedCount} / {coupon.usageLimit ?? t("admin.coupons.unlimited")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {coupon.expiresAt ? (
                  <span className="flex items-center gap-2">
                    {formatExpiryDate(coupon.expiresAt)}
                    {coupon.isExpired && <Badge variant="destructive">{t("admin.coupons.expired")}</Badge>}
                  </span>
                ) : (
                  t("admin.coupons.noExpiry")
                )}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={coupon.isActive}
                  disabled={pendingIds.has(coupon.id)}
                  onCheckedChange={(checked) => handleToggleActive(coupon.id, checked === true)}
                  aria-label={`${t("admin.coupons.active")}: ${coupon.code}`}
                />
              </TableCell>
              <TableCell className="text-end">
                <Button variant="ghost" size="icon-sm" asChild aria-label={t("admin.products.edit")}>
                  <Link href={`/admin/coupons/${coupon.id}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
