import { motion } from 'motion/react';
import { Gamepad2, Car, Trophy, Target, Swords, Disc } from 'lucide-react';

const hobbies = [
  {
    title: 'Competitive Gaming',
    description: 'Highly active in tactical and hero shooters. Reaching peak performance through strategy and mechanical skill.',
    icon: <Target size={24} />,
    tags: ['Rainbow Six Siege', 'Valorant', 'Overwatch'],
    accent: 'border-red-500/20 text-red-500',
  },
  {
    title: 'Souls-like Enthusiast',
    description: 'My favorite genre. I thrive on the challenge, intricate world-building, and the "git gud" philosophy of FromSoftware titles.',
    icon: <Swords size={24} />,
    tags: ['Elden Ring', 'Dark Souls', 'Sekiro'],
    accent: 'border-amber-500/20 text-amber-500',
  },
  {
    title: 'Arcade & Billiards',
    description: 'Love the precision of pool and the nostalgic energy of arcade halls. It is all about the physics and the focus.',
    icon: <Disc size={24} />,
    tags: ['Pool', 'Billiards', 'Arcade Classics'],
    accent: 'border-blue-500/20 text-blue-500',
  },
  {
    title: 'Driving & Road Trips',
    description: 'Nothing beats a long drive in my car. The open road is where I clear my head and find new perspectives.',
    icon: <Car size={24} />,
    tags: ['Driving', 'Road Trips', 'Automotive'],
    accent: 'border-emerald-500/20 text-emerald-500',
  },
];

export default function Interests() {
  return (
    <section id="interests" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-[#0f0f0f] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono uppercase tracking-widest font-bold text-gray-400 dark:text-white/20">
              Beyond the Code
            </span>
            <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter text-[#141414] dark:text-white">
              Interests
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-white/40 max-w-md leading-relaxed">
            When I am not architecting systems, I am usually chasing high scores or the next horizon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all flex flex-col gap-6"
            >
              <div className={`w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-white/5 ${hobby.accent.split(' ')[1]} transition-colors group-hover:bg-[#141414] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#0a0a0a]`}>
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
                  <span
                    key={tag}
                    className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/20 border border-gray-100 dark:border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
