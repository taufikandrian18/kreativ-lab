export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full px-4 sm:px-8 lg:px-12" style={{ maxWidth: 'var(--width-content-max)' }}>
      {children}
    </div>
  );
}
