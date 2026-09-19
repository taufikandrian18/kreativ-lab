import type { Metadata } from "next";
// Spec §5: both faces self-hosted as subset woff2, font-display: swap, no Google Fonts
// network request. `latin-400.css` declares font-family 'Anton'; `wght.css` declares
// font-family 'Archivo Variable' across weight 100-900 with per-subset unicode-range,
// so the browser fetches only the ranges a page actually uses.
import "@fontsource/anton/latin-400.css";
import "@fontsource-variable/archivo/wght.css";
import "./globals.css";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";

export const metadata: Metadata = {
  title: "Kreative Studio Lab",
  description: "Clean in form. Sharp in function.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
