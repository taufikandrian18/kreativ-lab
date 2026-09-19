// Registers jest-dom matchers (toBeInTheDocument, etc.) on Vitest's `expect`, and
// augments the global Assertion type so TypeScript recognizes them. Needed starting
// with Task 7's page.test.tsx, the first test in this project to use a jest-dom matcher
// rather than plain className/innerHTML string assertions.
import '@testing-library/jest-dom/vitest';
