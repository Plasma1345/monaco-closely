import Link from 'next/link';
import styles from '@/styles/Monaco.module.css';

const facts = [
  { value: '2.1 km²', label: 'Monaco’s area, rounded on the official tourist map' },
  { value: 'By foot', label: 'A lovely way to find the details between the landmarks' },
  { value: 'Up & down', label: 'Public lifts and escalators help link the hillside streets' },
];

export default function IntroSection() {
  return (
    <section className={styles.introSection} id="discover">
      <span className={styles.eyebrow}>A small place, with room to wander</span>
      <h2 className={styles.introTitle}>The best way to take in Monaco is to slow down.</h2>
      <p className={styles.introBody}>
        Look beyond the grand names and the views open up: a quiet garden above the water,
        a market street turning toward the port, the old town glowing at the end of the day.
        Here’s a field guide to finding your own pace.
      </p>
      <div className={styles.introFacts}>
        {facts.map((fact) => (
          <div className={styles.introFact} key={fact.value}>
            <strong>{fact.value}</strong><span>{fact.label}</span>
          </div>
        ))}
      </div>
      <p className={styles.officialNote}>
        Area figure from the{' '}
        <a href="https://www.visitmonaco.com/Documents-Site/7495/Plan%20VisitMonaco%20-%202024.pdf" target="_blank" rel="noreferrer">
          official Monaco tourist map ↗
        </a>
        .
      </p>
      <Link className={styles.textLink} href="/neighborhoods">Get to know the neighborhoods <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
