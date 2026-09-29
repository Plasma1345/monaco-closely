import Link from 'next/link';
import styles from '@/styles/Monaco.module.css';

const credits = [
  { name: 'Alexandra_Koch', href: 'https://pixabay.com/photos/port-yachts-monaco-monte-carlo-7501955/' },
  { name: 'Hans', href: 'https://pixabay.com/photos/prince-palace-monaco-palace-187312/' },
  { name: 'Charlottees', href: 'https://pixabay.com/photos/monaco-monte-carlo-casino-building-4629506/' },
  { name: '16018388', href: 'https://pixabay.com/photos/architecture-big-city-black-boats-5072728/' },
  { name: 'MrJayW', href: 'https://pixabay.com/photos/beach-the-city-monaco-3400920/' },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerPanel}>
        <div className={styles.footerTop}>
          <div>
            <span className={styles.eyebrow}>Keep a little Riviera with you</span>
            <h2>Monaco, on your own terms.</h2>
          </div>
          <Link className={styles.footerCta} href="/plan-your-visit">
            Plan your visit <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className={styles.footerWord} aria-hidden="true">MONACO</div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} Monaco, Closely · An independent travel guide</span>
          <nav aria-label="Footer navigation">
            <Link href="/neighborhoods">Neighborhoods</Link>
            <Link href="/plan-your-visit">Plan a visit</Link>
            <a href="https://www.visitmonaco.com/en" target="_blank" rel="noreferrer">Official tourism ↗</a>
          </nav>
        </div>
        <p className={styles.photoCredits}>
          Photography via Pixabay:{' '}
          {credits.map((credit, index) => (
            <span key={credit.name}>
              <a href={credit.href} target="_blank" rel="noreferrer">{credit.name}</a>
              {index < credits.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
