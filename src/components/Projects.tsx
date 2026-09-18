import { motion } from 'motion/react';
import { ArrowUpRight, Github, Check, Download } from 'lucide-react';
import { projects } from '../data/portfolio';

function ProjectVisual({ type }: { type: (typeof projects)[number]['visual'] }) {
  if (type === 'inspector') {
    return (
      <div className="mockup inspector-mockup" aria-hidden="true">
        <div className="mockup-bar"><span>class-spy.tsx</span><span>×</span></div>
        <div className="code-row"><b>14</b><code>&lt;div className=<mark>"flex items-center gap-4"</mark>&gt;</code></div>
        <div className="code-row muted"><b>15</b><code>&nbsp;&nbsp;&lt;Tool /&gt;</code></div>
        <div className="inspection-card">
          <small>CLASS-SPY / RESOLVED</small>
          <strong>.flex</strong><span>display: flex;</span>
          <strong>.items-center</strong><span>align-items: center;</span>
          <strong>.gap-4</strong><span>gap: 1rem;</span>
        </div>
        <div className="mockup-status"><span>6 frameworks</span><span>TypeScript</span><span>Ready</span></div>
      </div>
    );
  }

  if (type === 'habit') {
    return (
      <div className="mockup habit-mockup" aria-hidden="true">
        <div className="habit-head"><div><small>GOOD MORNING</small><strong>Build momentum.</strong></div><b>87%</b></div>
        <div className="week-row">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span className={index < 5 ? 'done' : ''} key={`${day}-${index}`}>{day}</span>)}</div>
        <div className="habit-list">
          {['Deep work', 'Read 20 pages', 'Exercise'].map((habit, index) => <div key={habit}><i className={index < 2 ? 'checked' : ''}>{index < 2 && <Check size={14} />}</i><span>{habit}</span><b>{index === 0 ? '14d' : index === 1 ? '8d' : '3d'}</b></div>)}
        </div>
      </div>
    );
  }

  if (type === 'roulette') {
    return (
      <div className="mockup roulette-mockup" aria-hidden="true">
        <div className="mockup-bar"><span>netflix.com/title/80018294</span><span>×</span></div>
        <div className="roulette-stage">
          <div className="roulette-series">
            <small>SERIES / THE OFFICE</small>
            <strong>RANDOM EPISODE</strong>
            <span>S5 · E14 · “Stress Relief”</span>
          </div>
          <div className="roulette-actions">
            <span className="roulette-play">▶ Play</span>
            <span className="roulette-dice">🎲 Random Episode</span>
          </div>
          <div className="roulette-discover">
            <small>DISCOVERY</small>
            <div className="roulette-discover-row"><span>Season 1</span><b>6 ep</b></div>
            <div className="roulette-discover-row"><span>Season 2</span><b>22 ep</b></div>
            <div className="roulette-discover-row"><span>Season 3</span><b>23 ep</b></div>
            <div className="roulette-discover-row"><span>Season 4</span><b>19 ep</b></div>
            <div className="roulette-discover-row"><span>Season 5</span><b>28 ep</b></div>
            <div className="roulette-discover-row"><span>Season 6</span><b>26 ep</b></div>
          </div>
        </div>
        <div className="mockup-status"><span>Netflix + Prime Video</span><span>Manifest V3</span><span>1 / 124 picked</span></div>
      </div>
    );
  }

  return (
    <div className="mockup knowledge-mockup" aria-hidden="true">
      <div className="knowledge-sidebar"><strong>SEB</strong><span>01</span><span>02</span><span>03</span></div>
      <div className="knowledge-body">
        <small>DOCUMENT / NLP_CHAPTER.PDF</small>
        <h4>What are transformers?</h4>
        <div className="answer-block"><b>CONTEXTUAL ANSWER</b><p>Transformers are attention-based neural networks that process relationships across input data in parallel.</p></div>
        <div className="confidence"><span>Model confidence</span><strong>94%</strong><i /></div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section work-section">
      <div className="section-heading">
        <span className="section-index">01 / SELECTED WORK</span>
        <h2>PROOF, NOT<br />PROFICIENCY BARS.</h2>
        <p>Selected projects showing what I built, what I owned, and the engineering constraints behind the result.</p>
      </div>

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
              </div>
            </div>
            <div className="project-visual"><ProjectVisual type={project.visual} /></div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
