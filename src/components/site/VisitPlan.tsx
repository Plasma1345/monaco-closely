import styles from '@/styles/Monaco.module.css';

const planningCards = [
  {
    number: '01',
    title: 'Arrive with a little slack',
    text: 'The Monaco–Monte-Carlo station connects the principality to the French rail network. If you are flying, compare current onward options from Nice Côte d’Azur before you book.',
    link: 'https://www.visitmonaco.com/en',
    linkText: 'Official visitor information',
  },
  {
    number: '02',
    title: 'Make the hills easier',
    text: 'Walk where it feels right, then use Monaco’s public lifts, escalators and local buses to bridge the steeper parts. Check the live line map on the day.',
    link: 'https://www.cam.mc/en',
    linkText: 'CAM routes & live times',
  },
  {
    number: '03',
    title: 'Keep plans flexible',
    text: 'Museums, gardens and event venues can have different seasonal hours. Check each official site for current opening times, access and ticket details.',
    link: 'https://www.visitmonaco.com/en',
    linkText: 'Browse official Monaco guides',
  },
];

const route = [
  { time: 'Morning', title: 'Monaco-Ville', text: 'Begin with the old town and its gardens above the sea.' },
  { time: 'Midday', title: 'La Condamine & Port Hercule', text: 'Come down from the Rock and make room for an easy lunch by the harbour.' },
  { time: 'Afternoon', title: 'The seaside', text: 'Continue toward the Japanese Garden and the Larvotto waterfront.' },
  { time: 'Evening', title: 'Monte-Carlo', text: 'Finish among the gardens and façades around Place du Casino.' },
];

export default function VisitPlan() {
  return (
    <div className={`${styles.contentWidth} ${styles.pageContent}`}>
      <div className={styles.pageLead}>
        <span className={styles.eyebrow}>A few useful things to know</span>
        <h2>Plan lightly. Leave room for the view.</h2>
        <p>Monaco is wonderfully compact, but its streets climb and turn. A simple plan and comfortable shoes go a long way.</p>
      </div>

      <div className={styles.visitGrid}>
        {planningCards.map((card) => (
          <article className={styles.visitCard} key={card.number}>
            <span>{card.number} / Before you go</span>
            <div><h2>{card.title}</h2><p>{card.text}</p></div>
            <a href={card.link} target="_blank" rel="noreferrer">{card.linkText}<span aria-hidden="true">↗</span></a>
          </article>
        ))}
      </div>

      <section className={styles.routePanel} aria-labelledby="first-day-route">
        <div>
          <span className={styles.sectionLabel}>A gentle first itinerary</span>
          <h2 id="first-day-route">Follow the water, then the light.</h2>
          <p>A flexible route that links the old town, harbour and coast without trying to fit everything into one day.</p>
        </div>
        <ol className={styles.routeSteps}>
          {route.map((stop, index) => (
            <li key={stop.time}>
              <b>0{index + 1}</b>
              <div><strong>{stop.time} · {stop.title}</strong><span>{stop.text}</span></div>
            </li>
          ))}
        </ol>
      </section>

      <p className={styles.officialNote}>
        Use the{' '}
        <a href="https://www.visitmonaco.com/Documents-Site/7495/Plan%20VisitMonaco%20-%202024.pdf" target="_blank" rel="noreferrer">official visitor map ↗</a>
        {' '}for landmarks and public connections, and{' '}
        <a href="https://www.cam.mc/en" target="_blank" rel="noreferrer">check CAM ↗</a>
        {' '}for current bus lines and times. Details can change; confirm opening hours and services before setting out.
      </p>
    </div>
  );
}
