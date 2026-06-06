import { motion } from 'motion/react';
import { Mail, Github, Linkedin, ArrowRight, MapPin, Phone } from 'lucide-react';
import DecryptionText from './DecryptionText';

const socialLinks = [
  { name: 'email', icon: <Mail size={20} />, href: 'mailto:contact@prakashsewani.com' },
  { name: 'linkedin', icon: <Linkedin size={20} />, href: 'https://www.linkedin.com/in/prakash-s-2a389721a/' },
  { name: 'github', icon: <Github size={20} />, href: 'https://github.com/PrakashSewani' },
];

export default function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24 px-6 md:px-12 bg-base">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <h2 className="watermark text-[12vw] md:text-[15vw] absolute -top-8 md:-top-12 left-0">
            HELLO
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <DecryptionText
              text="Contact"
              as="h2"
              trigger="inview"
              delay={0}
              speed={40}
              appendCursor
              className="text-5xl md:text-7xl font-mono tracking-[-0.03em] text-ink"
            />
          </div>
          <p className="text-lg text-ink-dim max-w-md leading-relaxed font-mono">
            Let's discuss microfrontends, system architecture, or your next big project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h3 className="text-3xl font-bold tracking-tight text-ink font-mono">
                <span className="text-accent">$</span> contact --init
              </h3>
              <p className="text-xl text-ink-dim font-light leading-relaxed max-w-md font-mono">
                I am passionate about modular architectures and high-performance systems. Reach out for collaborations or opportunities.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-ink-dim font-mono">
                  <Phone size={18} className="text-accent" />
                  <a href="tel:+918850260072" className="text-sm font-medium hover:text-ink transition-colors">
                    +91 88502 60072
                  </a>
                </div>
                <div className="flex items-center gap-3 text-ink-dim font-mono">
                  <MapPin size={18} className="text-accent" />
                  <span className="text-sm font-medium">Kalyan, Maharashtra, India</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-8">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-ink hover:text-accent transition-colors font-mono"
                  >
                    {link.icon} {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 bg-surface p-8 md:p-12 border border-border">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-dim font-mono">
                current_status
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success animate-pulse" />
                <span className="text-lg font-bold tracking-tight text-ink font-mono">
                  Senior Software Engineer @ Wonderbiz
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-dim font-mono">
                timezone
              </span>
              <span className="text-lg font-bold tracking-tight text-ink font-mono">
                IST (UTC+5:30)
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-ink-dim font-mono">
                direct_contact
              </span>
              <span className="text-lg font-bold tracking-tight text-ink font-mono">
                +91 88502 60072
              </span>
            </div>

            <motion.a
              whileHover={{ x: 10 }}
              href="mailto:contact@prakashsewani.com"
              className="mt-auto flex items-center justify-between p-6 bg-accent text-base text-xs uppercase font-bold tracking-widest group transition-colors hover:bg-ink font-mono"
            >
              send_email <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </motion.a>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-subtle font-mono">
            © 2026 prakash_sewani / senior_software_engineer
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-ink-subtle font-mono">
              built_with
            </span>
            <div className="flex items-center gap-2 text-ink-subtle font-mono">
              <span className="text-[10px] font-bold">React</span>
              <span className="text-[10px] font-bold">Vite</span>
              <span className="text-[10px] font-bold">Motion</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
