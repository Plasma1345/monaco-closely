import styles from '@/styles/Monaco.module.css';

const districts = [
  {
    id: 'monaco-ville',
    number: '01 / The Rock',
    name: 'Monaco-Ville',
    description: 'The historic quarter sits high on the Rock. Come for the palace square, the cathedral, cliffside gardens and the Oceanographic Museum, then take your time in the side streets.',
    image: '/assets/images/monaco-prince-palace.jpg',
    alt: 'The Prince’s Palace overlooking Monaco-Ville',
    position: 'center 46%',
    map: 'Monaco-Ville, Monaco',
  },
  {
    id: 'la-condamine',
    number: '02 / The harbour quarter',
    name: 'La Condamine',
    description: 'Colourful streets meet Port Hercule here. Follow Rue Grimaldi toward the water, pause around Place d’Armes and watch the harbour change through the day.',
    image: '/assets/images/monaco-port-yachts.jpg',
    alt: 'Yachts in Port Hercule with Monaco rising above the Mediterranean',
    position: 'center 50%',
    map: 'La Condamine, Monaco',
  },
  {
    id: 'monte-carlo',
    number: '03 / The grand quarter',
    name: 'Monte-Carlo',
    description: 'Around Place du Casino, formal gardens and Belle Époque façades turn a simple stroll into an occasion. Slip onto the quieter streets when the square gets busy.',
    image: '/assets/images/monte-carlo-casino.jpg',
    alt: 'The Casino de Monte-Carlo and its Belle Époque architecture',
    position: 'center 42%',
    map: 'Monte-Carlo, Monaco',
  },
  {
    id: 'larvotto',
    number: '04 / The seaside',
    name: 'Larvotto',
    description: 'For a change of pace, follow the Mediterranean promenade. The Japanese Garden and Grimaldi Forum are nearby, with the beach and waterfront opening out ahead.',
    image: '/assets/images/monaco-larvotto-coast.jpg',
    alt: 'Mediterranean water framed by coastal pines near Monaco',
    position: 'center 49%',
    map: 'Larvotto, Monaco',
  },
];

export default function NeighborhoodGrid() {
  return (
    <div className={styles.contentWidth}>
      <div className={styles.districtList}>
        {districts.map((district) => (
          <article className={styles.districtFeature} id={district.id} key={district.id}>
            <img
              className={styles.districtPhoto}
              src={district.image}
              alt={district.alt}
              style={{ objectPosition: district.position }}
              loading="lazy"
            />
            <div className={styles.districtContent}>
              <span>{district.number}</span>
              <h2>{district.name}</h2>
              <p>{district.description}</p>
              <a className={styles.districtMeta} href={`https://maps.google.com/?q=${encodeURIComponent(district.map)}`} target="_blank" rel="noreferrer">
                <span>Find it on the map</span><span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
