import { motion } from 'motion/react';
import { Briefcase, GraduationCap } from 'lucide-react';

const journey = [
  {
    type: 'education',
    title: 'Bachelor of Engineering in Computer Science',
    institution: 'University of Mumbai',
    period: '2018 - 2022',
    description: 'Focused on Cloud Computing, SDLC, Agile Practices, Data Structures, and Database Systems. Graduated with a strong foundation in programming and systems architecture.',
    tech: ['C', 'Java', 'Python', 'SQL', 'Cloud Computing'],
    icon: <GraduationCap size={18} />,
  },
  {
    type: 'experience',
    title: 'Software Engineer',
    institution: 'Wonderbiz Technologies',
    period: '2022 - 2025',
    description: 'Began professional journey by rapidly learning and adapting to enterprise-grade software development. Focused on mastering modern frameworks, contributing to core features, and collaborating with cross-functional teams to deliver high-quality code.',
    tech: ['JavaScript', 'React', 'Node.js', 'SQL', 'Agile'],
    icon: <Briefcase size={18} />,
  },
  {
    type: 'experience',
    title: 'Senior Software Engineer',
    institution: 'Wonderbiz Technologies',
    period: '2025 - Present',
    description: 'Architecting scalable microfrontend ecosystems and high-performance systems. Leading the development of modular webshells, real-time observability platforms, and NLP-driven automation tools.',
    tech: ['Single-Spa', 'GraphQL', '.NET Core', 'Node.js', 'Python', 'React', 'Angular', 'Modbus'],
    icon: <Briefcase size={18} />,
  },
];

export default function Experience() {
  return (
    <section id="journey" className="py-16 md:py-24 px-6 md:px-12 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24 relative">
          <h2 className="text-5xl md:text-9xl font-serif italic tracking-tighter text-[#141414] dark:text-white opacity-5 select-none absolute -top-8 md:-top-12 left-0 pointer-events-none">
            Story
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              The Narrative
            </span>
            <p className="text-2xl md:text-4xl font-serif italic text-[#141414] dark:text-white max-w-2xl leading-tight">
              A chronological evolution of technical mastery and professional impact.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gray-100 dark:bg-white/5 -translate-x-1/2 hidden md:block" />

          <div className="flex flex-col gap-16 md:gap-24">
            {journey.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-0 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 w-4 h-4 bg-[#141414] dark:bg-white border-4 border-white dark:border-[#0a0a0a] rounded-full -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block" />

                {/* Content Card */}
                <div className="w-full md:w-[45%]">
                  <div className="bg-gray-50 dark:bg-white/5 p-8 md:p-10 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
                          {item.period}
                        </span>
                        <h4 className="text-2xl font-bold tracking-tight text-[#141414] dark:text-white group-hover:text-gray-600 dark:group-hover:text-white/60 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-sm font-serif italic text-gray-500 dark:text-white/40">{item.institution}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/5 text-gray-400 dark:text-white/40 group-hover:text-[#141414] dark:group-hover:text-white transition-colors">
                        {item.icon}
                      </div>
                    </div>

                    <p className="text-gray-500 dark:text-white/40 leading-relaxed mb-8">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {item.tech.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-white dark:bg-white/5 text-gray-400 dark:text-white/20 border border-gray-100 dark:border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spacer for timeline */}
                <div className="hidden md:block w-[10%]" />
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
