import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Fondo ambiental (receta 6 de /diseno: malla low-poly con Three.js), adaptado
 * a Crystal Vanilla como una gota de extracto: un icosaedro estirado en forma
 * de gota, de alambre ámbar, que respira y gira despacio; adentro, un núcleo
 * dorado; alrededor flotan semillas de vainilla (motas café) y destellos
 * dorados. Sobre el fondo marfil va tenue para no competir con los números.
 * El puntero mueve la cámara y el scroll aleja la escena. Pausa con la pestaña
 * oculta, DPR ≤ 2, menos partículas en celular y un solo cuadro quieto con
 * prefers-reduced-motion.
 */
function dropGeometry(detail) {
  const g = new THREE.IcosahedronGeometry(1.2, detail);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    // La parte de arriba se afila hacia la punta; la de abajo queda redonda.
    const t = (y + 1.2) / 2.4;
    const squeeze = t > 0.5 ? 1 - Math.pow((t - 0.5) * 2, 1.6) * 0.85 : 1;
    pos.setX(i, pos.getX(i) * squeeze);
    pos.setZ(i, pos.getZ(i) * squeeze);
    pos.setY(i, y * (y > 0 ? 1.45 : 1));
  }
  g.computeVertexNormals();
  return g;
}

function cloud(count, rMin, rMax) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
    arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    arr[i * 3 + 2] = r * Math.cos(ph);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  return g;
}

export default function ExtractScene() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const dropGeo = dropGeometry(mobile ? 1 : 2);
    const dropMat = new THREE.MeshBasicMaterial({ color: 0xd4a017, wireframe: true, transparent: true, opacity: 0.32 });
    const drop = new THREE.Mesh(dropGeo, dropMat);
    const coreGeo = new THREE.IcosahedronGeometry(0.45, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xe8a020, wireframe: true, transparent: true, opacity: 0.55 });
    const core = new THREE.Mesh(coreGeo, coreMat);

    const seedsGeo = cloud(mobile ? 220 : 480, 2.2, 4.6);
    const seedsMat = new THREE.PointsMaterial({ color: 0x3b2a1a, size: mobile ? 0.05 : 0.04, transparent: true, opacity: 0.45, depthWrite: false });
    const seeds = new THREE.Points(seedsGeo, seedsMat);
    const flecksGeo = cloud(mobile ? 120 : 260, 1.8, 4);
    const flecksMat = new THREE.PointsMaterial({ color: 0xf0b429, size: mobile ? 0.07 : 0.055, transparent: true, opacity: 0.6, depthWrite: false });
    const flecks = new THREE.Points(flecksGeo, flecksMat);

    const group = new THREE.Group();
    group.add(drop, core, seeds, flecks);
    scene.add(group);

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      group.position.set(mobile ? 1.2 : w > 1100 ? 3.6 : 2.8, mobile ? -2.4 : -0.3, 0);
      group.scale.setScalar(mobile ? 0.7 : 1);
    };
    resize();
    window.addEventListener('resize', resize);

    let px = 0, py = 0, scroll = 0;
    const onMove = (e) => {
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => { scroll = window.scrollY; };
    if (!reduce && window.matchMedia('(pointer: fine)').matches) window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      const t = clock.getElapsedTime();
      drop.rotation.y += 0.003;
      drop.rotation.z = Math.sin(t * 0.4) * 0.08;
      drop.scale.setScalar(1 + Math.sin(t * 0.9) * 0.03);
      core.rotation.y -= 0.006;
      core.rotation.x += 0.003;
      seeds.rotation.y += 0.0006;
      flecks.rotation.y -= 0.001;
      flecks.position.y = Math.sin(t * 0.3) * 0.15;
      camera.position.x += (px * 0.5 - camera.position.x) * 0.04;
      camera.position.y += (-py * 0.35 - Math.min(scroll * 0.001, 1.2) - camera.position.y) * 0.04;
      camera.position.z = 8 + Math.min(scroll * 0.0012, 2);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame);
    };
    if (reduce) renderer.render(scene, camera);
    else {
      raf = requestAnimationFrame(frame);
      document.addEventListener('visibilitychange', onVis);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      [dropGeo, coreGeo, seedsGeo, flecksGeo].forEach((g) => g.dispose());
      [dropMat, coreMat, seedsMat, flecksMat].forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="cv-amb__canvas" />;
}
