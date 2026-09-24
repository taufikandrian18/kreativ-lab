import type { Metadata } from "next";
// Two families, self-hosted, no Google Fonts request (spec §5), chosen on 2026-09-24:
//
// - Display: Archivo on its width axis. Headlines set it at its narrowest and heaviest
//   (62% / 850), which is closer to the deck's real face, Helvetica Now Condensed, than
//   Anton was; the swapped letters (lib/swap-letters.ts) set the same file at its widest
//   and lightest (125% / 200). One family carries both, so the site stays at two.
// - Body: Inter, the restrained workhorse.
//
// Both binaries are imported rather than only their CSS, because that is what puts the
// hashed URL in the module graph and lets the preload links below point at the file the
// browser will actually request — a side-effect CSS import produced no preload at all
// (verified against .next/server/app/index.html). The display face is registered by
// hand as 'Archivo Flex': @fontsource's wdth.css would declare it as 'Archivo Variable'
// with a unicode-range per subset, and only the latin file is needed.
import archivoFlex from "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2";
import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2";
import "@fontsource-variable/inter/wght.css";
import "./globals.css";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Preloader, PRELOADER_BOOT } from "@/components/chrome/Preloader";
import { MobileDock } from "@/components/chrome/MobileDock";
import { siteNav } from "@/lib/site-nav";
import { cmsImage } from "@/lib/cms-image";
import { getSiteSetting } from "@/lib/contract";
import { sitePage } from "@/lib/site-content";

// Title and description are edited under Site Pages → Global; the share image is the
// Open Graph image under Site Settings. Social networks need an absolute image URL, so the
// image is only declared when the build knows its public origin (NEXT_PUBLIC_SITE_ORIGIN,
// set by the deploy workflow).
export function generateMetadata(): Metadata {
  const global = sitePage("global");
  const og = cmsImage(getSiteSetting()?.og_image);
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.replace(/\/+$/, "");
  const title = global.text("site_title");
  const description = global.text("site_description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(og && origin
        ? { images: [{ url: `${origin}${og.src}`, width: og.width, height: og.height }] }
        : {}),
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const global = sitePage("global");
  return (
    // suppressHydrationWarning: PRELOADER_BOOT sets data-preloader on <html> before
    // React hydrates, so the server's <html> and the browser's differ by that attribute.
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOADER_BOOT }} />
        <link rel="preload" as="font" type="font/woff2" href={archivoFlex} crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/woff2" href={interLatin} crossOrigin="anonymous" />
        <style>{`@font-face{font-family:'Archivo Flex';font-style:normal;font-display:swap;font-weight:100 900;font-stretch:62% 125%;src:url(${archivoFlex}) format('woff2-variations')}`}</style>
        {/* The hero's letters are hidden until GSAP builds them (globals.css). With JS
            off nothing will, so they are shown at once rather than after the failsafe. */}
        <noscript>
          <style>{'[data-split-char]{opacity:1!important;animation:none!important}'}</style>
        </noscript>
      </head>
      <body>
        <Preloader />
        <SiteHeader />
        <MotionProvider>
          {children}
          <SiteFooter />
          {/* Room under the footer for the floating dock, so it never sits on the last
              links of the page. Phones only, like the dock. */}
          <div aria-hidden="true" className="bg-k-black h-24 lg:hidden" />
        </MotionProvider>
        <MobileDock
          nav={siteNav()}
          labels={{
            menu: global.text("dock_menu"),
            cta: global.text("dock_cta"),
            work: global.text("dock_work"),
            close: global.text("menu_close"),
          }}
        />
      </body>
    </html>
  );
}
