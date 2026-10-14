import { motion } from 'motion/react';
import { ArrowUpRight, Github, Download } from 'lucide-react';
import { caseStudies } from '../data/portfolio';
import type { Project } from '../lib/projects';
import SpecimenPlate from './SpecimenPlate';

/**
 * The home page's selected work. Each case is a specimen plate (caption → drawn figure →
 * numbered decisions → the stack as facts) plus the case-study copy beside it, so the home
 * page and /projects/<slug> render **the same content** at different densities — both read
 * `content/projects/*.json`, so there is no second copy to drift.
 */

/** The short context chip: the kicker up to its first slash ("Developer tooling"). */
function contextOf(kicker: string | undefined): string {
  return kicker ? kicker.split('/')[0].trim() : 'Project';
}

/** The one-line evidence summary, built from the evidence entries in the content file. */
function evidenceLine(study: Project): string | null {
  if (!study.evidence || study.evidence.length === 0) return null;
  return study.evidence.map((item) => `${item.value} — ${item.label}`).join(' · ');
}

export default function Projects() {
  return (
    <section id="projects" className="section work-section">
      <div className="section-heading">
        <span className="section-index">01 / SELECTED WORK</span>
        <h2>PROOF, NOT<br />PROFICIENCY BARS.</h2>
        <p>Selected projects showing what I built, what I owned, and the engineering constraints behind the result.</p>
      </div>

      <a className="section-link" href="/projects" data-link>
        Open the full project index <ArrowUpRight size={13} aria-hidden="true" />
      </a>

      <div className="project-list">
        {caseStudies.map((study, index) => {
          const source = study.links[0];
          const install = study.links.find((link) => /^install/i.test(link.label));
          const evidence = evidenceLine(study);
          const callouts =
            study.specimen?.callouts ?? study.decisions?.map((text, position) => ({ n: position + 1, text }));

          return (
            <motion.article
              key={study.slug}
              className={`project-case project-${index + 1}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6 }}
            >
              <div className="project-meta"><span>{String(index + 1).padStart(2, '0')}</span><p>{study.kicker}</p></div>
              <div className="project-copy">
                <div className="project-context">{contextOf(study.kicker)}</div>
                <h3>{study.title}</h3>
                <p className="project-summary">{study.summary}</p>
                <div className={`project-proof-grid ${evidence ? '' : 'single-proof'}`}>
                  <div><small>What I owned</small><p>{study.ownership}</p></div>
                  {evidence && <div><small>Evidence</small><p>{evidence}</p></div>}
                </div>
                {study.challenge && (
                  <div className="challenge"><small>The engineering problem</small><p>{study.challenge}</p></div>
                )}
                {study.decisions && study.decisions.length > 0 && (
                  <div className="decision-block">
                    <small>Key decisions</small>
                    <ul>{study.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
                  </div>
                )}
                <div className="project-tech">
                  <small>Technology</small>
                  <div className="project-tech-list">{study.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
                </div>
                <div className="project-links">
                  {source && (
                    <a href={source.href} target="_blank" rel="noreferrer"><Github size={17} /> View source <ArrowUpRight size={15} /></a>
                  )}
                  {install && (
                    <a className="project-install" href={install.href} target="_blank" rel="noreferrer"><Download size={17} /> {install.label} <ArrowUpRight size={15} /></a>
                  )}
                  <a href={`/projects/${study.slug}`} data-link>Case sheet <ArrowUpRight size={15} /></a>
                </div>
              </div>
              <div className="project-visual">
                <SpecimenPlate
                  kind={study.specimen?.kind ?? 'none'}
                  caption={study.specimen?.caption ?? study.kicker ?? study.title}
                  index={index + 1}
                  callouts={callouts}
                  footnote={study.stack.slice(0, 4)}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
