import { motion } from 'motion/react';
import { Database, Globe, Cpu, Layers, Terminal, ShieldCheck } from 'lucide-react';

const expertiseItems = [
  {
    title: 'Microfrontend Architecture',
    description: 'Specializing in Single-Spa and modular webshells for scalable, independent frontend lifecycles.',
    icon: <Terminal size={24} />,
    tech: ['Single-Spa', 'Micro-frontends', 'JavaScript', 'React'],
    number: '01',
  },
  {
    title: 'Full Stack Engineering',
    description: 'Building robust applications with .NET Core, Node.js, and Python, ensuring high performance and reliability.',
    icon: <Database size={24} />,
    tech: ['TypeScript', '.NET Core', 'Node.js', 'Python', 'SQL/NoSQL'],
    number: '02',
  },
  {
    title: 'API & Data Design',
    description: 'Expertise in GraphQL and real-time data integration using WebSockets and event-driven models.',
    icon: <Globe size={24} />,
    tech: ['GraphQL', 'Apollo', 'REST', 'WebSockets', 'Sockets'],
    number: '03',
  },
  {
    title: 'Security & Auth',
    description: 'Implementing enterprise-grade SSO and IAM standards for secure application access.',
    icon: <ShieldCheck size={24} />,
    tech: ['SSO', 'IAM', 'OAuth', 'Security Architecture'],
    number: '04',
  },
];

export default function Expertise() {
  return (
    <section id="expertise" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              Technical Stack
            </span>
            <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter text-[#141414] dark:text-white">
              Expertise
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-md leading-relaxed">
            A comprehensive approach to modern software engineering, from modular frontends to scalable backend architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-px bg-gray-200 dark:bg-white/5 border border-gray-200 dark:border-white/5">
          {expertiseItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-[#0a0a0a] p-8 md:p-12 flex flex-col gap-8 group transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <div className="flex justify-between items-start">
                <div className="p-4 bg-gray-50 dark:bg-white/5 text-[#141414] dark:text-white group-hover:bg-[#141414] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#0a0a0a] transition-colors">
                  {item.icon}
                </div>
                <span className="text-4xl font-serif italic text-gray-100 dark:text-white/5 group-hover:text-gray-200 dark:group-hover:text-white/10 transition-colors">
                  {item.number}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold tracking-tight text-[#141414] dark:text-white">{item.title}</h3>
                <p className="text-gray-500 dark:text-white/40 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {item.tech.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/20 border border-gray-100 dark:border-white/5"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-200 dark:border-white/10 pt-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">Learning Lab</span>
            <h3 className="text-2xl font-bold tracking-tight italic font-serif text-[#141414] dark:text-white">Current Interests</h3>
          </motion.div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { title: 'WebAssembly', desc: 'Exploring high-performance computing in the browser for complex visualizations.' },
              { title: 'AI-Driven Dev', desc: 'Integrating LLMs into the development workflow for enhanced productivity.' },
              { title: 'Cloud Native', desc: 'Deepening expertise in Kubernetes and serverless architectures.' },
              { title: 'Advanced GraphQL', desc: 'Optimizing federated schemas and real-time data orchestration.' },
            ].map((interest, idx) => (
              <motion.div 
                key={interest.title} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col gap-2"
              >
                <h4 className="font-bold text-sm uppercase tracking-wider text-[#141414] dark:text-white">{interest.title}</h4>
                <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">{interest.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
