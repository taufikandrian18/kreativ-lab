export function Section({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-h-[100svh] w-full ${className}`}>
      {children}
    </section>
  );
}
