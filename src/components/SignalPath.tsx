import { useRef, useState, type KeyboardEvent } from 'react';
import { SIGNAL_PATH } from '../data/profile';
import { projectsInStage } from '../data/projects';
import { ArrowRight } from './Icons';

export default function SignalPath() {
  const [index, setIndex] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const stage = SIGNAL_PATH[index];
  const proof = projectsInStage(stage.id);

  const move = (next: number) => {
    const i = (next + SIGNAL_PATH.length) % SIGNAL_PATH.length;
    setIndex(i);
    tabs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(index + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      move(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      move(SIGNAL_PATH.length - 1);
    }
  };

  return (
    <section id="path" className="section" aria-labelledby="path-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <span className="sec-no">01 / Signal path</span>
          <h2 id="path-title">
            One signal, five stages, <em>one engineer</em>.
          </h2>
          <p>
            A reading is only useful if it survives the trip. I work on every hop of it: the sensor, the edge, the gateway, the services, and the screen at the end. Pick a stage.
          </p>
        </header>

        <div className="path reveal" style={{ ['--i' as string]: index }}>
          <div className="path-track" role="tablist" aria-label="Stages of the signal path" onKeyDown={onKey}>
            <span className="path-line" aria-hidden="true" />
            <span className="path-packet" aria-hidden="true" />
            {SIGNAL_PATH.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`stage-tab-${s.id}`}
                aria-selected={i === index}
                aria-controls="stage-panel"
                tabIndex={i === index ? 0 : -1}
                className="path-node"
                onClick={() => setIndex(i)}
                onMouseEnter={() => setIndex(i)}
              >
                <span className="path-node-no">{s.n}</span>
                <span className="path-node-label">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="path-panel" role="tabpanel" id="stage-panel" aria-labelledby={`stage-tab-${stage.id}`} tabIndex={0}>
            <div className="path-copy" key={stage.id}>
              <h3>{stage.title}</h3>
              <p className="path-blurb">{stage.blurb}</p>
              {stage.atWork && (
                <p className="path-work">
                  <span className="label">In production</span>
                  {stage.atWork}
                </p>
              )}
              <ul className="chips" aria-label="Technology">
                {stage.tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="path-proof" key={`${stage.id}-proof`}>
              <span className="label">Built here · {proof.length}</span>
              <ul>
                {proof.map((p) => (
                  <li key={p.slug}>
                    <a href={`/projects/${p.slug}`} data-link>
                      <span className="proof-title">{p.title}</span>
                      <span className="proof-kicker">{p.kicker?.split(' / ')[1] ?? p.kicker}</span>
                      <ArrowRight size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
