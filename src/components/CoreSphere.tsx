import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CoreSphereProps {
  onGesture: (gesture: 'petting' | 'tickling') => void;
}

export const CoreSphere = ({ onGesture }: CoreSphereProps) => {
  const sphereRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout>();
  const pathRef = useRef<Array<{ x: number; y: number; time: number }>>([]);

  const detectCircularMotion = (path: Array<{ x: number; y: number; time: number }>) => {
    if (path.length < 10) return false;

    const angles: number[] = [];
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const angle = Math.atan2(dy, dx);
      angles.push(angle);
    }

    let totalRotation = 0;
    for (let i = 1; i < angles.length; i++) {
      let diff = angles[i] - angles[i - 1];
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;
      totalRotation += diff;
    }

    return Math.abs(totalRotation) > Math.PI * 1.5;
  };

  const handlePointerDown = () => {
    setIsInteracting(true);
    pathRef.current = [];
    setClickCount((prev) => prev + 1);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCount >= 5) {
        onGesture('tickling');
      }
      setClickCount(0);
    }, 500);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting) return;

    const rect = sphereRef.current?.getBoundingClientRect();
    if (!rect) return;

    pathRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    });

    if (pathRef.current.length > 20) {
      pathRef.current.shift();
    }
  };

  const handlePointerUp = () => {
    setIsInteracting(false);

    if (detectCircularMotion(pathRef.current)) {
      onGesture('petting');
    }

    pathRef.current = [];
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <motion.div
        ref={sphereRef}
        className="absolute w-24 h-24 rounded-full cursor-pointer select-none touch-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--color-secondary), var(--color-primary))`,
          boxShadow: `
            0 0 40px var(--color-glow),
            0 0 80px rgba(var(--color-glow), calc(var(--glow-intensity) * 0.6)),
            inset 0 0 30px rgba(255, 255, 255, 0.2)
          `,
        }}
        animate={{
          scale: isInteracting ? 1.1 : 1,
          rotateY: [0, 360],
          rotateX: [0, 15, 0, -15, 0],
        }}
        transition={{
          scale: { duration: 0.2 },
          rotateY: { duration: 20, repeat: Infinity, ease: 'linear' },
          rotateX: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, transparent 60%, var(--color-glow) 100%)`,
          opacity: 0.2,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
