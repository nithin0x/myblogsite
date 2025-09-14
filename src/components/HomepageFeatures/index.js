import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// TODO: Consider replacing these default SVGs with more relevant icons
const FeatureList = [
  {
    title: 'Offensive Security',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Ever wonder how things break? Follow along as I share stories and tactics
        from my adventures in web, cloud, and Active Directory penetration testing.
      </>
    ),
  },
  {
    title: 'Defensive Security',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        It's not just about attacking; it's about building stronger walls. Here, we'll
        put on the blue team hat and learn how to defend our systems from real threats.
      </>
    ),
  },
  {
    title: 'Tools & Troubleshooting',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        For those moments when you're stuck on a tricky Linux problem or just need a new tool.
        This is my collection of favorite commands, scripts, and software.
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