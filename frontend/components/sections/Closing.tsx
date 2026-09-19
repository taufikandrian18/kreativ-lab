import Link from 'next/link';
import { Grain } from '@/components/motion/Grain';
import { WordReveal } from '@/components/motion/WordReveal';

export function Closing() {
  return (
    <section className="bg-k-black text-k-paper relative overflow-hidden">
      <Grain />
      <div className="section-shell relative flex min-h-[80svh] flex-col justify-center">
        <WordReveal
          as="p"
          text="LET'S CREATE SOMETHING THAT LIVES."
          accent={['create', 'lives.']}
          className="display-type"
        />
        <Link
          href="/contact"
          className="font-body mt-12 inline-block self-start py-3 text-xs tracking-widest uppercase"
        >
          Start a project
        </Link>
      </div>
    </section>
  );
}
