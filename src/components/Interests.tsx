import { motion } from 'motion/react';
import {
  Target, Swords, Disc,
  Crosshair, Zap, Shield, Flame, Skull, Sword,
  Circle, CircleDot, Joystick, Map, Settings,
  Compass
} from 'lucide-react';
import CodeAssemblyTag from './CodeAssemblyTag';
import DecryptionText from './DecryptionText';

const hobbies = [
  {
    title: 'Competitive Gaming',
    description: 'Highly active in tactical and hero shooters. Reaching peak performance through strategy and mechanical skill.',
    icon: <Target size={24} />,
    tags: [
      { name: 'Rainbow Six Siege', icon: <Crosshair size={10} /> },
      { name: 'Valorant', icon: <Zap size={10} /> },
      { name: 'Overwatch', icon: <Shield size={10} /> }
    ],
  },
  {
    title: 'Souls-like Enthusiast',
    description: 'My favorite genre. I thrive on the challenge, intricate world-building, and the methodical mastery these games demand.',
    icon: <Swords size={24} />,
    tags: [
      { name: 'Elden Ring', icon: <Flame size={10} /> },
      { name: 'Dark Souls', icon: <Skull size={10} /> },
      { name: 'Sekiro', icon: <Sword size={10} /> }
    ],
  },
  {
    title: 'Arcade & Billiards',
    description: 'Love the precision of pool and the nostalgic energy of arcade halls. It is all about the physics and the focus.',
    icon: <Disc size={24} />,
    tags: [
      { name: 'Pool', icon: <Circle size={10} /> },
      { name: 'Billiards', icon: <CircleDot size={10} /> },
      { name: 'Arcade Classics', icon: <Joystick size={10} /> }
    ],
  },
  {
    title: 'Driving & Road Trips',
    description: 'Nothing beats a long drive in my car. The open road is where I clear my head and find new perspectives.',
    icon: <Map size={24} />,
    tags: [
      { name: 'Driving', icon: <Settings size={10} /> },
      { name: 'Road Trips', icon: <Map size={10} /> },
      { name: 'Automotive', icon: <Compass size={10} /> }
    ],
  },
];

export default function Interests() {
  return (
    <section id="interests" className="py-24 px-6 md:px-12 bg-base">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <h2 className="watermark text-[12vw] md:text-[15vw] absolute -top-8 md:-top-12 left-0">
            LIFE
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <DecryptionText
              text="Interests"
              as="h2"
              trigger="inview"
              delay={0}
              speed={40}
              appendCursor
              className="text-5xl md:text-7xl font-mono tracking-[-0.03em] text-ink"
            />
          </div>
          <p className="text-lg text-ink-dim max-w-md leading-relaxed font-mono">
            When I am not architecting systems, I am usually chasing high scores or the next horizon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-px bg-border">
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: index * 0.1,
              }}
              className={`group p-10 bg-surface border border-border hover:border-border-hover transition-all flex flex-col gap-8 relative overflow-hidden ${
                index === 0 ? 'md:col-span-4 md:row-span-1' :
                index === 1 ? 'md:col-span-2 md:row-span-2' :
                index === 2 ? 'md:col-span-2 md:row-span-1' :
                'md:col-span-2 md:row-span-1'
              }`}
            >
              {/* Abstract Background Shape */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-accent">
                {hobby.icon}
              </div>

              <div className="w-12 h-12 flex items-center justify-center bg-surface-hover text-accent transition-colors group-hover:bg-accent group-hover:text-base">
                {hobby.icon}
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold tracking-tight text-ink font-mono">
                  {hobby.title}
                </h3>
                <p className="text-sm text-ink-dim leading-relaxed font-mono">
                  {hobby.description}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                {hobby.tags.map((tag, i) => (
                  <CodeAssemblyTag
                    key={tag.name}
                    text={tag.name}
                    delay={i * 80}
                    className="bg-surface border border-border px-3 py-1 text-[9px] uppercase tracking-widest font-bold text-ink-dim font-mono flex items-center gap-1.5"
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
