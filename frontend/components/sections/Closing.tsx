import { Grain } from '@/components/motion/Grain';
import { PillLink } from '@/components/motion/PillLink';
import { TornEdge } from '@/components/motion/TornEdge';
import { WordReveal } from '@/components/motion/WordReveal';
import { accentWords, sitePage } from '@/lib/site-content';

/**
 * Crency closes on one big centred question — "Want one that sells?" — and a single
 * button. So does this: the statement assembles word by word as it scrolls up, and the
 * call to action is a pill that leans toward the pointer.
 */
export function Closing() {
  const home = sitePage('home');
  const statement = accentWords(home.text('closing_statement'));

  return (
    <section className="bg-k-black text-k-paper relative overflow-hidden">
      <TornEdge from="paper" seed={19} />
      <Grain />
      <div className="section-shell relative flex min-h-[55svh] flex-col items-center justify-center text-center lg:min-h-[80svh]">
        <WordReveal
          as="p"
          text={statement.text}
          accent={statement.accent}
          className="display-type mx-auto lg:max-w-[16ch]"
          scrub
          swaps={2}
        />
        <PillLink href="/contact" tone="paper" className="mt-14">
          {home.text('closing_link')}
        </PillLink>
      </div>
    </section>
  );
}
