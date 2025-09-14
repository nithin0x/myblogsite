import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/about_me/intro">
            About Me →
          </Link>
        </div>
      </div>
    </header>
  );
}

// This is the new component for your intro text
function HomepageIntroduction() {
  return (
    <div className={styles.intro}>
      <div className="container text--center">
        {/* Using the Heading component for consistency */}
        <Heading as="h2" className={styles.introHeading}></Heading>
  
      </div>
    </div>
  );
}


export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome`}
      description="Nithin's cybersecurity blog and open notebook for CTF write-ups, cloud security labs, and AI security research.">
        
      <HomepageHeader />
      <main>
        {/* The new intro section is called here */}
        <HomepageIntroduction /> 
        <HomepageFeatures />
      </main>
    </Layout>
  );
}