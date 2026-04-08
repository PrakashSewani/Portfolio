import { useState, useEffect } from 'react';
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
import CustomCursor from './components/CustomCursor';
import { ThemeProvider } from './lib/ThemeContext';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lastShown = localStorage.getItem('preloader_last_shown');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (lastShown && now - parseInt(lastShown) < oneHour) {
      setIsLoading(false);
    }
  }, []);

  const handlePreloaderComplete = () => {
    localStorage.setItem('preloader_last_shown', Date.now().toString());
    setIsLoading(false);
  };

  return (
    <ThemeProvider>
      <div className="scanline" />
      <CustomCursor />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Preloader key="preloader" onComplete={handlePreloaderComplete} />
        ) : (
          <motion.main
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
    </ThemeProvider>
  );
}
