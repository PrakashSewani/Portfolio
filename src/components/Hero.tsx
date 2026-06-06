import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import DecryptionText from './DecryptionText';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 pb-32 md:pb-12 overflow-hidden bg-base">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          {/* Terminal prompt line */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4"
          >
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-ink-dim">
              <span className="text-accent">$</span> whoami
            </span>
            <div className="hidden md:block h-[1px] w-12 bg-border" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-ink-dim">
              senior_software_engineer
            </span>
          </motion.div>

          {/* Hero Name with Decryption */}
          <div className="relative">
            <h2 className="watermark text-[14vw] md:text-[18vw] absolute -top-8 md:-top-24 left-0">
              ENGINEER
            </h2>
            <motion.div className="overflow-hidden">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,10vw,6rem)] font-mono leading-[0.85] tracking-[-0.03em] text-ink select-none relative z-10"
              >
                <DecryptionText
                  text="Prakash Sewani"
                  trigger="mount"
                  delay={900}
                  speed={35}
                  as="span"
                  appendCursor
                />
              </motion.h1>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="flex flex-col gap-6"
            >
              <p className="text-xl md:text-2xl font-light leading-relaxed text-ink-dim max-w-lg font-mono">
                Architecting scalable microfrontend ecosystems and high-performance systems.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group p-[1px] overflow-hidden border border-accent bg-accent-dim"
                >
                  <a
                    href="https://prakashsewaniresume.tiiny.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-8 py-4 bg-base text-accent text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all hover:bg-accent hover:text-base font-mono"
                  >
                    view_resume <Download size={16} />
                  </a>
                </motion.div>

                <a
                  href="#contact"
                  className="text-xs uppercase font-bold tracking-widest border-b-2 border-ink pb-1 text-ink hover:text-ink-dim transition-colors font-mono"
                >
                  get_in_touch
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="flex flex-col justify-end items-start md:items-end gap-2"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-dim font-bold mb-4 font-mono">
                core_competencies
              </div>
              <div className="flex flex-wrap justify-start md:justify-end gap-x-4 gap-y-2 max-w-xs md:text-right font-mono">
                {['TypeScript', 'JavaScript', 'Node.js', 'Python', 'GraphQL', 'Sockets', '.NET Core', 'Single-Spa'].map((tech) => (
                  <span key={tech} className="text-sm font-medium text-ink">
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
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-dim font-mono">
            scroll_to_explore
          </span>
          <div className="w-[2px] h-16 bg-gradient-to-b from-border-hover to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
