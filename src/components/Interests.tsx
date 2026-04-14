import { motion } from 'motion/react';
import { 
  Gamepad2, Car, Trophy, Target, Swords, Disc, 
  Crosshair, Zap, Shield, Flame, Skull, Sword, 
  Circle, CircleDot, Joystick, Map, Settings,
  Compass
} from 'lucide-react';

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
    accent: 'border-red-500/20 text-red-500',
    tilt: -2,
  },
  {
    title: 'Souls-like Enthusiast',
    description: 'My favorite genre. I thrive on the challenge, intricate world-building, and the "git gud" philosophy of FromSoftware titles.',
    icon: <Swords size={24} />,
    tags: [
      { name: 'Elden Ring', icon: <Flame size={10} /> },
      { name: 'Dark Souls', icon: <Skull size={10} /> },
      { name: 'Sekiro', icon: <Sword size={10} /> }
    ],
    accent: 'border-amber-500/20 text-amber-500',
    tilt: 2,
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
    accent: 'border-blue-500/20 text-blue-500',
    tilt: -1.5,
  },
  {
    title: 'Driving & Road Trips',
    description: 'Nothing beats a long drive in my car. The open road is where I clear my head and find new perspectives.',
    icon: <Car size={24} />,
    tags: [
      { name: 'Driving', icon: <Settings size={10} /> },
      { name: 'Road Trips', icon: <Map size={10} /> },
      { name: 'Automotive', icon: <Compass size={10} /> }
    ],
    accent: 'border-emerald-500/20 text-emerald-500',
    tilt: 1.5,
  },
];

export default function Interests() {
  return (
    <section id="interests" className="py-24 px-6 md:px-12 bg-gray-50/50 dark:bg-black/50 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
          <h2 className="text-5xl md:text-9xl font-serif tracking-tighter text-[#141414] dark:text-white opacity-5 select-none absolute -top-8 md:-top-12 left-0 pointer-events-none">
            LIFE
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              Beyond the Code
            </span>
            <h2 className="text-5xl md:text-7xl font-serif tracking-tighter text-[#141414] dark:text-white">
              Interests
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-md leading-relaxed">
            When I am not architecting systems, I am usually chasing high scores or the next horizon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:auto-rows-[400px]">
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: index * 0.1 
              }}
              className={`group p-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all flex flex-col gap-8 relative overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none ${
                index === 0 ? 'md:col-span-4 md:row-span-1' : 
                index === 1 ? 'md:col-span-2 md:row-span-2' :
                index === 2 ? 'md:col-span-2 md:row-span-1' :
                'md:col-span-2 md:row-span-1'
              }`}
            >
              {/* Abstract Background Shape */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                {hobby.icon}
              </div>

              <div className={`w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-white/5 ${hobby.accent.split(' ')[1]} transition-colors group-hover:bg-[#141414] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black`}>
                {hobby.icon}
              </div>
              
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold tracking-tight text-[#141414] dark:text-white">
                  {hobby.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">
                  {hobby.description}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                {hobby.tags.map((tag) => (
                  <div key={tag.name} className="tech-tag-animated">
                    <div className="tech-tag-inner">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/40 flex items-center gap-1.5">
                        {tag.icon}
                        {tag.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
