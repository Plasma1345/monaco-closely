import styles from '@/styles/Monaco.module.css';

type PageBannerProps = {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  displayWord: string;
  imagePosition?: string;
};

export default function PageBanner({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  displayWord,
  imagePosition = 'center 52%',
}: PageBannerProps) {
  return (
    <section className={styles.pageBanner}>
      <img className={styles.pageBannerPhoto} src={image} alt={imageAlt} style={{ objectPosition: imagePosition }} />
      <div className={styles.pageBannerShade} />
      <div className={styles.pageBannerCopy}>
        <span className={styles.heroEyebrow}><i /> {eyebrow}</span>
        <h1>{title}</h1>
        <p>{lead}</p>
      </div>
      <div className={styles.pageBannerWord} aria-hidden="true">{displayWord}</div>
    </section>
  );
}
