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
        <p className="sec-index label">404</p>
        <h1 className="sec-title">Page not found</h1>
        <p className="sec-lede">
          {what === 'project' ? 'There is no project at' : 'There is nothing at'} <code>{path}</code>.
        </p>
        <div className="nf-links">
          <a className="link" href="/" data-link>
            Home <ArrowRight />
          </a>
          <a className="link" href="/projects" data-link>
            All projects <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
