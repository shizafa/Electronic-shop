import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Homepage single promo banner (static, no countdown)
export function PromoBanner() {
  return (
    <section className="container-page py-8">
      <div className="relative flex min-h-[280px] items-center overflow-hidden rounded-2xl bg-muted">
        <Image
          src="/promo/product-banner-img-03.webp"
          alt="Drone accessories bundle"
          fill
          sizes="100vw"
          className="object-cover"
        />

        <div className="relative z-10 flex max-w-md flex-col gap-3 p-8 sm:p-12">
          <p className="text-sm font-medium tracking-wide text-foreground/60 uppercase">
            Exclusive Weekend Discount
          </p>
          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-foreground sm:text-3xl">
            Feel the good shopping <span className="font-extrabold">up to 50% discount</span>
          </h2>
          <p className="text-sm text-foreground/60">Incredibly slim designs.</p>
          <div className="flex items-center gap-3">
            <del className="text-sm text-foreground/50">$295.00</del>
            <span className="text-xl font-bold text-primary">$179.98</span>
          </div>
          <Button
            className="mt-2 flex size-[84px] flex-col items-center justify-center gap-0.5 rounded-full p-0 text-xs leading-tight font-bold uppercase"
            asChild
          >
            <Link href="/search">
              <ArrowUpRight className="mb-0.5 size-3.5" />
              Shop
              <br />
              Now
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
