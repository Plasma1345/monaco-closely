import Head from 'next/head';
import PageBanner from '@/components/site/PageBanner';
import SiteLayout from '@/components/site/SiteLayout';
import VisitPlan from '@/components/site/VisitPlan';

export default function PlanYourVisit() {
  return (
    <SiteLayout>
      <Head>
        <title>Plan your visit — Monaco, Closely</title>
        <meta name="description" content="Practical notes for getting to, around and making a relaxed day of Monaco." />
      </Head>
      <PageBanner
        eyebrow="A little practical, a little poetic"
        title="Make space for the unexpected."
        lead="A few simple notes for arriving, getting around and shaping a first day in the principality."
        image="/assets/images/monaco-port-yachts.jpg"
        imageAlt="Port Hercule and the Mediterranean coast of Monaco"
        displayWord="The visit"
        imagePosition="center 52%"
      />
      <VisitPlan />
    </SiteLayout>
  );
}
