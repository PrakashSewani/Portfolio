import { ArrowRight } from '../components/Icons';
import LayerMark from '../components/LayerMark';
import { profile } from '../data/profile';
import { useDocumentMeta } from '../lib/meta';

/** Unknown routes and unknown project slugs. Rendered in-app so the host's SPA fallback keeps working. */
export default function NotFound({ path, what = 'page' }: { path: string; what?: 'page' | 'project' }) {
  useDocumentMeta({ title: `Not found | ${profile.name}`, path, noindex: true });
  return (
    <section className="page nf">
      <div className="wrap nf-inner">
        <LayerMark lit={[]} size={120} />
        <p className="sec-index label">404 — No signal</p>
        <h1 className="sec-title">Nothing on any layer at {path}.</h1>
        <p className="sec-lede">
          {what === 'project' ? 'There is no project by that name.' : 'That address does not lead anywhere.'} The work is
          all reachable from here:
        </p>
        <div className="nf-links">
          <a className="link" href="/" data-link>
            Home <ArrowRight />
          </a>
          <a className="link" href="/projects" data-link>
            Every project <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
