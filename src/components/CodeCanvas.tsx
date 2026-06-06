import { useEffect, useRef } from 'react';

interface Token {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  opacity: number;
}

const CHARS = ['{', '}', '[', ']', '<', '>', '/', '*', '=', '(', ')', ';', ':', '|', '&', '#', '$', '%', '@', '0', '1'];

export default function CodeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tokensRef = useRef<Token[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize tokens
    const tokenCount = Math.floor((window.innerWidth * window.innerHeight) / 12000);
    tokensRef.current = Array.from({ length: tokenCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      char: CHARS[Math.floor(Math.random() * CHARS.length)],
      size: Math.random() * 10 + 10,
      opacity: Math.random() * 0.04 + 0.02,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Draw once, static
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tokensRef.current.forEach((token) => {
        ctx.font = `${token.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(0, 240, 255, ${token.opacity})`;
        ctx.fillText(token.char, token.x, token.y);
      });
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = () => {
      if (!isVisible) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const tokens = tokensRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        // Mouse repulsion
        const dx = t.x - mouse.x;
        const dy = t.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          t.vx += (dx / dist) * force * 0.5;
          t.vy += (dy / dist) * force * 0.5;
        }

        // Damping
        t.vx *= 0.99;
        t.vy *= 0.99;

        // Base drift
        if (Math.abs(t.vx) < 0.05) t.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(t.vy) < 0.05) t.vy += (Math.random() - 0.5) * 0.02;

        t.x += t.vx;
        t.y += t.vy;

        // Wrap around
        if (t.x < -20) t.x = canvas.width + 20;
        if (t.x > canvas.width + 20) t.x = -20;
        if (t.y < -20) t.y = canvas.height + 20;
        if (t.y > canvas.height + 20) t.y = -20;

        // Draw token
        ctx.font = `${t.size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(0, 240, 255, ${t.opacity})`;
        ctx.fillText(t.char, t.x, t.y);

        // Draw connections (limit to nearby tokens)
        for (let j = i + 1; j < tokens.length; j++) {
          const t2 = tokens[j];
          const cdx = t.x - t2.x;
          const cdy = t.y - t2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < 120) {
            const alpha = (1 - cdist / 120) * 0.03;
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
