// NEG+ Innovations — Hero 3D Scenes · Medical Device Theme
// Three.js · WebGL · No external dependency beyond CDN load
//
// index.html     → Precision Gyroscope    (nested tori — precision measurement instrument)
// investors.html → Sensor Ring Array      (concentric node rings — diagnostic sensing array)
// rd.html        → Surgical Instrument    (wireframe colpotomizer/laparoscopic schematic)

(function () {
  'use strict';

  const page = (window.location.pathname.split('/').pop() || 'index.html').replace(/[?#].*$/, '');
  const VALID = ['index.html', 'investors.html', 'rd.html'];
  if (!VALID.includes(page)) return;

  // ── Load Three.js ─────────────────────────────────────────────────────────
  function loadThree(cb) {
    if (window.THREE) { cb(); return; }
    const s   = document.createElement('script');
    s.src     = 'https://unpkg.com/three@0.158.0/build/three.min.js';
    s.onload  = cb;
    s.onerror = function () { console.warn('NEG+: Three.js unavailable.'); };
    document.head.appendChild(s);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  function init() {
    const mount = document.getElementById('spline-mount');
    if (!mount) return;

    loadThree(function () {
      if (!window.THREE) return;
      const THREE = window.THREE;

      const W = mount.offsetWidth  || Math.round(window.innerWidth * 0.38);
      const H = mount.offsetHeight || 680;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      mount.appendChild(renderer.domElement);

      // Reveal
      mount.style.opacity = '1';
      const fallback = document.getElementById('spline-fallback');
      if (fallback) {
        fallback.style.transition = 'opacity 1.4s ease';
        fallback.style.opacity    = '0';
        setTimeout(() => fallback.remove(), 1500);
      }

      // Scene + Camera
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(56, W / H, 0.1, 200);
      camera.position.set(0, 0, 6.5);

      // Build scene
      const state = {};
      if      (page === 'index.html')     buildGyroscope(THREE, scene, state);
      else if (page === 'investors.html') buildSensorArray(THREE, scene, state);
      else if (page === 'rd.html')        buildInstrument(THREE, scene, state);

      // Mouse parallax
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      document.addEventListener('mousemove', function (e) {
        mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      // Resize
      window.addEventListener('resize', function () {
        const w = mount.offsetWidth  || window.innerWidth;
        const h = mount.offsetHeight || 680;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

      // Pause on hidden tab
      let paused = false;
      document.addEventListener('visibilitychange', function () { paused = document.hidden; });

      // Animate
      let frame = 0;
      function animate() {
        requestAnimationFrame(animate);
        if (paused) return;
        frame++;
        mouse.x += (mouse.tx - mouse.x) * 0.04;
        mouse.y += (mouse.ty - mouse.y) * 0.04;
        camera.position.x  =  mouse.x * 0.55;
        camera.position.y  = -mouse.y * 0.35;
        camera.lookAt(scene.position);
        if (state.animate) state.animate(frame);
        renderer.render(scene, camera);
      }
      animate();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 1 — index.html
  // PRECISION GYROSCOPE — three nested rotating tori on independent axes
  // Evokes: inertial navigation, precision measurement, surgical guidance
  // ═══════════════════════════════════════════════════════════════════════════
  function buildGyroscope(THREE, scene, state) {
    scene.scale.setScalar(0.78); // fit within left-side canvas without spilling into text

    const tealSolid  = new THREE.MeshBasicMaterial({ color: 0x41B3A3 });
    const slateSolid = new THREE.MeshBasicMaterial({ color: 0x5A8FA8 });
    const tealDim    = new THREE.MeshBasicMaterial({ color: 0x2d8c80, transparent: true, opacity: 0.7 });

    // Outer ring — large, rotates around Y
    const outerGeo  = new THREE.TorusGeometry(2.1, 0.032, 12, 100);
    const outerRing = new THREE.Mesh(outerGeo, tealSolid);
    const outerPivot = new THREE.Group();
    outerPivot.add(outerRing);
    scene.add(outerPivot);

    // Equatorial tick marks on outer ring
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const tick  = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, i % 6 === 0 ? 0.18 : 0.08), tickMat);
      tick.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0);
      tick.lookAt(0, 0, 0);
      outerRing.add(tick);
    }

    // Mid ring — tilted 60°, rotates around X
    const midGeo   = new THREE.TorusGeometry(1.5, 0.030, 12, 90);
    const midRing  = new THREE.Mesh(midGeo, slateSolid);
    midRing.rotation.x = Math.PI / 3;
    const midPivot = new THREE.Group();
    midPivot.add(midRing);
    scene.add(midPivot);

    // Inner ring — tilted 45° on Z, rotates around Z
    const innerGeo   = new THREE.TorusGeometry(0.95, 0.028, 10, 80);
    const innerRing  = new THREE.Mesh(innerGeo, tealDim);
    innerRing.rotation.z = Math.PI / 4;
    const innerPivot = new THREE.Group();
    innerPivot.add(innerRing);
    scene.add(innerPivot);

    // Central hub sphere — pulsing
    const hubMat  = new THREE.MeshBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.65 });
    const hub     = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), hubMat);
    scene.add(hub);

    // Hub glow ring (flat torus at equator of hub)
    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.012, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.5 })
    );
    scene.add(glowRing);

    // Axis pole lines (thin lines through the centre on each axis)
    const axisMat = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.25 });
    [[2.3,0,0],[-2.3,0,0],[0,2.3,0],[0,-2.3,0],[0,0,2.3],[0,0,-2.3]].forEach(function (pair, i) {
      if (i % 2 === 0) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...pair),
          new THREE.Vector3(...[[2.3,0,0],[-2.3,0,0],[0,2.3,0],[0,-2.3,0],[0,0,2.3],[0,0,-2.3]][i + 1])
        ]);
        scene.add(new THREE.Line(geo, axisMat));
      }
    });

    addParticles(THREE, scene, 260, 0x41B3A3, 7.5);

    state.animate = function (frame) {
      outerPivot.rotation.y += 0.0055;
      midPivot.rotation.x   += 0.0085;
      innerPivot.rotation.z += 0.011;
      glowRing.rotation.z   += 0.018;
      // Hub pulse
      const pulse = 1 + 0.12 * Math.sin(frame * 0.028);
      hub.scale.setScalar(pulse);
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 2 — investors.html
  // SENSOR RING ARRAY — concentric rings of diagnostic nodes
  // Evokes: POP-Q sensor array, pelvic floor mapping, precision diagnostics
  // ═══════════════════════════════════════════════════════════════════════════
  function buildSensorArray(THREE, scene, state) {
    const group = new THREE.Group();
    scene.add(group);

    const tealMat  = new THREE.MeshBasicMaterial({ color: 0x41B3A3 });
    const slateMat = new THREE.MeshBasicMaterial({ color: 0x778DA9 });

    // Ring definitions: radius, node count, node size, height offset
    const rings = [
      { r: 0.42, n:  6, size: 0.12, y:  0.00, mat: tealMat },
      { r: 0.95, n: 12, size: 0.085, y: 0.00, mat: slateMat },
      { r: 1.55, n: 18, size: 0.070, y: 0.00, mat: tealMat },
      { r: 2.15, n: 24, size: 0.055, y: 0.00, mat: slateMat },
      { r: 2.70, n: 32, size: 0.042, y: 0.00, mat: tealMat },
    ];

    const allNodes     = [];
    const ringPosSets  = [];

    rings.forEach(function (ring, ri) {
      const ringNodes = [];
      for (let i = 0; i < ring.n; i++) {
        const angle = (i / ring.n) * Math.PI * 2;
        const jitter = (Math.sin(i * 31.7 + ri * 17.3) * 0.5 + 0.5 - 0.5) * 0.18;
        const pos = new THREE.Vector3(
          Math.cos(angle) * ring.r,
          ring.y + jitter,
          Math.sin(angle) * ring.r
        );
        ringNodes.push(pos);

        const geo = new THREE.SphereGeometry(ring.size, 8, 6);
        const m   = new THREE.Mesh(geo, ring.mat);
        m.position.copy(pos);
        m.userData.pulseOff = i * 0.38 + ri * 1.2;
        group.add(m);
        allNodes.push(m);
      }
      ringPosSets.push(ringNodes);

      // Ring outline (circle connecting all nodes in this ring)
      const circPts = [...ringNodes, ringNodes[0]];
      const cirGeo  = new THREE.BufferGeometry().setFromPoints(circPts);
      const cirMat  = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: ri === 0 ? 0.5 : 0.22 });
      group.add(new THREE.Line(cirGeo, cirMat));
    });

    // Radial spokes connecting rings outward
    const spokeMat = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.28 });
    const spokeCount = 8;
    for (let s = 0; s < spokeCount; s++) {
      const spoke = ringPosSets.map(function (rps) {
        const idx = Math.round((s / spokeCount) * rps.length) % rps.length;
        return rps[idx];
      });
      const geo = new THREE.BufferGeometry().setFromPoints(spoke);
      group.add(new THREE.Line(geo, spokeMat));
    }

    // Central hub
    const hubMat = new THREE.MeshBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.8 });
    const hub    = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), hubMat);
    group.add(hub);

    // Signal arcs (thin tori at different heights — stacked rings effect)
    const arcMat = new THREE.MeshBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.18 });
    const arcGroup = new THREE.Group();
    [-0.55, 0.55].forEach(function (y) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.008, 6, 60), arcMat);
      arc.rotation.x   = Math.PI / 2;
      arc.position.y   = y;
      arc.userData.floatOff = y;
      arcGroup.add(arc);
    });
    scene.add(arcGroup);

    addParticles(THREE, scene, 220, 0x778DA9, 8.5);

    state.animate = function (frame) {
      group.rotation.y += 0.0040;
      group.rotation.x  = 0.28 * Math.sin(frame * 0.009);
      arcGroup.rotation.y += 0.012;

      // Pulse nodes
      allNodes.forEach(function (m) {
        const s = 1 + 0.22 * Math.sin(frame * 0.024 + m.userData.pulseOff);
        m.scale.setScalar(s);
      });

      // Hub pulse
      const hs = 1 + 0.18 * Math.sin(frame * 0.035);
      hub.scale.setScalar(hs);
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE 3 — rd.html
  // SURGICAL INSTRUMENT SCHEMATIC — wireframe laparoscopic/colpotomizer device
  // Evokes: Belotte Colpotomizer, MIGS instrumentation, device engineering CAD
  // ═══════════════════════════════════════════════════════════════════════════
  function buildInstrument(THREE, scene, state) {
    const group = new THREE.Group();
    scene.add(group);

    // Materials
    const wireMat  = new THREE.MeshBasicMaterial({ color: 0x41B3A3, wireframe: true, transparent: true, opacity: 0.65 });
    const solidMat = new THREE.MeshBasicMaterial({ color: 0x41B3A3 });
    const slateMat = new THREE.MeshBasicMaterial({ color: 0x5A8FA8, transparent: true, opacity: 0.80 });
    const dimMat   = new THREE.MeshBasicMaterial({ color: 0x2d8c80, transparent: true, opacity: 0.5 });

    // ── Main shaft — thin horizontal cylinder ─────────────────────────────
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 3.8, 18), wireMat);
    shaft.rotation.z = Math.PI / 2;
    group.add(shaft);

    // ── Handle body (proximal/left end) ───────────────────────────────────
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.130, 0.72, 14), wireMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.x = -2.1;
    group.add(handle);

    // Grip rings on handle
    const gripMat = new THREE.MeshBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.85 });
    for (let i = -3; i <= 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.020, 8, 22), solidMat);
      ring.rotation.z = Math.PI / 2;
      ring.position.x = -2.1 + i * 0.095;
      group.add(ring);
    }

    // End cap on handle
    const endCap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), solidMat);
    endCap.rotation.z = Math.PI / 2;
    endCap.position.x = -2.47;
    group.add(endCap);

    // ── Working cup / colpotomizer tip (distal/right end) ─────────────────
    // Flared cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.058, 0.55, 20), wireMat);
    cup.rotation.z  = Math.PI / 2;
    cup.position.x  = 2.10;
    group.add(cup);

    // Cup rim torus
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.028, 10, 40), solidMat);
    rim.rotation.z  = Math.PI / 2;
    rim.position.x  = 2.37;
    group.add(rim);

    // Inner cup surface (very transparent)
    const cupInner = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.05, 0.45, 20), dimMat);
    cupInner.rotation.z = Math.PI / 2;
    cupInner.position.x = 2.10;
    group.add(cupInner);

    // ── Mid-shaft collar detail ────────────────────────────────────────────
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.18, 14), slateMat);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = 0.3;
    group.add(collar);

    // ── Floating measurement rings (dimension indicators) ─────────────────
    const measMat    = new THREE.MeshBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.32 });
    const measGroup  = new THREE.Group();
    const measPositions = [-1.4, -0.2, 1.2];
    const measRadii     = [0.38, 0.50, 0.62];
    measPositions.forEach(function (x, i) {
      const mRing = new THREE.Mesh(new THREE.TorusGeometry(measRadii[i], 0.010, 6, 48), measMat);
      mRing.rotation.z  = Math.PI / 2;
      mRing.position.x  = x;
      mRing.userData.floatOff = i * 1.1;
      measGroup.add(mRing);
    });
    group.add(measGroup);

    // ── Dimension tick lines (thin cross-lines at measurement rings) ───────
    const dimLineMat = new THREE.LineBasicMaterial({ color: 0x41B3A3, transparent: true, opacity: 0.35 });
    measPositions.forEach(function (x, i) {
      const r = measRadii[i] + 0.08;
      [[0, r],[0, -r],[r, 0],[-r, 0]].forEach(function (yz) {
        const pts = [
          new THREE.Vector3(x, yz[0], yz[1]),
          new THREE.Vector3(x + 0.30, yz[0], yz[1]),
        ];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dimLineMat));
      });
    });

    addParticles(THREE, scene, 200, 0x41B3A3, 7.5);

    state.animate = function (frame) {
      group.rotation.y += 0.0040;
      group.rotation.x  = 0.10 * Math.sin(frame * 0.013);

      // Measurement rings slowly spin around shaft axis + float
      measGroup.children.forEach(function (ring) {
        ring.rotation.y += 0.022;
        ring.position.y  = 0.12 * Math.sin(frame * 0.019 + ring.userData.floatOff);
      });
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Shared — ambient particle cloud
  // ═══════════════════════════════════════════════════════════════════════════
  function addParticles(THREE, scene, count, color, spread) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.65;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.026, transparent: true, opacity: 0.38 });
    scene.add(new THREE.Points(geo, mat));
  }

  // ── Entry ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
