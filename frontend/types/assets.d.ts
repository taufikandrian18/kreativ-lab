// Importing a font file for its emitted URL. Next declares image modules via
// next/image-types/global but nothing for font binaries, and spec §5 requires both
// faces preloaded — which needs the hashed URL the bundler emits, not a public/ path
// that would duplicate the file and still not match the request @fontsource makes.
declare module '*.woff2' {
  const src: string;
  export default src;
}
