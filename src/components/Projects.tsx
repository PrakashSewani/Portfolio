import { motion } from 'motion/react';
import { ArrowUpRight, Github, Download } from 'lucide-react';
import { projects } from '../data/portfolio';
import SpecimenPlate from './SpecimenPlate';

/**
 * The home page's selected work. Each case is a specimen plate (caption → drawn figure →
 * numbered decisions → the stack as facts) plus the case-study copy beside it, so the home
 * page and /projects/<slug> render the same content model at different densities.
 */
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
        {projects.map((project, index) => (
          <motion.article
            key={project.title}
            className={`project-case project-${index + 1}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
          >
            <div className="project-meta"><span>{project.index}</span><p>{project.kicker}</p></div>
            <div className="project-copy">
              <div className="project-context">{project.context}</div>
              <h3>{project.title}</h3>
              <p className="project-summary">{project.summary}</p>
              <div className={`project-proof-grid ${'evidence' in project && project.evidence ? '' : 'single-proof'}`}>
                <div><small>What I owned</small><p>{project.ownership}</p></div>
                {'evidence' in project && project.evidence && <div><small>Evidence</small><p>{project.evidence}</p></div>}
              </div>
              <div className="challenge"><small>The engineering problem</small><p>{project.challenge}</p></div>
              <div className="decision-block"><small>Key decisions</small><ul>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul></div>
              <div className="project-tech">
                <small>Technology</small>
                <div className="project-tech-list">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
              </div>
              <div className="project-links">
                <a href={project.github} target="_blank" rel="noreferrer"><Github size={17} /> View source <ArrowUpRight size={15} /></a>
                {'install' in project && project.install && <a className="project-install" href={project.install} target="_blank" rel="noreferrer"><Download size={17} /> {project.installLabel} <ArrowUpRight size={15} /></a>}
                <a href={`/projects/${project.slug}`} data-link>Case sheet <ArrowUpRight size={15} /></a>
              </div>
            </div>
            <div className="project-visual">
              <SpecimenPlate
                kind={project.visual}
                caption={project.context}
                index={index + 1}
                callouts={project.decisions.map((text, position) => ({ n: position + 1, text }))}
                footnote={project.tech.slice(0, 4)}
              />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
