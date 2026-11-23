import { career, certifications, principles } from '../data/profile';
import { ArrowUpRight } from './Icons';

export default function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="exp-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <span className="sec-no">03 / Experience</span>
          <h2 id="exp-title">
            Four years in, <em>senior</em> for the last one.
          </h2>
        </header>

        <div className="exp-grid">
          <ol className="timeline reveal">
            {career.map((c) => (
              <li key={c.title + c.period} data-kind={c.kind}>
                <span className="timeline-period">{c.period}</span>
                <div>
                  <h3>{c.title}</h3>
                  <p className="timeline-place">{c.place}</p>
                  <ul>
                    {c.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <aside className="exp-side">
            <div className="reveal">
              <span className="label">How I work</span>
              <ol className="principles">
                {principles.map(([title, body]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="reveal">
              <span className="label">Certifications</span>
              <ul className="certs">
                {certifications.map((c) => (
                  <li key={c.title}>
                    <a href={c.href} target="_blank" rel="noreferrer">
                      {c.title} <ArrowUpRight size={13} />
                    </a>
                    <span>{c.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
