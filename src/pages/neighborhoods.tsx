import Head from 'next/head';
import NeighborhoodGrid from '@/components/site/NeighborhoodGrid';
import PageBanner from '@/components/site/PageBanner';
import SiteLayout from '@/components/site/SiteLayout';
import styles from '@/styles/Monaco.module.css';

export default function Neighborhoods() {
  return (
    <SiteLayout>
      <Head>
        <title>Neighborhoods — Monaco, Closely</title>
        <meta name="description" content="Explore Monaco-Ville, La Condamine, Monte-Carlo and Larvotto with this neighborhood-by-neighborhood guide." />
      </Head>
      <PageBanner
        eyebrow="Four ways into the city"
        title="Find the Monaco that feels like yours."
        lead="From the old town on the Rock to the open water at Larvotto, each neighborhood gives the principality a different mood."
        image="/assets/images/monaco-harbor-at-dusk.jpg"
        imageAlt="Monaco’s layered cityscape and harbour at dusk"
        displayWord="Places"
        imagePosition="center 51%"
      />
      <section className={styles.pageContent}>
        <div className={styles.pageLead}>
          <span className={styles.eyebrow}>A pocket-sized place with many textures</span>
          <h2>Four quarters; plenty of reasons to turn down another street.</h2>
          <p>Use these as starting points, then let the views, gardens and small discoveries join them together.</p>
        </div>
        <NeighborhoodGrid />
        <p className={`${styles.officialNote} ${styles.contentWidth}`}>
          Looking for more official routes and sights? Browse{' '}
          <a href="https://www.visitmonaco.com/en" target="_blank" rel="noreferrer">VisitMonaco ↗</a>.
        </p>
      </section>
    </SiteLayout>
  );
}
