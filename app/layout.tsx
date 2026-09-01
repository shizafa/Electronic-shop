import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/context/app-providers";
import { Toaster } from "@/components/ui/sonner";
import { getSettings } from "@/lib/settings";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.storeName,
    description: settings.tagline ?? "Consumer electronics and home appliances, delivered across Pakistan.",
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
  };
}

// Root layout shared by both the storefront (app/(site)) and the admin dashboard
// (app/admin): global providers only. Header/Footer live in app/(site)/layout.tsx
// so the admin dashboard doesn't inherit the customer-facing chrome.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", plusJakartaSans.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
