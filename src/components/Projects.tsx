import { motion } from 'motion/react';
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react';

const projects = [
  {
    title: 'SmartEducationBot',
    description: 'A PDF-based question-answering system using keyword extraction and NLP models (BERT) to generate contextual responses with web-scraping fallback.',
    tech: ['Python', 'Flask', 'BERT', 'BeautifulSoup', 'Transformers'],
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&h=600&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/PrakashSewani/SMART-EDUCATION-BOT',
    category: 'NLP / AI',
  },
  {
    title: 'Meetings AutomationBot',
    description: 'A schedule-driven meeting automation system that automatically joins and leaves sessions, reducing manual effort through background execution.',
    tech: ['Python', 'Selenium', 'Discord.py', 'Windows Task Scheduler'],
    image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800&h=600&auto=format&fit=crop',
    link: '#',
    github: 'https://github.com/PrakashSewani/AdvAutomation',
    category: 'Automation',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 md:px-12 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <h2 className="text-5xl md:text-9xl font-serif tracking-tighter text-[#141414] dark:text-white opacity-5 select-none absolute -top-8 md:-top-12 left-0 pointer-events-none">
            WORK
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              Selected Work
            </span>
            <h2 className="text-5xl md:text-7xl font-serif tracking-tighter text-[#141414] dark:text-white">
              Projects
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-md leading-relaxed">
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
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
            >
              <div className="w-full lg:w-3/5 relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 group">
                <img
                  src={project.image}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#141414]/20 group-hover:bg-[#141414]/0 transition-colors duration-700" />
                
                <div className="absolute top-6 right-6">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white dark:bg-black text-[#141414] dark:text-white flex items-center justify-center rounded-full shadow-xl hover:scale-110 transition-transform"
                  >
                    <Github size={20} />
                  </a>
                </div>
              </div>

              <div className="w-full lg:w-2/5 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-white/20">
                    {project.category}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#141414] dark:text-white">
                    {project.title}
                  </h3>
                </div>

                <p className="text-lg text-gray-500 dark:text-white/40 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {project.tech.map((tech) => (
                    <div key={tech} className="tech-tag-animated">
                      <div className="tech-tag-inner">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/40">
                          {tech}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <a 
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest border-b-2 border-[#141414] dark:border-white pb-1 text-[#141414] dark:text-white hover:gap-4 transition-all"
                  >
                    Explore Project <ArrowUpRight size={16} />
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
