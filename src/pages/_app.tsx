import type { AppProps } from 'next/app';
import { installIntroScrollLockSafetyNet } from '@/components/ui/intro';
import '@/styles/globals.css';
import '@/styles/sg-animations.css';
import '@/lib/sg-animations';

// Last-resort net: a broken intro must degrade to a usable page, never a
// dead one. For a bounded window after load it force-frees a page that stays
// scroll-locked past the longest legal intro - in any lock shape, however
// late the lock lands - then stops, leaving real modals alone (intro.tsx).
installIntroScrollLockSafetyNet();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}
