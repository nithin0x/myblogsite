import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// TODO: Consider replacing these default SVGs with more relevant icons
const FeatureList = [
  {
    title: 'Offensive Security & Pen-Testing',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Explore detailed insights from real-world penetration tests across web,
        cloud, and Active Directory environments.
      </>
    ),
  },
  {
    title: 'Cybersecurity Research & Insights',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Dive into blog posts and articles covering emerging threats, defensive
        strategies, and the latest trends in the cybersecurity landscape.
      </>
    ),
  },
  {
    title: 'Professional Skills & Journey',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Learn about my professional background, technical skills, and the
        certifications that drive my work in securing digital infrastructures.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}