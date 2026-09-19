export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
      {children}
    </div>
  );
}
