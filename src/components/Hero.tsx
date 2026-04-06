import { motion } from 'motion/react';
import { ArrowDownRight, Download } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 pb-32 md:pb-12 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors">
      <div className="absolute inset-0 data-grid -z-10" />
      
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4"
          >
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-white/40">
              Senior Software Engineer
            </span>
            <div className="hidden md:block h-[1px] w-12 bg-gray-200 dark:bg-white/10" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-white/40">
              Microfrontends & Systems
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[14vw] md:text-[10vw] font-serif leading-[0.85] tracking-tighter italic text-[#141414] dark:text-white select-none"
          >
            Prakash <br />
            Sewani
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col gap-6"
            >
              <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-600 dark:text-white/60 max-w-lg">
                Architecting scalable microfrontend ecosystems and high-performance systems. Transforming software experiences with precision and modern engineering.
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/resume.pdf"
                  download="Prakash_Sewani_Resume.pdf"
                  className="px-8 py-4 bg-[#141414] dark:bg-white text-white dark:text-[#0a0a0a] text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-colors"
                >
                  Download Resume <Download size={16} />
                </motion.a>
                
                <a href="#contact" className="text-xs uppercase font-bold tracking-widest border-b-2 border-[#141414] dark:border-white pb-1 text-[#141414] dark:text-white">
                  Get in touch
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col justify-end items-start md:items-end gap-2"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 font-bold mb-4">
                Core Competencies
              </div>
              <div className="flex flex-wrap justify-start md:justify-end gap-x-4 gap-y-2 max-w-xs md:text-right">
                {['TypeScript', 'JavaScript', 'Node.js', 'Python', 'GraphQL', 'Sockets', '.NET Core', 'Single-Spa'].map((tech) => (
                  <span key={tech} className="text-sm font-mono font-medium text-[#141414] dark:text-white">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden sm:flex"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 dark:text-white/20">Scroll to explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-200 to-transparent dark:from-white/10" />
      </motion.div>
    </section>
  );
}
