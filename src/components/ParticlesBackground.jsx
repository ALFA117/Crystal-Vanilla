import { lazy, Suspense, useEffect, useState } from 'react';

// Antes: tsParticles con 55 círculos y estrellas (una librería entera para eso).
// Ahora: aurora de vainilla en CSS (capa lejana) + gota de extracto en Three.js
// (capa cercana), en su propio chunk y cargada cuando el navegador queda libre.
const ExtractScene = lazy(() => import('./ExtractScene'));

export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="cv-amb" aria-hidden="true">
      <div className="cv-amb__aurora" />
      {ready && (
        <Suspense fallback={null}>
          <ExtractScene />
        </Suspense>
      )}
      <div className="cv-amb__veil" />
    </div>
  );
}
