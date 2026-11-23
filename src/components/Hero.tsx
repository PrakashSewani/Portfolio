import { languageCounts, projects } from '../data/projects';
import { profile } from '../data/profile';
import { ArrowDown, ArrowUpRight } from './Icons';
import TelemetryPanel from './TelemetryPanel';

export default function Hero() {
  const shipped = projects.filter((p) => p.status === 'shipped').length;
  const langs = languageCounts();

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-copy">
        <p className="status-pill reveal">
          <i className="dot" aria-hidden="true" />
          {profile.availability}
        </p>
        <h1 id="hero-title" className="reveal">
          Software from the <em>sensor</em> to the <em>screen</em>.
        </h1>
        <p className="lede reveal">{profile.summary}</p>
        <div className="cta-row reveal">
          <a className="btn btn-primary" href="/#contact" data-link>
            Get in touch
          </a>
          <a className="btn" href={profile.resume} target="_blank" rel="noreferrer">
            Résumé <ArrowUpRight size={16} />
          </a>
          <a className="btn btn-ghost" href="/#work" data-link>
            See the work <ArrowDown size={16} />
          </a>
        </div>
      </div>

      <div className="wrap reveal">
        <TelemetryPanel />
      </div>

      <div className="wrap">
        <ul className="facts reveal" aria-label="At a glance">
          <li>
            <b>{projects.length}</b> projects built and written up
          </li>
          <li>
            <b>{shipped}</b> shipped
          </li>
          <li>
            <b>4+</b> years in production software
          </li>
          <li className="facts-langs">
            {langs.slice(0, 5).map(([name, n]) => (
              <span key={name}>
                {name} <sup>{n}</sup>
              </span>
            ))}
          </li>
        </ul>
      </div>
    </section>
  );
}
