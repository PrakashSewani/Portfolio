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
    <section id="projects" className="py-24 px-6 md:px-12 bg-white dark:bg-[#0a0a0a] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              Selected Work
            </span>
            <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter text-[#141414] dark:text-white">
              Projects
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-md leading-relaxed">
            A collection of technical challenges solved through engineering excellence and creative problem-solving.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col gap-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <img
                  src={project.image}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#141414]/0 group-hover:bg-[#141414]/40 dark:group-hover:bg-white/20 transition-colors duration-500 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                  <a
                    href={project.github}
                    className="w-12 h-12 bg-white dark:bg-[#0a0a0a] text-[#141414] dark:text-white flex items-center justify-center rounded-full hover:scale-110 transition-transform"
                  >
                    <Github size={20} />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
                      {project.category}
                    </span>
                    <h3 className="text-3xl font-bold tracking-tight text-[#141414] dark:text-white group-hover:text-gray-600 dark:group-hover:text-white/60 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  <ArrowUpRight size={24} className="text-gray-200 dark:text-white/10 group-hover:text-[#141414] dark:group-hover:text-white transition-colors" />
                </div>

                <p className="text-gray-500 dark:text-white/40 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono font-medium px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/20 border border-gray-100 dark:border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
