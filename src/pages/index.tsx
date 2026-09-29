import Head from 'next/head';
import DaySection from '@/components/site/DaySection';
import GettingAround from '@/components/site/GettingAround';
import HomeHero from '@/components/site/HomeHero';
import IntroSection from '@/components/site/IntroSection';
import PlacesSection from '@/components/site/PlacesSection';
import SiteLayout from '@/components/site/SiteLayout';

export default function Home() {
  return (
    <SiteLayout>
      <Head>
        <title>Monaco, Closely — A guide to the Riviera</title>
        <meta name="description" content="A thoughtful field guide to Monaco’s neighborhoods, harbour, gardens and seaside walks." />
        <meta property="og:title" content="Monaco, Closely — A guide to the Riviera" />
        <meta property="og:description" content="Find your own pace in Monaco, one little wonder at a time." />
      </Head>
      <HomeHero />
      <IntroSection />
      <PlacesSection />
      <DaySection />
      <GettingAround />
    </SiteLayout>
  );
}
