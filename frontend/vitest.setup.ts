// Registers jest-dom matchers (toBeInTheDocument, etc.) on Vitest's `expect`, and
// augments the global Assertion type so TypeScript recognizes them. Needed starting
// with Task 7's page.test.tsx, the first test in this project to use a jest-dom matcher
// rather than plain className/innerHTML string assertions.
import '@testing-library/jest-dom/vitest';

// Guarded because SSR-shaped tests run in the `node` environment, where there is no
// window at all — which is the condition those tests exist to reproduce.
// jsdom has no matchMedia. Default every test to prefers-reduced-motion: reduce so
// components render their static end state and GSAP stays out of a layout-less
// document. Tests that assert on motion stub matchMedia themselves.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
