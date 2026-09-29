import Link from 'next/link';
import styles from '@/styles/Monaco.module.css';

const moments = [
  { time: 'Morning', title: 'Start up on the Rock', text: 'Wander Monaco-Ville’s lanes and look out over the harbour from the gardens.' },
  { time: 'Midday', title: 'Drift back to the water', text: 'Take the slope down at your own pace and pause around La Condamine and Port Hercule.' },
  { time: 'Later', title: 'Follow the coast east', text: 'Make space for the Japanese Garden, a sea-facing walk and the light around Larvotto.' },
];

export default function DaySection() {
  return (
    <section className={styles.daySection} id="moments">
      <div className={`${styles.contentWidth} ${styles.dayPanel}`}>
        <div className={styles.dayIntro}>
          <div>
            <span className={styles.sectionLabel}>An unhurried first day</span>
            <h2>Let the city set the pace.</h2>
            <p>Think of this as a loose line through the principality, not a checklist. Stay longer wherever the view catches you.</p>
          </div>
          <ol className={styles.timeline}>
            {moments.map((moment) => (
              <li key={moment.time}>
                <time>{moment.time}</time>
                <div><strong>{moment.title}</strong><span>{moment.text}</span></div>
              </li>
            ))}
          </ol>
          <Link className={styles.textLink} href="/plan-your-visit">Make it your own <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.dayPhotoWrap}>
          <img
            className={styles.dayPhoto}
            src="/assets/images/monaco-larvotto-coast.jpg"
            alt="Coastal pines leaning over the bright Mediterranean"
            loading="lazy"
          />
          <div className={styles.photoNote}><span>A pause beside the water</span><span>Riviera, unhurried</span></div>
        </div>
      </div>
    </section>
  );
}
