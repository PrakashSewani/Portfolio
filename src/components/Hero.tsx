import { motion } from 'motion/react';
import { ArrowDownRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 pb-12 overflow-hidden bg-white transition-colors">
      <div className="absolute inset-0 data-grid -z-10" />
      
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
              Senior Software Engineer
            </span>
            <div className="h-[1px] w-12 bg-gray-200" />
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
              Microfrontends & Systems
            </span>
          </div>

          <h1 className="text-[14vw] md:text-[10vw] font-serif leading-[0.85] tracking-tighter italic text-[#141414] select-none">
            Prakash <br />
            Sewani
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <div className="flex flex-col gap-6">
              <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-600 max-w-lg">
                Architecting scalable microfrontend ecosystems and high-performance systems. Transforming software experiences with precision and modern engineering.
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#projects"
                  className="px-8 py-4 bg-[#141414] text-white text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-colors"
                >
                  View Selected Work <ArrowDownRight size={16} />
                </motion.a>
                
                <a href="#contact" className="text-xs uppercase font-bold tracking-widest border-b-2 border-[#141414] pb-1 text-[#141414]">
                  Get in touch
                </a>
              </div>
            </div>

            <div className="flex flex-col justify-end items-start md:items-end gap-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">
                Core Competencies
              </div>
              <div className="flex flex-wrap justify-start md:justify-end gap-x-4 gap-y-2 max-w-xs text-right">
                {['TypeScript', 'JavaScript', 'Node.js', 'Python', 'GraphQL', 'Sockets', '.NET Core', 'Single-Spa'].map((tech) => (
                  <span key={tech} className="text-sm font-mono font-medium text-[#141414]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Scroll to explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-200 to-transparent" />
      </motion.div>
    </section>
  );
}
