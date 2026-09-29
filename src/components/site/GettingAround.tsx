import Link from 'next/link';
import styles from '@/styles/Monaco.module.css';

export default function GettingAround() {
  return (
    <section className={styles.mobilitySection} id="getting-around">
      <div className={`${styles.contentWidth} ${styles.mobilityPanel}`}>
        <div className={styles.mobilityCopy}>
          <span className={styles.sectionLabel}>Getting around</span>
          <h2>Small enough to explore. Steep enough to plan.</h2>
          <p>
            Walking brings the details close; public lifts, escalators and the local bus network
            make the climbs easier. Leave a little room between stops and check live services as you go.
          </p>
          <div className={styles.mobilityLinks}>
            <Link href="/plan-your-visit">Read the visit notes <span aria-hidden="true">↗</span></Link>
            <a href="https://www.cam.mc/en" target="_blank" rel="noreferrer">CAM lines &amp; times <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className={styles.mobilityStats}>
          <div className={styles.mobilityCard}><span>On foot</span><strong>Look for the public lifts linking the hillside streets.</strong></div>
          <div className={styles.mobilityCard}><span>By bus</span><strong>Use CAM’s current route map and real-time schedules.</strong></div>
          <div className={styles.mobilityCard}><span>By the port</span><strong>Check the local boat-bus connection across Port Hercule.</strong></div>
          <div className={styles.mobilityCard}><span>Before you go</span><strong>Check current opening times for museums and sights.</strong></div>
        </div>
      </div>
    </section>
  );
}
