import Link from 'next/link';
import { Grain } from '@/components/motion/Grain';
import { Magnetic } from '@/components/motion/Magnetic';
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
          scrub
        />
        {/* The one element on the page that asks to be clicked, so it is the one that
            answers the pointer. Paper-on-black inverting to black-on-paper keeps the
            hover inside the three colours. */}
        <Magnetic className="mt-12 self-start">
          <Link
            href="/contact"
            className="font-body border-k-paper hover:bg-k-paper hover:text-k-black inline-block border-2 px-7 py-4 text-xs tracking-widest uppercase transition-colors duration-300"
          >
            {home.text('closing_link')}
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
