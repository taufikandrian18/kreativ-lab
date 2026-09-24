import { sitePage } from '@/lib/site-content';

/**
 * The menu, shared by header and footer. The routes are the site's structure and stay in
 * code; the labels are edited under Site Pages → Global.
 */
export function siteNav(): { name: string; href: string }[] {
  const global = sitePage('global');
  return [
    { name: global.text('nav_about'), href: '/about' },
    { name: global.text('nav_product_lab'), href: '/product-lab' },
    { name: global.text('nav_creative_lab'), href: '/creative-lab' },
    { name: global.text('nav_archive'), href: '/archive' },
    { name: global.text('nav_contact'), href: '/contact' },
  ];
}
