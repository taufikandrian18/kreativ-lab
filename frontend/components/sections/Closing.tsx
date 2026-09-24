import Link from 'next/link';
import { Grain } from '@/components/motion/Grain';
import { WordReveal } from '@/components/motion/WordReveal';
import { accentWords, sitePage } from '@/lib/site-content';

export function Closing() {
  const home = sitePage('home');
  const statement = accentWords(home.text('closing_statement'));

  return (
    <section className="bg-k-black text-k-paper relative overflow-hidden">
      <Grain />
      <div className="section-shell relative flex min-h-[80svh] flex-col justify-center">
        <WordReveal
          as="p"
          text={statement.text}
          accent={statement.accent}
          className="display-type lg:max-w-[14ch]"
        />
        <Link
          href="/contact"
          className="font-body mt-12 inline-block self-start py-3 text-xs tracking-widest uppercase"
        >
          {home.text('closing_link')}
        </Link>
      </div>
    </section>
  );
}
