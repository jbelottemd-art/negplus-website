// NEG+ Innovations — Hero 3D Scenes
// Three.js · WebGL · No external design tool required
// Page-specific: DNA helix (index) · Crystal (investors) · Molecular network (rd)

(function () {
  'use strict';

  const page = (window.location.pathname.split('/').pop() || 'index.html').replace(/[?#].*$/, '');
  const VALID_PAGES = ['index.html', 'investors.html', 'rd.html'];
  if (!VALID_PAGES.includes(page)) return;

  // ── Load Three.js from CDN ────────────────────────────────────────────────
  function loadThree(cb) {
    if (window.THREE) { cb(); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/three@0.158.0/build/three.min.js';
    s.onload = cb;
    s.onerror = function () { console.warn('NEG+: Three.js failed to load, using canvas fallback.'); };
    document.head.appendChild(s);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  function init() {
    const mount = document.getElementById('spline-mount');
    if (!mount) return;

    loadThree(function () {
      if (!window.THREE) return;
      const THREE = window.THREE;

      // ── Renderer ──────────────────────────────────────────────────────────
      const W = mount.offsetWidth  || window.innerWidth;
      const H = mount.offsetHeight || 680;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      mount.appendChild(renderer.domElement);

      // Reveal mount, hide fallback
      mount.style.opacity = '1';
      const fallback = document.getElementById('spline-fallback');
      if (fallback) {
        fallback.style.transition = 'opacity 1.4s ease';
        fallback.style.opacity    = '0';
        setTimeout(() => fallback.remove(), 1500);
      }

      // ── Scene + Camera ─────────────────────────────────────────────────────
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 200);
      camera.position.set(0, 0, 6);

      // ── Build page scene ──────────────────────────────────────────────────
      const sceneState = {};
      if      (page === 'index.html')     buildHelix(THREE, scene, sceneState);
      else if (page === 'investors.html') buildCrystal(THREE, scene, sceneState);
      else if (page === 'rd.html')        buildMolecular(THREE, scene, sceneState);

      // ── Mouse parallax ────────────────────────────────────────────────────
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      document.addEventListener('mousemove', function (e) {
        mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      // ── Resize ────────────────────────────────────────────────────────────
      window.addEventListener('resize', function () {
        const w = mount.offsetWidth  || window.innerWidth;
        const h = mount.offsetHeight || 680;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

      // ── Pause when not visible ────────────────────────────────────────────
      let paused = false;
      document.addEventListener('visibilitychange', function () {
        paused = document.hidden;
      });

      // ── Animate ───────────────────────────────────────────────────────────
      let frame = 0;
      function animate() {
        requestAnimationFrame(animate);
        if (paused) return;
        frame++;

        // Smooth camera drift
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        camera.position.x  = mouse.x *  0.6;
        camera.position.y  = mouse.y * -0.4;
        camera.lookAt(scene.position);

        // Per-scene animation callbacks
        if (sceneState.animate) sceneState.animate(frame);

        renderer.render(scene, camera);
      }
      animate();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 1 — index.html — DNA Double Helix
  // Teal + slate dual strands, connecting rungs, ambient particles
  // ═══════════════════════════════════════════════════════════════════════════
  function buildHelix(THREE, scene, state) {
    const group = new THREE.Group();
    scene.add(group);

    const TEAL_MAT  = new THREE.MeshBasicMaterial({ color: 0x41B3A3 });
    const SLATE_MAT = new THREE.MeshBasicMaterial({ color: 0x5A8FA8 });
    const RUNG_MAT  = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.45 });

    const TURNS  = 2.5;
    const POINTS = 90;
    const RADIUS = 1.15;
    const HEIGHT = 4.2;

    const s1 = [], s2 = [];
    for (let i = 0; i <= POINTS; i++) {
      const t     = i / POINTS;
      const angle = t * TURNS * Math.PI * 2;
      const y     = (t - 0.5) * HEIGHT;
      s1.push(new THREE.Vector3(Math.cos(angle)          * RADIUS, y, Math.sin(angle)          * RADIUS));
      s2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS));
    }

    // Strand spheres
    const sphereGeo = new THREE.SphereGeometry(0.055, 8, 6);
    s1.forEach(p => { const m = new THREE.Mesh(sphereGeo, TEAL_MAT);  m.position.copy(p); group.add(m); });
    s2.forEach(p => { const m = new THREE.Mesh(sphereGeo, SLATE_MAT); m.position.copy(p); group.add(m); });

    // Connecting rungs every 6 nodes
    for (let i = 0; i < POINTS; i += 6) {
      const geo = new THREE.BufferGeometry().setFromPoints([s1[i], s2[i]]);
      group.add(new THREE.Line(geo, RUNG_MAT));
    }

    // Subtle strand curve lines
    const curve1Geo = new THREE.BufferGeometry().setFromPoints(s1);
    const curve2Geo = new THREE.BufferGeometry().setFromPoints(s2);
    const curveMat  = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.18 });
    group.add(new THREE.Line(curve1Geo, curveMat));
    group.add(new THREE.Line(curve2Geo, curveMat));

    addParticles(THREE, scene, 280, 0x41B3A3, 7);

    state.animate = function (frame) {
      group.rotation.y += 0.0045;
      group.position.y  = Math.sin(frame * 0.012) * 0.12;
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 2 — investors.html — Crystal Icosahedron
  // Layered wireframe shells, orbiting spheres, pulsing inner core
  // ═══════════════════════════════════════════════════════════════════════════
  function buildCrystal(THREE, scene, state) {
    // Outer shell
    const outerGroup = new THREE.Group();
    scene.add(outerGroup);

    const outerGeo  = new THREE.IcosahedronGeometry(2.2, 1);
    const outerWire = new THREE.WireframeGeometry(outerGeo);
    const outerMat  = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.28 });
    outerGroup.add(new THREE.LineSegments(outerWire, outerMat));

    // Mid shell
    const midGroup = new THREE.Group();
    scene.add(midGroup);
    const midGeo  = new THREE.OctahedronGeometry(1.4, 0);
    const midWire = new THREE.WireframeGeometry(midGeo);
    const midMat  = new THREE.LineBasicMaterial({ color: 0x778DA9, transparent: true, opacity: 0.55 });
    midGroup.add(new THREE.LineSegments(midWire, midMat));

    // Inner core
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x41B3A3, wireframe: true, transparent: true, opacity: 0.75 });
    coreGroup.add(new THREE.Mesh(coreGeo, coreMat));

    // Orbiting spheres on three tilted planes
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0x41B3A3 });
    const dotGeo   = new THREE.SphereGeometry(0.11, 10, 8);
    const orbits   = [
      { r: 2.7, speed:  0.013, tiltZ: 0,              tiltX: 0 },
      { r: 3.0, speed: -0.009, tiltZ: Math.PI / 3,    tiltX: Math.PI / 6 },
      { r: 3.3, speed:  0.006, tiltZ: -Math.PI / 4,   tiltX: Math.PI / 4 },
    ];
    const orbitPivots = orbits.map(function (o) {
      const pivot = new THREE.Group();
      pivot.rotation.z = o.tiltZ;
      pivot.rotation.x = o.tiltX;
      const dot = new THREE.Mesh(dotGeo, orbitMat);
      dot.position.x = o.r;
      pivot.add(dot);
      scene.add(pivot);
      return { pivot, speed: o.speed };
    });

    addParticles(THREE, scene, 240, 0x778DA9, 9);

    state.animate = function (frame) {
      outerGroup.rotation.y += 0.005;
      outerGroup.rotation.x += 0.0015;
      midGroup.rotation.y   -= 0.007;
      midGroup.rotation.z   += 0.003;
      coreGroup.rotation.y  += 0.012;
      coreGroup.rotation.x  -= 0.005;

      // Pulsing core scale
      const pulse = 1 + 0.07 * Math.sin(frame * 0.025);
      coreGroup.scale.setScalar(pulse);

      orbitPivots.forEach(function (o) { o.pivot.rotation.y += o.speed; });
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 3 — rd.html — 3D Molecular Network
  // Randomised node graph in 3D space, bond edges, pulsing nodes
  // ═══════════════════════════════════════════════════════════════════════════
  function buildMolecular(THREE, scene, state) {
    const group = new THREE.Group();
    scene.add(group);

    const NODE_COUNT = 24;
    const SPREAD     = 2.6;
    const BOND_DIST  = 1.75;

    // Seeded-ish positions using fixed values for repeatability
    const seed = [
      [ 0.62,-0.14, 0.55],[-0.80, 0.45,-0.30],[ 0.10,-0.90, 0.70],[-0.50,-0.30,-0.80],
      [ 0.90, 0.70,-0.20],[-0.20, 0.80, 0.60],[ 0.50,-0.60,-0.50],[-0.70, 0.20, 0.90],
      [ 0.30, 0.50,-0.70],[-0.90,-0.60, 0.10],[ 0.80,-0.10, 0.30],[-0.40, 0.90,-0.50],
      [ 0.15,-0.75, 0.90],[-0.60, 0.55, 0.40],[ 0.70, 0.30, 0.85],[-0.85,-0.40,-0.30],
      [ 0.40, 0.85,-0.15],[-0.30,-0.80, 0.60],[ 0.95, 0.20,-0.50],[-0.10, 0.65, 0.80],
      [ 0.55,-0.90,-0.20],[-0.75, 0.10, 0.70],[ 0.20, 0.40,-0.90],[-0.45, 0.80, 0.30],
    ];

    const nodes = seed.slice(0, NODE_COUNT).map(([x, y, z]) =>
      new THREE.Vector3(x * SPREAD, y * SPREAD * 0.7, z * SPREAD)
    );

    // Node meshes — vary size by index
    const tealMat  = new THREE.MeshBasicMaterial({ color: 0x41B3A3 });
    const slateMat = new THREE.MeshBasicMaterial({ color: 0x778DA9 });
    const navyMat  = new THREE.MeshBasicMaterial({ color: 0x5A8FA8 });

    const meshes = [];
    nodes.forEach(function (pos, i) {
      const r   = i % 5 === 0 ? 0.16 : i % 3 === 0 ? 0.10 : 0.065;
      const geo = new THREE.SphereGeometry(r, 10, 8);
      const mat = i % 4 === 0 ? tealMat : i % 4 === 1 ? slateMat : navyMat;
      const m   = new THREE.Mesh(geo, mat);
      m.position.copy(pos);
      m.userData.baseScale = 1;
      m.userData.pulseOff  = i * 0.41;
      group.add(m);
      meshes.push(m);
    });

    // Bond lines
    const bondMat = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.38 });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < BOND_DIST) {
          const geo = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
          group.add(new THREE.Line(geo, bondMat));
        }
      }
    }

    addParticles(THREE, scene, 220, 0x41B3A3, 8);

    state.animate = function (frame) {
      group.rotation.y += 0.004;
      group.rotation.x += 0.0012;
      // Pulse individual nodes
      meshes.forEach(function (m) {
        const s = 1 + 0.18 * Math.sin(frame * 0.022 + m.userData.pulseOff);
        m.scale.setScalar(s);
      });
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Shared — ambient point cloud
  // ═══════════════════════════════════════════════════════════════════════════
  function addParticles(THREE, scene, count, color, spread) {
    const geo  = new THREE.BufferGeometry();
    const pos  = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.028, transparent: true, opacity: 0.4 });
    scene.add(new THREE.Points(geo, mat));
  }

  // ── Entry ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
