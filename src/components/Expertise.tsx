import { motion } from 'motion/react';
import {
  Database, Globe, Terminal, ShieldCheck
} from 'lucide-react';
import DecryptionText from './DecryptionText';
import CodeAssemblyTag from './CodeAssemblyTag';

const expertiseItems = [
  {
    title: 'Microfrontend Architecture',
    description: 'Specializing in Single-Spa and modular webshells for scalable, independent frontend lifecycles.',
    icon: <Terminal size={24} />,
    tech: ['Single-Spa', 'Micro-frontends', 'JavaScript', 'React'],
  },
  {
    title: 'Full Stack Engineering',
    description: 'Building robust applications with .NET Core, Node.js, and Python, ensuring high performance and reliability.',
    icon: <Database size={24} />,
    tech: ['TypeScript', '.NET Core', 'Node.js', 'Python', 'SQL/NoSQL'],
  },
  {
    title: 'API & Data Design',
    description: 'Expertise in GraphQL and real-time data integration using WebSockets and event-driven models.',
    icon: <Globe size={24} />,
    tech: ['GraphQL', 'Apollo', 'REST', 'WebSockets', 'Sockets'],
  },
  {
    title: 'Security & Auth',
    description: 'Implementing enterprise-grade SSO and IAM standards for secure application access.',
    icon: <ShieldCheck size={24} />,
    tech: ['SSO', 'IAM', 'OAuth', 'Security Architecture'],
  },
];

export default function Expertise() {
  return (
    <section id="expertise" className="py-24 px-6 md:px-12 bg-base">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <h2 className="watermark text-[12vw] md:text-[15vw] absolute -top-8 md:-top-12 left-0">
            STACK
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <DecryptionText
              text="Expertise"
              as="h2"
              trigger="inview"
              delay={0}
              speed={40}
              appendCursor
              className="text-5xl md:text-7xl font-mono tracking-[-0.03em] text-ink"
            />
          </div>
          <p className="text-lg text-ink-dim max-w-md leading-relaxed font-mono">
            A comprehensive approach to modern software engineering, from modular frontends to scalable backend architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {expertiseItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface p-8 md:p-12 flex flex-col gap-8 group transition-colors hover:bg-surface-hover border border-border"
            >
              <div className="flex justify-between items-start">
                <div className="p-4 bg-surface-hover text-accent group-hover:bg-accent group-hover:text-base transition-colors">
                  {item.icon}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold tracking-tight text-ink font-mono">
                  {item.title}
                </h3>
                <p className="text-ink-dim leading-relaxed font-mono">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {item.tech.map((tech, i) => (
                  <CodeAssemblyTag
                    key={tech}
                    text={tech}
                    delay={i * 80}
                    className="bg-surface border border-border px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-ink-dim font-mono"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
