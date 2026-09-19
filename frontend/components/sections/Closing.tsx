import Link from 'next/link';
import { MaskReveal } from '@/components/motion/MaskReveal';

export function Closing() {
  return (
    <section className="bg-k-black text-k-paper">
      <div className="flex min-h-[80svh] flex-col justify-center px-4 py-24 sm:px-8 lg:px-12">
        <MaskReveal as="p" className="display-type">
          LET&apos;S <span className="text-k-red">CREATE</span> SOMETHING THAT{' '}
          <span className="text-k-red">LIVES.</span>
        </MaskReveal>
        <Link
          href="/contact"
          className="font-body mt-12 inline-block self-start text-xs tracking-widest uppercase"
        >
          Start a project
        </Link>
      </div>
    </section>
  );
}
