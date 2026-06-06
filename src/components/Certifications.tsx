import { motion } from 'motion/react';
import { Award, ExternalLink, Calendar, User } from 'lucide-react';
import DecryptionText from './DecryptionText';

const certifications = [
  {
    title: 'Azure Kubernetes Service with Azure DevOps and Terraform',
    source: 'Udemy',
    id: 'UC-9257a19e-e08f-4630-9646-289d15e7580d',
    link: 'https://ude.my/UC-9257a19e-e08f-4630-9646-289d15e7580d',
    date: 'April 8, 2026',
    instructor: 'Kalyan Reddy Daida',
  },
  {
    title: '.NET 8 Web Api - Clean Architecture Full Guide',
    source: 'Udemy',
    id: 'UC-3a89ea1f-7703-4a75-bd67-dd982a91586e',
    link: 'https://ude.my/UC-3a89ea1f-7703-4a75-bd67-dd982a91586e',
    date: 'Nov 17, 2024',
    instructor: 'Junior Matlou',
  },
];

export default function Certifications() {
  return (
    <section id="certifications" className="py-24 px-6 md:px-12 bg-base">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <h2 className="watermark text-[12vw] md:text-[15vw] absolute -top-8 md:-top-12 left-0">
            VERIFIED
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <DecryptionText
              text="Certifications"
              as="h2"
              trigger="inview"
              delay={0}
              speed={40}
              appendCursor
              className="text-5xl md:text-7xl font-mono tracking-[-0.03em] text-ink"
            />
          </div>
          <p className="text-lg text-ink-dim max-w-md leading-relaxed font-mono">
            Continuous learning and professional validation in cloud architecture and modern development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                zIndex: 10,
              }}
              className="group p-8 bg-surface border border-border hover:border-border-hover transition-all flex flex-col gap-6 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-accent">
                <Award size={160} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 flex items-center justify-center bg-surface-hover text-accent transition-colors group-hover:bg-accent group-hover:text-base">
                  <Award size={24} />
                </div>
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-surface-hover text-ink-dim hover:text-accent transition-colors border border-border"
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-accent font-mono">
                    {cert.source}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-ink leading-tight font-mono">
                    {cert.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-ink-dim flex items-center gap-1 font-mono">
                      <User size={10} /> Instructor
                    </span>
                    <span className="text-xs font-medium text-ink-dim font-mono">
                      {cert.instructor}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-ink-dim flex items-center gap-1 font-mono">
                      <Calendar size={10} /> Issued
                    </span>
                    <span className="text-xs font-medium text-ink-dim font-mono">
                      {cert.date}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <span className="text-[9px] font-mono text-ink-subtle break-all">
                    ID: {cert.id}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
