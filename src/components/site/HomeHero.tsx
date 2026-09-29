import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Monaco.module.css';

const slides = [
  {
    name: 'Port Hercule',
    src: '/assets/images/monaco-port-yachts.jpg',
    alt: 'Yachts in Port Hercule with Monaco rising above the Mediterranean',
    position: '50% 55%',
  },
  {
    name: 'The harbour at dusk',
    src: '/assets/images/monaco-harbor-at-dusk.jpg',
    alt: 'Monaco harbour and waterfront at dusk',
    position: '50% 54%',
  },
  {
    name: 'The Prince’s Palace',
    src: '/assets/images/monaco-prince-palace.jpg',
    alt: 'The Prince’s Palace overlooking Monaco-Ville',
    position: '50% 45%',
  },
  {
    name: 'Monte-Carlo',
    src: '/assets/images/monte-carlo-casino.jpg',
    alt: 'The Casino de Monte-Carlo and its Belle Époque architecture',
    position: '50% 45%',
  },
];

export default function HomeHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  return (
    <section className={styles.hero} aria-label="Discover Monaco">
      <img
        key={activeSlide.src}
        className={styles.heroPhoto}
        src={activeSlide.src}
        alt={activeSlide.alt}
        style={{ objectPosition: activeSlide.position }}
        fetchPriority="high"
      />
      <div className={styles.heroShade} />

      <div className={styles.heroTopline}>
        <div className={styles.heroIntro}>
          <span className={styles.heroEyebrow}><i /> A principality by the sea</span>
          <p>
            Just a few kilometres from end to end, Monaco unfolds in layers: harbour light,
            pastel streets above the sea, and gardens made for a pause.
          </p>
        </div>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="/neighborhoods">
            Find your way in <span aria-hidden="true">↗</span>
          </Link>
          <Link className={styles.lightButton} href="/plan-your-visit">
            Plan a visit <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <h1 className={styles.heroWord}>MONACO</h1>

      <div className={styles.heroProgress} role="group" aria-label="Featured views">
        {slides.map((slide, index) => (
          <button
            key={slide.name}
            className={styles.progressButton}
            type="button"
            aria-label={`Show ${slide.name}`}
            aria-pressed={activeIndex === index}
            onClick={() => setActiveIndex(index)}
          >
            <span className={index === activeIndex ? styles.progressActive : undefined} />
          </button>
        ))}
      </div>
      <div className={styles.heroCaption} aria-live="polite">
        <span>01 / 04</span>{' '}{activeSlide.name}
      </div>
    </section>
  );
}
