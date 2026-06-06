import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Expertise from './components/Expertise';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Certifications from './components/Certifications';
import Interests from './components/Interests';
import Contact from './components/Contact';
import Preloader from './components/Preloader';
import GlobalBackground from './components/GlobalBackground';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-base text-ink">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <GlobalBackground />
      <div className="scanline-overlay" />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Preloader key="preloader" onComplete={handlePreloaderComplete} />
        ) : (
          <motion.main
            id="main"
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative min-h-screen"
          >
            <Navbar />
            <Hero />
            <Expertise />
            <Projects />
            <Experience />
            <Certifications />
            <Interests />
            <Contact />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
