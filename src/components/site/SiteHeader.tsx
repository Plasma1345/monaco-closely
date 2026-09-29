import Link from 'next/link';
import { useState } from 'react';
import styles from '@/styles/Monaco.module.css';

const navigation = [
  { label: 'Discover', href: '/#discover' },
  { label: 'Neighborhoods', href: '/neighborhoods' },
  { label: 'Plan your visit', href: '/plan-your-visit' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Monaco, Closely home">
        <span className={styles.brandMark} aria-hidden="true">
          <svg viewBox="0 0 30 30" fill="none">
            <path d="M15 3.5 18.5 11.5 26.5 15 18.5 18.5 15 26.5 11.5 18.5 3.5 15 11.5 11.5 15 3.5Z" />
            <circle cx="15" cy="15" r="2.15" />
          </svg>
        </span>
        <span>Monaco, closely</span>
      </Link>

      <nav className={styles.desktopNav} aria-label="Main navigation">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className={styles.headerCta} href="/plan-your-visit">
        Make a day of it <span aria-hidden="true">↗</span>
      </Link>

      <details
        className={styles.mobileMenu}
        open={menuOpen}
        onToggle={(event) => setMenuOpen(event.currentTarget.open)}
      >
        <summary aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
          <span className={styles.menuIcon} aria-hidden="true"><i /><i /></span>
        </summary>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}<span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
