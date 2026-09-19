import { Hero } from '@/components/sections/Hero';
import { Manifesto } from '@/components/sections/Manifesto';
import { WhoWeAre } from '@/components/sections/WhoWeAre';
import { TwoLabs } from '@/components/sections/TwoLabs';
import { ArchiveTeaser } from '@/components/sections/ArchiveTeaser';
import { ClientWall } from '@/components/sections/ClientWall';
import { Closing } from '@/components/sections/Closing';

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <WhoWeAre />
      <TwoLabs />
      <ArchiveTeaser />
      <ClientWall />
      <Closing />
    </main>
  );
}
