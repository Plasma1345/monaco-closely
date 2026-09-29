import * as React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { sgIntroGate, onIntroDone } from './intro';

// One reveal easing for the whole site (expo-out) and one viewport rule:
// fire when the element is ~10% into view, only once.
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

// While a page intro overlay (see intro.tsx) covers the screen, reveals hold
// their hidden state and play only once it lifts - otherwise they fire
// invisibly BEHIND the overlay and the page looks static the moment it goes.
// Gating is decided once at mount; a later intro can never hide live content.
function useIntroGate(): boolean {
  const [gated, setGated] = React.useState(() => sgIntroGate.active);
  React.useEffect(() => {
    if (!sgIntroGate.active) {
      setGated(false);
      return;
    }
    const unsubscribe = onIntroDone(() => setGated(false));
    // Safety valve: never hold reveals hostage if an intro fails to finish.
    const t = window.setTimeout(() => setGated(false), 8000);
    return () => {
      unsubscribe();
      window.clearTimeout(t);
    };
  }, []);
  return gated;
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** rise distance in px (default 24) */
  y?: number;
  /** seconds (default 0.7) */
  duration?: number;
  /** seconds before it starts (default 0) */
  delay?: number;
};

/** A block (heading, paragraph, image, card) that fades + rises once on scroll-in. */
export function Reveal({ children, className, y = 24, duration = 0.7, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();
  const gated = useIntroGate();
  return (
    <motion.div
      key={gated ? "sg-gated" : "sg-live"}
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={gated ? undefined : { opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: REVEAL_EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Variants for a staggered group (put on a container with <RevealItem> children). */
export const revealGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: REVEAL_EASE } },
};

/** A container that staggers its <RevealItem> children up, once, on scroll-in. */
export function RevealGroup({ children, className }: RevealProps) {
  const gated = useIntroGate();
  return (
    <motion.div
      key={gated ? "sg-gated" : "sg-live"}
      className={className}
      variants={revealGroup}
      initial="hidden"
      whileInView={gated ? undefined : "show"}
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

/** One item inside <RevealGroup>. */
export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : revealItem}>
      {children}
    </motion.div>
  );
}

/**
 * Headline reveal that staggers each WORD up + in (the premium headline move).
 * trigger="mount" plays immediately (use it for the hero headline on load); the
 * default "inView" plays when the heading scrolls into view. Honors reduced-motion.
 */
export function RevealWords({
  text,
  className,
  y = 24,
  duration = 0.6,
  stagger = 0.045,
  delay = 0,
  trigger = "inView",
}: {
  text: string;
  className?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  trigger?: "inView" | "mount";
}) {
  const reduce = useReducedMotion();
  const gated = useIntroGate();
  if (reduce) return <span className={className}>{text}</span>;
  const words = text.split(" ");
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration, ease: [0.25, 0.46, 0.45, 0.94] } },
  };
  const body = words.map((w, i) => (
    <span key={i}>
      {i > 0 ? " " : ""}
      <motion.span variants={word} style={{ display: "inline-block" }}>
        {w}
      </motion.span>
    </span>
  ));
  return trigger === "mount" ? (
    // animate flips hidden -> show the moment the intro gate opens, so the
    // hero cascade plays right as the overlay lifts instead of behind it.
    <motion.span className={cn("inline-block", className)} variants={container} initial="hidden" animate={gated ? "hidden" : "show"}>
      {body}
    </motion.span>
  ) : (
    <motion.span
      key={gated ? "sg-gated" : "sg-live"}
      className={cn("inline-block", className)}
      variants={container}
      initial="hidden"
      whileInView={gated ? undefined : "show"}
      viewport={VIEWPORT}
    >
      {body}
    </motion.span>
  );
}
