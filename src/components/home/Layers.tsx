import { LAYERS_TOP_DOWN } from '../../data/layers';
import { caseNumber, projectsInLayer } from '../../data/projects';
import { useActiveId } from '../../lib/motion';
import type { LayerId } from '../../lib/projects';
import LayerMark from '../LayerMark';

const IDS = LAYERS_TOP_DOWN.map((l) => `layer-${l.id}`);

/** What I work on, read as a cross-section from the surface down. A sticky gauge lights the layer in view. */
export default function Layers() {
  const activeId = useActiveId(IDS, true, 0.5);
  const active = (activeId?.replace('layer-', '') ?? LAYERS_TOP_DOWN[0].id) as LayerId;
  const current = LAYERS_TOP_DOWN.find((l) => l.id === active) ?? LAYERS_TOP_DOWN[0];

  return (
    <section id="layers" className="section layers" aria-labelledby="layers-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <p className="sec-index label">02 — Layers</p>
          <h2 id="layers-title" className="sec-title">
            What I work on
          </h2>
          <p className="sec-lede">
            I group my work into five layers, from the hardware up to the interface. Many of my projects touch more than one.
          </p>
        </header>

        <div className="layers-grid">
          {/* Phones only: the gauge as a bar pinned under the header while the section is in view. */}
          <div className="tracker" aria-hidden="true">
            <LayerMark lit={[current.id]} size={28} className="tracker-mark" />
            <span className="tracker-n">{current.n} / 05</span>
            <span key={current.id} className="tracker-name">
              {current.name}
            </span>
            <span className="tracker-steps">
              {LAYERS_TOP_DOWN.map((l, i) => (
                <span key={l.id} className={i <= LAYERS_TOP_DOWN.indexOf(current) ? 'is-lit' : undefined} />
              ))}
            </span>
          </div>

          <aside className="gauge" aria-hidden="true">
            <div className="gauge-inner">
              <LayerMark lit={[current.id]} size={148} className="gauge-mark" />
              <p className="gauge-n">{current.n} / 05</p>
              <p className="gauge-name">{current.name}</p>
            </div>
          </aside>

          <div className="layers-list">
            {LAYERS_TOP_DOWN.map((layer) => {
              const here = projectsInLayer(layer.id);
              return (
                <article key={layer.id} id={`layer-${layer.id}`} className={layer.id === active ? 'layer is-active' : 'layer'} aria-labelledby={`layer-${layer.id}-title`}>
                  <header className="layer-head">
                    <span className="layer-n">{layer.n}</span>
                    <div className="layer-title">
                      <h3 id={`layer-${layer.id}-title`} className="layer-name">
                        {layer.name}
                      </h3>
                      <p className="layer-line">{layer.line}</p>
                    </div>
                    <LayerMark lit={[layer.id]} size={36} className="layer-mark" />
                  </header>
                  <p className="layer-blurb prose">{layer.blurb}</p>
                  <dl className="layer-spec">
                    <div>
                      <dt className="label">Tools</dt>
                      <dd className="layer-tech">
                        {layer.tech.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </dd>
                    </div>
                    {layer.atWork && (
                      <div>
                        <dt className="label">At work</dt>
                        <dd>{layer.atWork}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="label">
                        Projects <span className="layer-count">{here.length}</span>
                      </dt>
                      <dd className="layer-projects">
                        {here.map((p) => {
                          const n = caseNumber(p);
                          return (
                            <a key={p.slug} href={`/projects/${p.slug}`} data-link className={n ? 'is-case' : undefined}>
                              {n && <span className="layer-case">Featured</span>}
                              {p.title}
                            </a>
                          );
                        })}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
