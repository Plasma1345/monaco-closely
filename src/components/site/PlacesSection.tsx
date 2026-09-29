import Link from 'next/link';
import styles from '@/styles/Monaco.module.css';

const places = [
  {
    number: '01',
    name: 'Monaco-Ville',
    label: 'The old town',
    description: 'A hilltop tangle of quiet lanes, palace views and gardens above the Mediterranean.',
    image: '/assets/images/monaco-prince-palace.jpg',
    alt: 'The Prince’s Palace overlooking Monaco-Ville',
    anchor: 'monaco-ville',
  },
  {
    number: '02',
    name: 'Monte-Carlo',
    label: 'Belle Époque & gardens',
    description: 'The Casino square, leafy terraces, grand façades and a little theatre in the everyday.',
    image: '/assets/images/monte-carlo-casino.jpg',
    alt: 'The Casino de Monte-Carlo and its Belle Époque architecture',
    anchor: 'monte-carlo',
  },
  {
    number: '03',
    name: 'La Condamine',
    label: 'By the harbour',
    description: 'A lived-in neighbourhood of colourful streets, familiar cafés and Port Hercule close by.',
    image: '/assets/images/monaco-port-yachts.jpg',
    alt: 'Yachts in Port Hercule with Monaco rising above the Mediterranean',
    anchor: 'la-condamine',
  },
  {
    number: '04',
    name: 'Larvotto',
    label: 'The seaside',
    description: 'A coastal promenade, gardens and open water: an easy invitation to linger by the sea.',
    image: '/assets/images/monaco-larvotto-coast.jpg',
    alt: 'Mediterranean water and coastal pines near Monaco',
    anchor: 'larvotto',
  },
];

export default function PlacesSection() {
  return (
    <section className={styles.placesSection} id="neighborhoods">
      <div className={styles.contentWidth}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.sectionLabel}>Four ways into the city</span>
            <h2>A few places to begin.</h2>
          </div>
          <p>Each quarter has its own rhythm. They’re close enough to let the day change as you go.</p>
          <Link className={styles.textLink} href="/neighborhoods">See all four <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.placesGrid}>
          {places.map((place) => (
            <Link className={styles.placeCard} href={`/neighborhoods#${place.anchor}`} key={place.number}>
              <div className={styles.placeImageWrap}>
                <img className={styles.placeImage} src={place.image} alt={place.alt} loading="lazy" />
                <span className={styles.placeNumber}>{place.number}</span>
              </div>
              <div className={styles.placeText}>
                <span className={styles.placeMeta}>{place.label}</span>
                <h3>{place.name}</h3>
                <p>{place.description}</p>
                <div className={styles.placeRead}><span>Explore this quarter</span><span aria-hidden="true">↗</span></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
