import { motion } from 'motion/react';
import { Award, ExternalLink, Calendar, User } from 'lucide-react';

const certifications = [
  {
    title: 'Azure Kubernetes Service with Azure DevOps and Terraform',
    source: 'Udemy',
    id: 'UC-9257a19e-e08f-4630-9646-289d15e7580d',
    link: 'https://ude.my/UC-9257a19e-e08f-4630-9646-289d15e7580d',
    date: 'April 8, 2026',
    instructor: 'Kalyan Reddy Daida',
    accent: 'border-blue-500/20 text-blue-500',
  },
  {
    title: '.NET 8 Web Api - Clean Architecture Full Guide',
    source: 'Udemy',
    id: 'UC-3a89ea1f-7703-4a75-bd67-dd982a91586e',
    link: 'https://ude.my/UC-3a89ea1f-7703-4a75-bd67-dd982a91586e',
    date: 'Nov 17, 2024',
    instructor: 'Junior Matlou',
    accent: 'border-purple-500/20 text-purple-500',
  },
];

export default function Certifications() {
  return (
    <section id="certifications" className="py-24 px-6 md:px-12 bg-white dark:bg-[#0a0a0a] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              Verified Skills
            </span>
            <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter text-[#141414] dark:text-white">
              Certifications
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-md leading-relaxed">
            Continuous learning and professional validation in cloud architecture and modern development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
              }}
              className="group p-8 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all flex flex-col gap-6 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                <Award size={160} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 ${cert.accent.split(' ')[1]} transition-colors group-hover:bg-[#141414] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#0a0a0a]`}>
                  <Award size={24} />
                </div>
                <a 
                  href={cert.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white dark:bg-white/5 text-gray-400 hover:text-[#141414] dark:hover:text-white transition-colors"
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-blue-500 dark:text-blue-400">
                    {cert.source}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#141414] dark:text-white leading-tight">
                    {cert.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/20 flex items-center gap-1">
                      <User size={10} /> Instructor
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-white/60">
                      {cert.instructor}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/20 flex items-center gap-1">
                      <Calendar size={10} /> Issued
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-white/60">
                      {cert.date}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <span className="text-[9px] font-mono text-gray-400 dark:text-white/20 break-all">
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
