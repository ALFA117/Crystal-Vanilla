import { useEffect, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const particlesLoaded = useCallback(() => {}, []);

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={particlesLoaded}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: 40,
        interactivity: { events: { resize: true } },
        particles: {
          color: { value: ['#D4A017', '#F5C842', '#E8A020', '#F0B429'] },
          move: {
            direction: 'none',
            enable: true,
            outModes: { default: 'out' },
            random: true,
            speed: 0.4,
            straight: false,
          },
          number: { density: { enable: true }, value: 55 },
          opacity: {
            value: { min: 0.05, max: 0.25 },
            animation: { enable: true, speed: 0.5, sync: false },
          },
          shape: { type: ['circle', 'star'] },
          size: {
            value: { min: 1.5, max: 4 },
            animation: { enable: true, speed: 1, sync: false },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
