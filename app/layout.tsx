import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/context/app-providers";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Electronics",
  description: "Consumer electronics and home appliances, delivered across Pakistan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", plusJakartaSans.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
