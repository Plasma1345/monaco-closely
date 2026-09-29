import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Intro easing measured from the references (a strong ease-in-out), shared by
// the curtain slide and the clip-path expand.
const INTRO_EASE = [0.76, 0, 0.24, 1] as const;

// Duration of the sheet exit. Also the size of the backstop that finishes the
// intro when the exit animation never reports completion.
const INTRO_EXIT_MS = 680;

// U+00A0 for the per-letter wordmark: a real space would collapse in the
// inline-block spans. Built with fromCharCode ON PURPOSE, as a module-level
// CODE constant: this scaffold must contain NO "\u" escape sequence and no
// invisible literal nbsp byte anywhere. A rendered-escape scan that saw
// either one inside the wordmark JSX declared the platform's own scaffold
// corrupt, and the agent then burned entire runs hunting a bug that did not
// exist (the read/search loop in the E1 transcript). Keep it this way.
const NBSP = String.fromCharCode(160);

// ---------------------------------------------------------------------------
// Intro gate: while a page intro overlay is covering the screen, the Reveal
// primitives (see reveal.tsx) hold their hidden state and only play once the
// intro finishes. Without this, mount/scroll reveals fire BEHIND the overlay
// and the page looks static the moment the intro lifts (the "nothing fades
// in" bug). The flag is set during the intro's render (before any sibling
// effects), so reveals mounting in the same tree pick it up immediately.
// ---------------------------------------------------------------------------
export const sgIntroGate = { active: false };
const introGateListeners = new Set<() => void>();

/** reveal.tsx subscribes here; the callback fires when the intro finishes. */
export function onIntroDone(cb: () => void): () => void {
  introGateListeners.add(cb);
  return () => introGateListeners.delete(cb);
}

/**
 * Open the gate so every held reveal plays. EXPORTED on purpose: a bespoke
 * intro that does not use the components below still has to release the page,
 * and keeping this private is what forced one build to "fix" its own intro by
 * deleting the state transition that released it. Safe to call any number of
 * times and from any code path.
 */
export function openIntroGate() {
  if (!sgIntroGate.active) return;
  sgIntroGate.active = false;
  introGateListeners.forEach((cb) => cb());
  introGateListeners.clear();
}

// ---------------------------------------------------------------------------
// Body scroll lock. An intro covers the page, so the page must not scroll under
// it - but a lock that is not GUARANTEED to release is how a build ships a site
// that can never be scrolled again. Everything below exists so that no code
// path (a stage that never reaches its end state, an animation callback that
// never fires, a thrown effect, a bespoke intro hand-rolled next month) can
// leave document.body.style.overflow === "hidden" forever.
// ---------------------------------------------------------------------------

/** Hard ceiling on a single intro lock: it self-releases after this. */
export const SG_INTRO_LOCK_MAX_MS = 6000;

// Nesting depth, so a second lock (or StrictMode double-invoking an effect)
// does not fight the first one. The pre-lock value is captured by the
// OUTERMOST lock only - the naive "save prev, then set hidden" per caller saves
// our OWN 'hidden' on the second run and then "restores" the page to locked.
let introLockDepth = 0;
let introLockRestore: string | null = null;

function restoreBodyOverflow() {
  introLockDepth = 0;
  const previous = introLockRestore ?? '';
  introLockRestore = null;
  if (typeof document === 'undefined') return;
  document.body.style.overflow = previous;
  // A hand-rolled intro may have locked <html> instead of <body>; free that too.
  if (document.documentElement.style.overflow === 'hidden') {
    document.documentElement.style.overflow = '';
  }
}

/**
 * Imperative form of the scroll lock (React callers want useIntroScrollLock).
 * Returns release(), which is:
 *   - nested-safe  : only the outermost lock restores the page value,
 *   - idempotent   : calling it twice never pops someone else's lock,
 *   - self-firing  : an unconditional timeout releases the lock even if the
 *                    caller never does.
 */
export function lockBodyScroll(maxMs: number = SG_INTRO_LOCK_MAX_MS): () => void {
  if (typeof document === 'undefined') return () => {};
  if (introLockDepth === 0) introLockRestore = document.body.style.overflow;
  introLockDepth += 1;
  document.body.style.overflow = 'hidden';

  let released = false;
  let timer = 0;
  const release = () => {
    if (released) return;
    released = true;
    if (timer) window.clearTimeout(timer);
    introLockDepth = Math.max(0, introLockDepth - 1);
    if (introLockDepth === 0) restoreBodyOverflow();
  };
  timer = window.setTimeout(release, Math.max(0, maxMs));
  return release;
}

/**
 * Hold the page still while an intro covers it. THE supported way - never set
 * document.body.style.overflow from a component. The lock releases when `active`
 * goes false (the intro finished), when the component unmounts (React runs the
 * effect cleanup), and after maxMs regardless, so an intro that never finishes
 * still degrades to a scrollable page.
 *
 *   const [covering, setCovering] = React.useState(true);
 *   useIntroScrollLock(covering);
 */
export function useIntroScrollLock(active: boolean = true, maxMs: number = SG_INTRO_LOCK_MAX_MS) {
  React.useEffect(() => {
    if (!active) return;
    // The effect return value IS the release: React calls it on unmount and
    // before every re-run, and the timeout inside lockBodyScroll covers the
    // paths that do neither.
    return lockBodyScroll(maxMs);
  }, [active, maxMs]);
}

// ---------------------------------------------------------------------------
// Every SHAPE a page lock comes in. The primitive above only ever writes
// body.style.overflow, but a hand-rolled intro reaches for whatever is at hand:
// the Tailwind utility (classList.add("overflow-hidden")), an overflow rule in
// a stylesheet, or the position:fixed body freeze. A net that inspects only the
// INLINE overflow sees none of those and leaves the page as dead as it found it.
// ---------------------------------------------------------------------------

/**
 * Class-based locks these projects actually use; detected AND stripped. Note
 * that 'modal-open' and 'no-scroll' are also the idiom of a perfectly legitimate
 * modal - which is why nothing here decides on its own that a lock may be
 * broken; the safety net decides that, from who caused the lock.
 */
const SG_LOCK_CLASSES = [
  'overflow-hidden',
  'overflow-y-hidden',
  'no-scroll',
  'scroll-locked',
  'modal-open',
];

function readsAsLocked(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  const style = el.style;
  if (style.overflow === 'hidden' || style.overflowY === 'hidden') return true;
  if (style.position === 'fixed') return true;
  const classes = el.classList;
  if (classes && SG_LOCK_CLASSES.some((name) => classes.contains(name))) return true;
  // A class or stylesheet lock never shows up in el.style, only in the computed
  // value. Only the vertical axis counts: overflow-x: hidden is a normal "no
  // sideways scrollbar" rule, not a lock.
  if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return false;
  }
  const computed = window.getComputedStyle(el);
  if (!computed) return false;
  if (computed.overflowY === 'hidden' || computed.overflowY === 'clip') return true;
  // The position:fixed freeze reads exactly like the inline one above, and a
  // stylesheet writes it just as often (body.menu-open { position: fixed })
  // WITHOUT an overflow rule to go with it - the freeze alone is what stops the
  // page. Detecting only the inline half is how such a page stayed frozen with
  // the escalation that exists for it (forcePageScrollable's position override)
  // never once reached.
  return computed.position === 'fixed';
}

/** True while the page cannot be scrolled, whatever is holding it. */
export function isPageScrollLocked(): boolean {
  if (typeof document === 'undefined') return false;
  return readsAsLocked(document.body) || readsAsLocked(document.documentElement);
}

// ---------------------------------------------------------------------------
// Page writes the NET ITSELF performs. Undoing a lock moves the page: the
// scrollTo below hands a position:fixed freeze the offset it was frozen at
// back, and dropping that freeze (the inline undo, or the !important
// override) snaps the document to its real offset all on its own. The browser
// reports both as a plain `scroll` event, and window.scrollY simply reads
// different on the next poll - neither carries anything that says who moved
// the page.
//
// Recorded as visitor evidence, those writes are a permanent lock of the
// net's OWN making: its release marks the page as one the visitor has
// scrolled, and the next lock inside the causal window (see
// lockCausedByVisitor) is then judged the visitor's doing and never freed -
// an unscrollable page with zero visitor input.
//
// So every page write the net makes runs inside withPageWrites, which stamps
// the moment, and `moved` evidence inside that stamp is dropped in
// noteVisitorGesture. scrollTheWindow is the ONLY place this module names
// window.scrollTo, and nothing below touches the page outside the wrapper -
// so a call site added later cannot reach the unstamped form without going
// around both.
// ---------------------------------------------------------------------------
// Long enough to cover the scroll event (dispatched a frame or so AFTER the
// write, not during it) and the offset backstop, which only notices the move
// on its next poll one SG_STUCK_POLL_MS later. Kept just past that, so a
// visitor scrolling after a release is still recorded on the tick after.
const SG_SELF_SCROLL_MS = 750;
let selfInflictedScrollUntil = Number.NEGATIVE_INFINITY;

function stampSelfInflictedScroll() {
  selfInflictedScrollUntil = sgNow() + SG_SELF_SCROLL_MS;
}

/**
 * Run a page write of the net's own. THE way this module touches the page:
 * whatever scrolling the write causes is stamped as self-inflicted and never
 * counted as the visitor using the page.
 */
function withPageWrites(write: () => void): void {
  stampSelfInflictedScroll();
  try {
    write();
  } finally {
    // Stamped again from the END of the write: the scroll event and the next
    // offset poll both land after it, never before.
    stampSelfInflictedScroll();
  }
}

/** The one place the net scrolls the window. Always stamped, by construction. */
function scrollTheWindow(x: number, y: number) {
  if (typeof window === 'undefined' || typeof window.scrollTo !== 'function') return;
  stampSelfInflictedScroll();
  window.scrollTo(x, y);
  stampSelfInflictedScroll();
}

/**
 * Force the page scrollable again, whatever locked it: the inline overflow (via
 * the primitive's own restore), the lock CLASSES, and the position:fixed body
 * freeze. Idempotent and safe on an already-scrollable page - removing a class
 * that is not there and clearing an empty inline style are both no-ops - so an
 * intro that finished on its own is never disturbed. On a page that is STILL
 * locked afterwards it escalates (see forcePageScrollable), so this always
 * leaves the page scrollable: do not call it while an overlay of your own is
 * deliberately holding the page.
 */
export function releasePageScrollLock() {
  if (typeof document === 'undefined') return;
  withPageWrites(() => {
    const body = document.body;
    // Hand the primitive its page value back (and reset its depth) only when it
    // actually holds the page - otherwise this would overwrite an inline overflow
    // the app set for its own reasons.
    if (introLockDepth > 0 || (body && body.style.overflow === 'hidden')) {
      restoreBodyOverflow();
    }
    for (const el of [body, document.documentElement]) {
      if (!el) continue;
      const classes = el.classList;
      if (classes) SG_LOCK_CLASSES.forEach((name) => classes.remove(name));
      if (el.style.overflow === 'hidden') el.style.overflow = '';
      if (el.style.overflowY === 'hidden') el.style.overflowY = '';
    }
    // The position:fixed freeze: clearing overflow alone leaves the page pinned at
    // the offset it was frozen at, so undo the whole pattern and hand the scroll
    // position back.
    if (body && body.style.position === 'fixed') {
      const frozenTop = Number.parseInt(body.style.top || '0', 10) || 0;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      scrollTheWindow(0, -frozenTop);
    }
    // Everything above can only reach an INLINE property, one of the class names
    // we happen to know, and the position:fixed freeze. A lock that lives in a
    // STYLESHEET rule - a project's own .intro-open { overflow: hidden }, a
    // smooth-scroll library's stopped class - survives all of it, which is how a
    // page stayed dead even after this function had "released" it. So verify, and
    // escalate only when the page is still locked: a page that was already free
    // keeps its own styles untouched.
    if (isPageScrollLocked()) forcePageScrollable();
  });
}

/**
 * The override of last resort: an !important INLINE declaration, the only thing
 * that outranks a stylesheet rule we cannot find or delete (an inline style is
 * author origin AND beats any selector, so nothing in a sheet can outbid it).
 * Only the VERTICAL axis is forced: overflow-x: hidden is a deliberate "no
 * sideways scrollbar" rule in half these projects, and the shorthand would reset
 * it. Reached only on a page that is still unscrollable after the polite release
 * above, where any style is worth less than being able to scroll.
 */
export function forcePageScrollable() {
  if (typeof document === 'undefined') return;
  withPageWrites(() => {
    for (const el of [document.body, document.documentElement]) {
      const style = el && el.style;
      if (!style || typeof style.setProperty !== 'function') continue;
      style.setProperty('overflow-y', 'auto', 'important');
      // A stylesheet freezes the page with position:fixed just as easily as an
      // inline style does, and that freeze outlives any overflow change. Dropping
      // it lets the document snap back to its real offset, which is a page move
      // of our own - hence the wrapper around the whole escalation.
      if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
        continue;
      }
      const computed = window.getComputedStyle(el);
      if (computed && computed.position === 'fixed') {
        style.setProperty('position', 'static', 'important');
      }
    }
  });
}

// Page-level net. A lock held CONTINUOUSLY for this long is not an intro any
// more - the visitor has been sitting on a page that will not scroll - so it is
// force-freed. The clock RESTARTS whenever the page is seen scrollable, which is
// what keeps a legitimate short intro from being interrupted.
const SG_STUCK_LOCK_MS = 12000;
const SG_STUCK_POLL_MS = 500;
// How long the net keeps watching. It is armed before React mounts, so it has to
// OUTLIVE every way an intro can arrive late: hydration, a lazy or Suspense-gated
// intro, one gated on fonts or data, a slow phone. The old rule ("disarm on the
// first tick the body is not hidden") disarmed 500ms after load - before the
// intro effect had even run - and could then never rescue the lock it exists for.
// Past this window no intro is still arriving, so the net stops and a modal the
// visitor opens later is left alone.
const SG_STUCK_WATCH_MS = 30000;
// How long the net keeps FIGHTING a lock it could not break. A lock that is
// merely stuck dies on the first !important override; if ten seconds of them
// have not freed the page, something is re-applying the lock every frame and no
// number of retries will win - all a forever-running interval buys then is a
// wasted timer.
const SG_STUCK_FORCE_MS = 10000;
let safetyNetArmed = false;

// ---------------------------------------------------------------------------
// WHICH locks the net may break. A locked page is not by itself a bug: a modal,
// a mobile nav and a filter drawer all lock scrolling on purpose, using the very
// same idioms (body.style.overflow, "modal-open", "no-scroll"). Stripping one of
// those scrolls the page behind an overlay the visitor is looking at - a worse
// bug than the one this net exists for. What actually separates the two is who
// caused the lock: a modal is opened BY an interaction, so the visitor gesture
// that opened it lands on a still-scrollable page a moment BEFORE the lock,
// while an intro locks the page on its own schedule.
//
// "A gesture happened at some point earlier" is NOT that signal, and believing
// it was is the whole bug: one tap anywhere on a scrollable page then marked
// every later lock the visitor's doing, so a hand-rolled intro that mounted
// late - after the visitor had clicked a nav link, dismissed a cookie bar,
// pressed a key - was never rescued and the page stayed frozen for good. What
// makes a gesture the CAUSE of a lock is that the lock follows it immediately.
// So we keep the moment of the last gesture, and a lock episode asks whether
// that moment is recent enough to explain it. Gestures made while the page is
// ALREADY locked are not recorded at all - that is the visitor tapping at a
// frozen intro, the symptom rather than the cause.
//
// KEEPING BOTH SIDES (read this before touching the numbers below). The two
// failures pull in opposite directions and a single timer cannot hold both:
// widening "recent enough" until a lazily-loaded modal fits starts protecting
// the late hand-rolled intro again, and that is the permanent lock. So the
// window is not widened - a SECOND, independent fact is added, one that the
// two cases genuinely differ in: whether the visitor had been USING the page
// when the lock appeared. An intro claims the page from first paint, so the
// page under it has never been scrolled and the gestures around it land in
// the first moments of a page load (the cookie bar, the nav link, the stray
// tap). A modal is opened out of a page the visitor has been reading and
// scrolling. So a gesture explains a lock immediately on ANY page, and for
// several seconds - long enough for a React.lazy chunk on a slow connection -
// only on a page that was demonstrably in use. The residual hole is narrow and
// deliberate: a hand-rolled intro that locks more than a second after a
// gesture made on a page the visitor had already been using for a while is
// left alone. On that page the evidence really does read as an overlay, and
// scrolling the page out from under an overlay the visitor opened is the worse
// of the two bugs.
// ---------------------------------------------------------------------------
// Direct visitor input. A family missing from these lists is not a cosmetic
// gap: a desktop scroll-depth modal is opened by a WHEEL and nothing else, so
// a list that stopped at taps and keys judged that modal uncaused and stripped
// it off the visitor's screen twelve seconds after it opened.
const SG_TAP_EVENTS = ['pointerdown', 'mousedown', 'touchstart', 'keydown'];
// Input that IS scrolling: cause evidence like any other gesture, and also the
// proof that the visitor has been moving around the page (see pageWasInUse).
const SG_SCROLL_INPUT_EVENTS = ['wheel', 'touchmove'];
// The page MOVED - which window.scrollTo() does as readily as a visitor does
// (scroll restoration, a #hash jump, this net handing a frozen page its offset
// back). Not input, so it counts only once the page has settled; before that
// it is the browser's own load-time scrolling, and reading it as the visitor
// would hand an intro lock landing 300ms into the load a perfect alibi.
const SG_PAGE_MOVED_EVENTS = ['scroll'];
// How long after a gesture a new lock can still be that gesture's doing. A modal
// locks the page inside the click handler or a frame later, so this only has to
// cover the handler plus the one poll interval it can take the net to NOTICE the
// lock. Anything slower than this did not follow the gesture, it merely happened
// after it - unless the page was already in use, see below.
const SG_GESTURE_CAUSE_MS = 1000;
// The same question on a page the visitor had been using, where the overlay may
// still be fetching its chunk when the click handler returns. Long enough for a
// React.lazy modal on a slow connection; short enough that it is still one
// interaction and not "some time this session".
const SG_GESTURE_CAUSE_LAZY_MS = 4000;
// How long a page has to have been up before a gesture on it reads as "the
// visitor is using this page" rather than "the visitor arrived and poked at it
// while it was still assembling itself".
const SG_PAGE_IN_USE_MS = 1500;
let netArmedAt = Number.NEGATIVE_INFINITY;
let lastFreeGestureAt = Number.NEGATIVE_INFINITY;
let visitorHasScrolled = false;
let lastScrollOffset: number | null = null;

function sgNow(): number {
  return typeof Date !== 'undefined' && typeof Date.now === 'function' ? Date.now() : 0;
}

type SgGestureKind = 'tap' | 'scroll' | 'moved';

/**
 * THE one place visitor evidence is recorded. Every listener below, and the
 * polled offset check, funnel through here - so the three guards that make
 * the evidence mean anything (a gesture on an ALREADY locked page is the
 * symptom of the lock, not its cause; a page that moves before it has settled
 * moved on its own; a page the NET moved is not the visitor moving it) hold
 * for every source there is, including the next one somebody adds.
 */
function noteVisitorGesture(kind: SgGestureKind) {
  if (isPageScrollLocked()) return;
  const at = sgNow();
  if (kind === 'moved') {
    if (at - netArmedAt < SG_PAGE_IN_USE_MS) return;
    // The page moved because WE moved it (withPageWrites / scrollTheWindow):
    // undoing a freeze, and the offset handed back with it. Counting that as
    // the visitor is how the net came to lock a page permanently by itself.
    if (at < selfInflictedScrollUntil) return;
  }
  lastFreeGestureAt = at;
  if (kind !== 'tap') visitorHasScrolled = true;
}

/**
 * Has the visitor been USING this page, or waiting on it? Either fact settles
 * it, and both are things an intro cannot be true of: the page has been
 * SCROLLED (an intro covers it, so nothing under one gets scrolled), or the
 * gesture landed on a page that had been sitting there usable for a while (an
 * intro claims the page from first paint, so the gestures around one are the
 * first-moments taps that the late-intro rescue exists for).
 */
function pageWasInUse(): boolean {
  if (visitorHasScrolled) return true;
  return lastFreeGestureAt - netArmedAt >= SG_PAGE_IN_USE_MS;
}

/** The verdict, from the evidence as it stands the moment a lock appears. */
function lockCausedByVisitor(): boolean {
  const sinceGesture = sgNow() - lastFreeGestureAt;
  if (sinceGesture <= SG_GESTURE_CAUSE_MS) return true;
  return pageWasInUse() && sinceGesture <= SG_GESTURE_CAUSE_LAZY_MS;
}

/**
 * The backstop for the event lists: the page's own scroll offset. If it has
 * moved while the page was free then the visitor has been moving around the
 * page, and that is true whatever the event was called - so an input family
 * nobody listed cannot silently cost the net its evidence. Polled from the
 * net's own interval, the one place that is guaranteed to run.
 */
function observePageScrollOffset() {
  if (typeof window === 'undefined' || typeof window.scrollY !== 'number') return;
  const previous = lastScrollOffset;
  lastScrollOffset = window.scrollY;
  if (previous === null || previous === window.scrollY) return;
  noteVisitorGesture('moved');
}

function watchForUserGesture(): () => void {
  if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') {
    return () => {};
  }
  const bound: Array<[string, () => void]> = [];
  const bind = (types: readonly string[], kind: SgGestureKind) => {
    types.forEach((type) => {
      const handler = () => noteVisitorGesture(kind);
      bound.push([type, handler]);
      // Capture phase: a modal that stops propagation on its own trigger must
      // not also hide the gesture that opened it.
      document.addEventListener(type, handler, true);
    });
  };
  bind(SG_TAP_EVENTS, 'tap');
  bind(SG_SCROLL_INPUT_EVENTS, 'scroll');
  bind(SG_PAGE_MOVED_EVENTS, 'moved');
  return () => {
    bound.forEach(([type, handler]) => document.removeEventListener(type, handler, true));
  };
}

// ---------------------------------------------------------------------------
// The lock EPISODE: one continuous stretch of unscrollable page, from the tick
// it appears to the tick the page is scrollable again. It is the only thing the
// net reasons about, and it exists because every version of this net that
// re-derived its verdict from live globals on every tick got the verdict wrong
// eventually: the flags it read - has the visitor gestured, is the intro gate
// open - describe the page NOW, while the question they were answering (who
// put this lock here) was settled the moment the lock appeared and cannot
// change afterwards.
//
// So the evidence is snapshotted ONCE, when the episode opens, and the deadline
// verdict is read off that snapshot. A gesture made later cannot retro-actively
// claim a lock that was already up; an intro that leaks its gate open cannot
// hand the net an excuse to strip the modal the visitor opened afterwards.
// ---------------------------------------------------------------------------
type SgLockEpisode = {
  /** How long this one lock has been continuously in place. */
  heldMs: number;
  /** How long we have been throwing !important overrides at it. */
  forcedMs: number;
  /** Snapshot: a visitor gesture immediately preceded this lock. */
  visitorCaused: boolean;
};
let lockEpisode: SgLockEpisode | null = null;

/**
 * Advance the current episode, opening one if the page has just locked and
 * ending it if the page is free. Returns the episode while the page is locked,
 * null while it is not. THE single place that judges a lock.
 */
function syncLockEpisode(elapsedMs: number): SgLockEpisode | null {
  if (!isPageScrollLocked()) {
    // Free again (an intro that finished, a modal the visitor closed). The next
    // lock is a NEW episode with its own evidence and its own deadline, which is
    // what keeps a legitimate short intro - or two back-to-back overlays - from
    // ever being counted as one stuck page.
    lockEpisode = null;
    return null;
  }
  if (!lockEpisode) {
    lockEpisode = {
      heldMs: 0,
      forcedMs: 0,
      visitorCaused: lockCausedByVisitor(),
    };
  }
  lockEpisode.heldMs += elapsedMs;
  return lockEpisode;
}

/**
 * Last-resort safety net, armed when this module loads and again from the app
 * entry (_app.tsx / main.tsx). For a bounded window after load it watches for a
 * lock - in ANY of its shapes - that outlasts the deadline, and frees it. A lock
 * applied long after the net armed is still rescued; a lock that releases itself
 * in time is never touched; and a lock the VISITOR caused is never touched at
 * all (see the episode above - the verdict is the snapshot taken when the lock
 * appeared, never a re-reading of the page as it is now).
 */
export function installIntroScrollLockSafetyNet(
  deadlineMs: number = SG_STUCK_LOCK_MS,
  watchMs: number = SG_STUCK_WATCH_MS,
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (safetyNetArmed) return;
  safetyNetArmed = true;
  let timer = 0;
  const stopGestureWatch = watchForUserGesture();
  const disarm = () => {
    safetyNetArmed = false;
    stopGestureWatch();
    if (timer) window.clearInterval(timer);
  };
  let watched = 0;
  // Whatever an earlier net left behind is not this page load's episode - and
  // neither is its evidence. Arming is this page's first paint as far as the
  // net is concerned, and every "how long has the page been up" question below
  // is measured from here.
  lockEpisode = null;
  netArmedAt = sgNow();
  lastFreeGestureAt = Number.NEGATIVE_INFINITY;
  visitorHasScrolled = false;
  lastScrollOffset = null;
  timer = window.setInterval(() => {
    watched += SG_STUCK_POLL_MS;
    // Evidence first, verdict second: the episode below snapshots what is known
    // the moment the lock appears, so anything this tick can still learn about
    // the visitor has to be learned before the snapshot is taken.
    observePageScrollOffset();
    const episode = syncLockEpisode(SG_STUCK_POLL_MS);
    if (!episode) {
      // Scrollable. Stop watching only BETWEEN locks - a lock still running when
      // the window closes keeps its deadline instead of being abandoned
      // mid-count.
      if (watched >= watchMs) disarm();
      return;
    }
    // Hands off a lock the visitor opened - stripping it would scroll the page
    // behind an overlay they are reading. Read from the episode snapshot, never
    // re-derived here: the answer belongs to the moment the lock appeared.
    if (episode.visitorCaused) {
      // Nothing is left to rescue once the arrival window has closed.
      if (watched >= watchMs) disarm();
      return;
    }
    if (episode.heldMs < deadlineMs) return;
    releasePageScrollLock();
    openIntroGate();
    // RE-CHECK, always. The release reaches inline styles, our own class names
    // and the position:fixed freeze - not a stylesheet rule. Disarming on the
    // ATTEMPT (the old order: disarm, then release) is exactly how a stylesheet
    // lock kept a page frozen for good, with no timer left to try again. The net
    // stays armed either way and only ever stops from the free branch above,
    // once the page is demonstrably scrollable.
    if (!isPageScrollLocked()) return;
    forcePageScrollable();
    episode.forcedMs += SG_STUCK_POLL_MS;
    if (!isPageScrollLocked()) return;
    // Still locked after an !important override: something is re-applying the
    // lock, this net cannot outbid it, and retrying forever only costs a timer.
    if (episode.forcedMs >= SG_STUCK_FORCE_MS) disarm();
  }, SG_STUCK_POLL_MS);
}

installIntroScrollLockSafetyNet();

export type IntroStage = 'in' | 'out' | 'done';

export type IntroSheetProps = {
  /** The intro visuals. A node, or a function of the current stage. */
  children?: React.ReactNode | ((stage: IntroStage) => React.ReactNode);
  /** sheet background (default real black) */
  bg?: string;
  /** ms the visuals hold before the sheet leaves (default 1275) */
  hold?: number;
  /** how the sheet leaves (default a slide up) */
  exit?: 'slide-up' | 'fade';
  /** extra classes on the sheet (lay your visuals out here) */
  className?: string;
  onDone?: () => void;
};

/**
 * The intro SHELL, and the documented extension point for a bespoke intro: it
 * owns everything that is easy to get wrong (the stage machine, the intro gate,
 * the scroll lock and every release path) and you own only the visuals.
 *
 *   import { IntroSheet } from '@/components/ui/intro';
 *
 *   export function MyIntro({ onDone }: { onDone?: () => void }) {
 *     return (
 *       <IntroSheet bg="#0b0b0b" hold={1100} onDone={onDone}>
 *         <MyLogoDraw />
 *       </IntroSheet>
 *     );
 *   }
 *
 * Do NOT hand-roll the stage machine and do NOT set document.body.style.overflow
 * yourself: a stage that never reaches its end state leaves the page locked
 * forever (unscrollable page, hero stuck behind its blur). If you truly need
 * your own shell, compose useIntroScrollLock() + openIntroGate() instead - both
 * release unconditionally.
 */
export function IntroSheet({
  children,
  bg = "#000",
  hold = 1275,
  exit = "slide-up",
  className,
  onDone,
}: IntroSheetProps) {
  const reduce = useReducedMotion();
  const [stage, setStage] = React.useState<IntroStage>('in');

  // Gate the Reveal primitives while the sheet covers the page (render-time so
  // sibling reveals mounting in the same pass see it; client only).
  if (typeof window !== 'undefined' && !reduce && stage !== 'done') {
    sgIntroGate.active = true;
  }

  // The page is held still by the primitive, never by this component: it
  // releases on 'done', on unmount and on its own timeout.
  useIntroScrollLock(stage !== 'done');

  const finish = React.useCallback(() => {
    setStage('done');
    openIntroGate();
    onDone?.();
  }, [onDone]);

  React.useEffect(() => {
    if (reduce) {
      finish();
      return;
    }
    const toOut = window.setTimeout(() => setStage('out'), hold);
    // Backstop: finish even if the exit animation never reports completion.
    const toDone = window.setTimeout(finish, hold + INTRO_EXIT_MS + 400);
    return () => {
      window.clearTimeout(toOut);
      window.clearTimeout(toDone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unmount safety: never leave the page reveals gated.
  React.useEffect(() => {
    return () => {
      openIntroGate();
    };
  }, []);

  if (stage === 'done') return null;
  const visuals = typeof children === "function" ? children(stage) : children;
  return (
    <motion.div
      aria-hidden
      className={cn("fixed inset-0 flex items-center justify-center", className)}
      style={{ background: bg, zIndex: 100, pointerEvents: 'none', willChange: 'transform, opacity' }}
      initial={exit === "fade" ? { opacity: 1 } : { y: "0%" }}
      animate={
        exit === "fade"
          ? { opacity: stage === "out" ? 0 : 1 }
          : { y: stage === "out" ? "-100%" : "0%" }
      }
      transition={{ duration: INTRO_EXIT_MS / 1000, ease: INTRO_EASE }}
      onAnimationComplete={() => {
        if (stage === "out") finish();
      }}
    >
      {visuals}
    </motion.div>
  );
}

/**
 * Curtain-wordmark intro: a full-screen solid sheet holds
 * a large wordmark that springs in letter-by-letter, holds, then the whole sheet
 * slides up to reveal the page. Best for bold / condensed brands. Reduced-motion
 * is skipped (calls onDone immediately, renders nothing). Pure visuals on top of
 * IntroSheet - re-skin it, or swap the wordmark for your own artwork by using
 * IntroSheet directly.
 */
export function IntroCurtain({
  word,
  bg = "#000",
  color = "#fff",
  textClassName,
  hold = 1275,
  onDone,
}: {
  word: string;
  /** sheet background (default real black) */
  bg?: string;
  /** wordmark color (default white) */
  color?: string;
  /** class for the wordmark (set the display font here, e.g. a condensed face) */
  textClassName?: string;
  /** ms the wordmark holds before the slide-up (default 1275) */
  hold?: number;
  onDone?: () => void;
}) {
  return (
    <IntroSheet bg={bg} hold={hold} onDone={onDone}>
      <div
        className={cn("flex items-center uppercase", textClassName)}
        style={{ color, lineHeight: 1, letterSpacing: '0.01em', fontSize: 'clamp(56px, 13vw, 168px)' }}
      >
        {word.split("").map((ch, i) => (
          <motion.span
            key={i}
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
            initial={{ opacity: 0, y: 34, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 290, delay: i * 0.06 }}
          >
            {ch === " " ? NBSP : ch}
          </motion.span>
        ))}
      </div>
    </IntroSheet>
  );
}

/**
 * Clip-path expand intro (the AURION pattern): a full-screen loader shows the
 * hero media clipped to a centered rounded window, which expands to full-bleed,
 * then the loader fades out to reveal the real hero. Pass the hero media (a
 * full-bleed <video> / <img>) as children, and render the same media in the hero
 * beneath. Best for cinematic photo / video heroes. Reduced-motion is skipped.
 */
export function IntroReveal({
  children,
  bg = "#000",
  onDone,
}: {
  children: React.ReactNode;
  /** loader background shown around the window before it expands (default black) */
  bg?: string;
  onDone?: () => void;
}) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);

  // Gate the Reveal primitives while the loader covers the page (render-time
  // so sibling reveals mounting in the same pass see it; client only).
  if (typeof window !== 'undefined' && !reduce && visible) {
    sgIntroGate.active = true;
  }

  React.useEffect(() => {
    if (reduce) {
      setVisible(false);
      openIntroGate();
      onDone?.();
      return;
    }
    const t1 = window.setTimeout(() => setExpanded(true), 600);
    const t2 = window.setTimeout(() => {
      setVisible(false);
      openIntroGate();
      onDone?.();
    }, 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unmount safety: never leave the page reveals gated.
  React.useEffect(() => {
    return () => {
      openIntroGate();
    };
  }, []);

  // Same guarantee as the curtain: the loader cannot leave the page locked.
  useIntroScrollLock(visible);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-loader"
          aria-hidden
          className="fixed inset-0"
          style={{ background: bg, zIndex: 100 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, clipPath: "inset(25% 20% 25% 20% round 24px)" }}
            animate={
              expanded
                ? { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" }
                : { opacity: 1, clipPath: "inset(25% 20% 25% 20% round 24px)" }
            }
            transition={{ duration: expanded ? 1.4 : 1.2, ease: INTRO_EASE }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
