import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Expertise from './components/Expertise';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Interests from './components/Interests';
import Contact from './components/Contact';
import { ThemeProvider } from './lib/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <main className="relative min-h-screen">
        <Navbar />
        <Hero />
        <Expertise />
        <Projects />
        <Experience />
        <Interests />
        <Contact />
      </main>
    </ThemeProvider>
  );
}
