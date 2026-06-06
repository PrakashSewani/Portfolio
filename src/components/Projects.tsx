import { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Github, ArrowUpRight, ImageOff } from 'lucide-react';
import DecryptionText from './DecryptionText';
import CodeAssemblyTag from './CodeAssemblyTag';

const projects = [
  {
    title: 'Habitual',
    description: 'A modern habit tracking platform designed to help you build routines, stay consistent, and visualize progress across devices.',
    tech: ['TypeScript', 'React', 'Node.js', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800&h=600&auto=format&fit=crop',
    link: 'https://github.com/PrakashSewani/Habitual',
    github: 'https://github.com/PrakashSewani/Habitual',
    category: 'Productivity',
  },
  {
    title: 'Class-Spy',
    description: 'VS Code extension that reveals CSS definitions and decodes Tailwind utility classes on hover across HTML, React, Vue, Svelte, Astro, and Angular.',
    tech: ['TypeScript', 'VS Code API', 'Tailwind CSS', 'AST Parsing'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&h=600&auto=format&fit=crop',
    link: 'https://github.com/PrakashSewani/Class-Spy',
    github: 'https://github.com/PrakashSewani/Class-Spy',
    category: 'Developer Tool',
  },
  {
    title: 'AdvAutomation',
    description: 'A schedule-driven meeting automation system that automatically joins and leaves sessions, reducing manual effort through background execution.',
    tech: ['Python', 'Selenium', 'Discord.py', 'Windows Task Scheduler'],
    image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800&h=600&auto=format&fit=crop',
    link: 'https://github.com/PrakashSewani/AdvAutomation',
    github: 'https://github.com/PrakashSewani/AdvAutomation',
    category: 'Automation',
  },
  {
    title: 'SmartEducationBot',
    description: 'A PDF-based question-answering system using keyword extraction and NLP models (BERT) to generate contextual responses with web-scraping fallback.',
    tech: ['Python', 'Flask', 'BERT', 'BeautifulSoup', 'Transformers'],
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&h=600&auto=format&fit=crop',
    link: 'https://github.com/PrakashSewani/SMART-EDUCATION-BOT',
    github: 'https://github.com/PrakashSewani/SMART-EDUCATION-BOT',
    category: 'NLP / AI',
  }
];

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-2 text-ink-dim">
          <ImageOff size={32} />
          <span className="text-[10px] uppercase tracking-widest font-bold">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-surface animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 md:px-12 bg-base">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <h2 className="watermark text-[12vw] md:text-[15vw] absolute -top-8 md:-top-12 left-0">
            WORK
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <DecryptionText
              text="Projects"
              as="h2"
              trigger="inview"
              delay={0}
              speed={40}
              appendCursor
              className="text-5xl md:text-7xl font-mono tracking-[-0.03em] text-ink"
            />
          </div>
          <p className="text-lg text-ink-dim max-w-md leading-relaxed font-mono">
            A collection of technical challenges solved through engineering excellence and creative problem-solving.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-24">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`project-card flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
            >
              <div className="w-full lg:w-3/5 relative aspect-[16/9] overflow-hidden bg-surface border border-border group">
                <ProjectImage src={project.image} alt={project.title} />
                <div className="absolute inset-0 bg-base/40 group-hover:bg-base/0 transition-colors duration-700" />

                <div className="absolute top-6 right-6">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-base text-accent flex items-center justify-center border border-border hover:bg-accent hover:text-base transition-all"
                    aria-label={`View ${project.title} source code on GitHub`}
                  >
                    <Github size={20} />
                  </a>
                </div>
              </div>

              <div className="w-full lg:w-2/5 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold text-ink-dim">
                    {project.category}
                  </span>
                  <DecryptionText
                    text={project.title}
                    as="h3"
                    trigger="inview"
                    delay={200}
                    speed={35}
                    className="text-4xl md:text-5xl font-bold tracking-tighter text-ink font-mono"
                  />
                </div>

                <p className="text-lg text-ink-dim leading-relaxed font-mono">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {project.tech.map((tech, i) => (
                    <CodeAssemblyTag
                      key={tech}
                      text={tech}
                      delay={i * 100}
                      className="tag-hover-glow bg-surface border border-border px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-ink-dim font-mono transition-colors duration-300"
                    />
                  ))}
                </div>

                <div className="pt-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest border-b-2 border-ink pb-1 text-ink hover:text-accent hover:border-accent transition-all font-mono"
                  >
                    explore_project <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
