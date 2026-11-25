import { Fragment, useRef } from 'react';
import { featured, STATUS_LABEL, type Project } from '../../data/projects';
import { useScenes } from '../../lib/motion';
import { CaseFigure } from '../Figures';
import { ArrowRight, ArrowUpRight } from '../Icons';
import LayerMark, { layerNames } from '../LayerMark';
import LitText from '../LitText';

const pad = (n: number) => String(n).padStart(2, '0');
const TOTAL = pad(featured.length);

/**
 * One project, one screen. Desktop shows the problem beside the figure; smaller screens show the
 * rule and the figure. The approach and the details are on the project's own page.
 */
function CaseFile({ project, i }: { project: Project; i: number }) {
  return (
    <article className="case" aria-labelledby={`case-title-${project.slug}`}>
      <div className="case-in">
        <header className="case-head">
          <div className="case-meta">
            <span className="case-n">
              Featured {pad(i + 1)}
              <span className="case-of"> / {TOTAL}</span>
            </span>
            <span className={`status status-${project.status}`}>{STATUS_LABEL[project.status]}</span>
            {project.year && <span className="case-year">{project.year}</span>}
          </div>
          <h3 id={`case-title-${project.slug}`} className="case-title" style={{ viewTransitionName: `title-${project.slug}` }}>
            {project.title}
          </h3>
          <p className="case-kicker">{project.kicker}</p>
          <p className="case-layers">
            <LayerMark lit={project.layers} size={22} />
            {layerNames(project.layers)}
          </p>
        </header>

        {project.invariant && (
          <blockquote className="invariant">
            <p className="label">Invariant</p>
            <LitText className="invariant-text" text={project.invariant} />
          </blockquote>
        )}

        <figure className="case-figure">
          <CaseFigure project={project} />
          {project.specimen && <figcaption className="figure-caption">{project.specimen.caption}</figcaption>}
        </figure>

        {project.challenge && (
          <div className="case-block case-problem">
            <h4 className="label">Problem</h4>
            <p className="prose">{project.challenge}</p>
          </div>
        )}

        <div className="case-links">
          <a className="link" href={`/projects/${project.slug}`} data-link>
            Read more <ArrowRight />
          </a>
          {project.links.map((l) => (
            <a key={l.href} className="link" href={l.href} target="_blank" rel="noreferrer">
              {l.label} <ArrowUpRight />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * The six featured projects, one full screen each. Each screen eases in as it rises, holds while
 * you read it, and settles back as the next one slides over it.
 */
export default function CaseFiles() {
  const scenes = useRef<HTMLDivElement>(null);
  useScenes(scenes);

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <p className="sec-index label">03 — Work</p>
          <h2 id="work-title" className="sec-title">
            Selected work
          </h2>
          <p className="sec-lede">
            Six projects in more detail. Each starts with the one rule its design is built around, followed by the problem,
            the main decisions and where it stands today.
          </p>
        </header>
      </div>

      <div ref={scenes} className="cases">
        {/* The screens are siblings so each later one can slide over the ones before it. */}
        {featured.map((project, i) => (
          <Fragment key={project.slug}>
            {/* In the flow, unlike the sticky screen, so #case-<slug> always lands where the screen settles. */}
            <span id={`case-${project.slug}`} className="scene-anchor" aria-hidden="true" />
            <CaseFile project={project} i={i} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}
