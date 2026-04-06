import { motion } from 'motion/react';
import { Mail, Github, Linkedin, Twitter, ArrowRight, MapPin } from 'lucide-react';

const socialLinks = [
  { name: 'Email', icon: <Mail size={20} />, href: 'mailto:prakashsewani1994@gmail.com' },
  { name: 'LinkedIn', icon: <Linkedin size={20} />, href: 'https://www.linkedin.com/in/prakash-s-2a389721a/' },
  { name: 'GitHub', icon: <Github size={20} />, href: 'https://github.com/PrakashSewani' },
];

export default function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24 px-6 md:px-12 bg-white dark:bg-[#0a0a0a] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              Get in touch
            </span>
            <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter text-[#141414] dark:text-white">
              Contact
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-md leading-relaxed">
            Let's discuss microfrontends, system architecture, or your next big project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h3 className="text-3xl font-bold tracking-tight text-[#141414] dark:text-white">Let's build something scalable.</h3>
              <p className="text-xl text-gray-500 dark:text-white/40 font-light leading-relaxed max-w-md">
                I'm passionate about modular architectures and high-performance systems. Reach out for collaborations or opportunities.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-gray-500 dark:text-white/40">
                  <MapPin size={18} />
                  <span className="text-sm font-medium">Kalyan, Maharashtra, India</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-8">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#141414] dark:text-white hover:text-gray-400 dark:hover:text-white/60 transition-colors"
                  >
                    {link.icon} {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 bg-gray-50 dark:bg-white/5 p-8 md:p-12 border border-gray-100 dark:border-white/5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">Current Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-lg font-bold tracking-tight text-[#141414] dark:text-white">Senior Software Engineer @ Wonderbiz</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">Timezone</span>
              <span className="text-lg font-bold tracking-tight text-[#141414] dark:text-white">IST (UTC+5:30)</span>
            </div>

            <motion.a
              whileHover={{ x: 10 }}
              href="mailto:prakashsewani1994@gmail.com"
              className="mt-auto flex items-center justify-between p-6 bg-[#141414] dark:bg-white text-white dark:text-[#0a0a0a] text-xs uppercase font-bold tracking-widest group transition-colors"
            >
              Send an email <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </motion.a>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 dark:text-white/10">
            © 2026 Prakash Sewani / Senior Software Engineer
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 dark:text-white/10">Built with</span>
            <div className="flex items-center gap-2 text-gray-300 dark:text-white/10">
              <span className="text-[10px] font-mono font-bold">React</span>
              <span className="text-[10px] font-mono font-bold">Vite</span>
              <span className="text-[10px] font-mono font-bold">Motion</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
