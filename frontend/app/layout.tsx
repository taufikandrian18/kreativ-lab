import type { Metadata } from "next";
// Spec §5: both faces self-hosted as subset woff2, font-display: swap, no Google Fonts
// network request. `latin-400.css` declares font-family 'Anton'; `wght.css` declares
// font-family 'Archivo Variable' across weight 100-900 with per-subset unicode-range,
// so the browser fetches only the ranges a page actually uses.
// Spec §5 requires both faces preloaded. @fontsource ships plain CSS imports, which
// Next does not preload the way it does next/font — the woff2 would only be discovered
// once its stylesheet had parsed, and `swap` would show a system grotesque on the
// display lockup first. Importing the binaries puts them in the module graph, which is
// what gives the preload links below the hashed URL the browser will actually request.
// A side-effect-only import is not enough — verified against .next/server/app/index.html,
// where it produced no preload at all.
import antonLatin from "@fontsource/anton/files/anton-latin-400-normal.woff2";
import archivoLatin from "@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2";
// The width axis ships under the same family name as the weight-only cut above, so
// importing its CSS would put two 'Archivo Variable' faces in competition and the
// browser would pick whichever it read last. The wide cut is registered under its own
// name instead, from the same hashed file URL the preloads use. It only ever sets the
// one or two swapped letters in a headline (lib/swap-letters.ts), so it is not preloaded.
import archivoWide from "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2";
import "@fontsource/anton/latin-400.css";
import "@fontsource-variable/archivo/wght.css";
import "./globals.css";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { MotionProvider } from "@/components/motion/MotionProvider";
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
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preload" as="font" type="font/woff2" href={antonLatin} crossOrigin="anonymous" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={archivoLatin}
          crossOrigin="anonymous"
        />
        <style>{`@font-face{font-family:'Archivo Wide';font-style:normal;font-display:swap;font-weight:100 900;font-stretch:62% 125%;src:url(${archivoWide}) format('woff2-variations')}`}</style>
        {/* The hero's letters are hidden until GSAP builds them (globals.css). With JS
            off nothing will, so they are shown at once rather than after the failsafe. */}
        <noscript>
          <style>{'[data-split-char]{opacity:1!important;animation:none!important}'}</style>
        </noscript>
      </head>
      <body>
        <SiteHeader />
        <MotionProvider>
          {children}
          <SiteFooter />
        </MotionProvider>
      </body>
    </html>
  );
}
