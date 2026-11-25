import { useEffect, useState } from 'react';
import { profile } from '../../data/profile';
import LayerMark from '../LayerMark';

/**
 * The colophon. Every figure here is a fact about this build: the commit and date come from the
 * build environment, the script weight is measured by scripts/prerender.mjs after bundling and
 * injected as <meta name="build-weight">. In dev there is no measurement, so the line is omitted.
 */
export default function Footer() {
  const [weight, setWeight] = useState<string | null>(null);
  useEffect(() => {
    setWeight(document.querySelector<HTMLMetaElement>('meta[name="build-weight"]')?.content ?? null);
  }, []);

  const date = __BUILD_DATE__ ? new Date(__BUILD_DATE__) : null;

  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <div className="foot-id">
          <LayerMark size={22} />
          <span>
            © {date ? date.getUTCFullYear() : new Date().getFullYear()} {profile.name}
          </span>
        </div>
        <dl className="foot-build">
          <div>
            <dt>Built with</dt>
            <dd>React, Vite and plain CSS</dd>
          </div>
          {__BUILD_SHA__ && (
            <div>
              <dt>Build</dt>
              <dd>
                {__BUILD_SHA_PUBLIC__ ? (
                  <a href={`${profile.repo}/commit/${__BUILD_SHA__}`} target="_blank" rel="noreferrer">
                    {__BUILD_SHA__.slice(0, 7)}
                  </a>
                ) : (
                  <span>{__BUILD_SHA__.slice(0, 7)}</span>
                )}
                {date && ` · ${date.toISOString().slice(0, 10)}`}
              </dd>
            </div>
          )}
          {weight && (
            <div>
              <dt>Script</dt>
              <dd>{weight} gzipped</dd>
            </div>
          )}
        </dl>
      </div>
    </footer>
  );
}
