import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Expertise from './components/Expertise';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';

export default function App() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <Expertise />
      <Projects />
      <Experience />
      <Contact />
    </main>
  );
}
