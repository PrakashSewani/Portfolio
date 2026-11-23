import { useEffect, useState } from 'react';
import { profile } from '../../data/profile';
import { languageCounts, projects } from '../../data/projects';
import { useZonedClock } from '../../lib/motion';
import { ArrowDown, ArrowUpRight } from '../Icons';
import BootReadout from './BootReadout';
import StackDiagram from './StackDiagram';

/** The boot sequence plays once per page load; coming back to the home page from a case does not replay it. */
let booted = false;

export default function ColdStart() {
  const [boot] = useState(() => !booted);
  useEffect(() => {
    booted = true;
  }, []);
  const time = useZonedClock(profile.timeZone);
  const languages = languageCounts().length;

  return (
    <section id="top" className={boot ? 'hero is-booting' : 'hero'} aria-labelledby="hero-name">
      <div className="hero-grid wrap">
        <div className="hero-copy">
          <p className="hero-eyebrow label">
            <span className="hero-live" aria-hidden="true" />
            Software engineer · {profile.city}, India ·{' '}
            <time aria-label={`${time} in ${profile.city}`}>{time} IST</time>
          </p>
          <h1 id="hero-name" className="hero-name">
            <span>Prakash</span> <span>Sewani</span>
          </h1>
          <p className="hero-statement">{profile.statement}</p>
          <p className="hero-sub">
            {profile.role} at {profile.company} · {projects.length} projects of my own, in {languages} languages
          </p>
          <div className="hero-cta">
            <a className="btn btn-signal" href="#work" data-link>
              Read the case files <ArrowDown />
            </a>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight />
            </a>
          </div>
        </div>
        <div className="hero-stack">
          <StackDiagram boot={boot} />
        </div>
      </div>
      <div className="wrap">
        <BootReadout />
      </div>
    </section>
  );
}
