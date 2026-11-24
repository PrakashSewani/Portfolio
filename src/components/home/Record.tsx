import { career, certifications } from '../../data/profile';
import { ArrowUpRight } from '../Icons';

/** The years as a ruler from the first entry to now, with each role and the degree as a span on it. */
function Ruler() {
  const start = Math.min(...career.map((c) => c.from));
  const now = new Date().getFullYear() + 1;
  const span = now - start;
  const years = Array.from({ length: span + 1 }, (_, i) => start + i);
  const pos = (year: number) => `${((year - start) / span) * 100}%`;

  return (
    <div className="ruler" aria-hidden="true">
      <div className="ruler-track">
        {career.map((c) => (
          <span
            key={c.title}
            className={c.to === null ? `ruler-span is-${c.kind} is-now` : `ruler-span is-${c.kind}`}
            style={{ left: pos(c.from), width: `calc(${pos(c.to ?? now)} - ${pos(c.from)})` }}
          />
        ))}
      </div>
      <div className="ruler-ticks">
        {years.map((y) => (
          <span key={y} style={{ left: pos(y) }}>
            {y === now ? '' : `’${String(y).slice(2)}`}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Record() {
  return (
    <section id="record" className="section record" aria-labelledby="record-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <p className="sec-index label">05 — Experience</p>
          <h2 id="record-title" className="sec-title">
            Experience
          </h2>
        </header>

        <div className="reveal">
          <Ruler />
        </div>

        <div className="record-grid">
          <ol className="record-list">
            {career.map((c) => (
              <li key={c.title} className="record-item reveal">
                <p className="record-period">{c.period}</p>
                <div>
                  <h3 className="record-title">{c.title}</h3>
                  <p className="record-place">{c.place}</p>
                  <ul className="record-points">
                    {c.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <aside className="record-certs reveal" aria-labelledby="certs-title">
            <h3 id="certs-title" className="label">
              Certifications
            </h3>
            <ul>
              {certifications.map((c) => (
                <li key={c.title}>
                  <a href={c.href} target="_blank" rel="noreferrer">
                    <span>{c.title}</span>
                    <span className="record-cert-date">
                      {c.date} <ArrowUpRight size={14} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
