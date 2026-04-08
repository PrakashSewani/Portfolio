import React, { useEffect, useRef, useState } from 'react';
import { domToCanvas } from 'modern-screenshot';

interface ThanosSnapProps {
  trigger: boolean;
  onComplete: () => void;
  children: React.ReactNode;
}

export default function ThanosSnap({ trigger, onComplete, children }: ThanosSnapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isSnapping, setIsSnapping] = useState(false);

  useEffect(() => {
    if (trigger && !isSnapping && containerRef.current) {
      startSnap();
    }
  }, [trigger]);

  const startSnap = async () => {
    if (!containerRef.current || !canvasContainerRef.current) return;
    
    setIsSnapping(true);
    
    try {
      // Capture the element using modern-screenshot which handles oklch/oklab better
      const canvas = await domToCanvas(containerRef.current, {
        scale: 1,
        features: {
          // Disable some features that might cause issues if needed
        }
      });

      const { width, height } = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Hide the original content
      containerRef.current.style.opacity = '0';

      // Create particle layers
      const layerCount = 32;
      const layers: HTMLCanvasElement[] = [];

      for (let i = 0; i < layerCount; i++) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = width;
        layerCanvas.height = height;
        const layerCtx = layerCanvas.getContext('2d');
        if (layerCtx) {
          layers.push(layerCanvas);
        }
      }

      // Distribute pixels to layers
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          if (data[index + 3] > 0) { // If pixel is not transparent
            const layerIndex = Math.floor(layerCount * (Math.random() + (2 * x) / width) / 3);
            const targetLayer = layers[layerIndex];
            if (targetLayer) {
              const targetCtx = targetLayer.getContext('2d');
              if (targetCtx) {
                targetCtx.fillStyle = `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${data[index + 3] / 255})`;
                targetCtx.fillRect(x, y, 1, 1);
              }
            }
          }
        }
      }

      // Add layers to the container and animate
      layers.forEach((layer, i) => {
        layer.style.position = 'absolute';
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.transition = `all 1.5s ease-out ${i / layerCount}s`;
        layer.style.pointerEvents = 'none';
        canvasContainerRef.current?.appendChild(layer);

        // Trigger animation in next frame
        requestAnimationFrame(() => {
          const rotate = (Math.random() - 0.5) * 40;
          layer.style.transform = `translate(${100 + i * 2}px, ${-50 + (Math.random() - 0.5) * 100}px) rotate(${rotate}deg)`;
          layer.style.opacity = '0';
          layer.style.filter = 'blur(1px)';
        });
      });

      // Complete after animations
      setTimeout(() => {
        onComplete();
      }, 3500);
    } catch (error) {
      console.error('Snap failed:', error);
      onComplete(); // Fallback to complete even if snap fails
    }
  };

  return (
    <div className="relative">
      <div ref={containerRef} className="transition-opacity duration-300">
        {children}
      </div>
      <div 
        ref={canvasContainerRef} 
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 50 }}
      />
    </div>
  );
}
