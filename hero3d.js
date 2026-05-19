// NEG+ Innovations — Hero 3D Particle Network
// Pure canvas · no dependencies · teal + navy palette
// Mouse attraction, pulsing glow, interconnected node mesh

(function () {
  'use strict';

  // ── Per-page config ───────────────────────────────────────────────────────
  const PAGE_CONFIG = {
    'index.html': {
      nodeColor: 'rgba(65,179,163,',    // teal nodes
      lineColor: 'rgba(65,179,163,',    // teal lines
      glowColor: '#41B3A3',
      nodeCount: 80,
      maxDist:   165,
      speed:     0.28,
    },
    'investors.html': {
      nodeColor: 'rgba(119,141,169,',   // slate nodes
      lineColor: 'rgba(65,179,163,',    // teal lines
      glowColor: '#41B3A3',
      nodeCount: 65,
      maxDist:   150,
      speed:     0.22,
    },
    'rd.html': {
      nodeColor: 'rgba(65,179,163,',    // teal nodes
      lineColor: 'rgba(119,141,169,',   // slate lines
      glowColor: '#41B3A3',
      nodeCount: 70,
      maxDist:   155,
      speed:     0.24,
    },
  };

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const cfg  = PAGE_CONFIG[page];
  if (!cfg) return;

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    const mount = document.getElementById('spline-mount');
    if (!mount) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    mount.appendChild(canvas);
    mount.style.opacity = '1';

    // Fade out fallback gradient
    const fallback = document.getElementById('spline-fallback');
    if (fallback) {
      fallback.style.transition = 'opacity 1.2s ease';
      fallback.style.opacity    = '0';
      setTimeout(() => fallback.remove(), 1300);
    }

    const ctx = canvas.getContext('2d');
    let W, H, nodes = [];
    const mouse = { x: -9999, y: -9999 };

    // ── Node ─────────────────────────────────────────────────────────────────
    function Node() { this.reset(); }
    Node.prototype.reset = function () {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * cfg.speed;
      this.vy    = (Math.random() - 0.5) * cfg.speed;
      this.r     = Math.random() * 2 + 1.2;
      this.pulse = Math.random() * Math.PI * 2;
    };
    Node.prototype.update = function () {
      this.x     += this.vx;
      this.y     += this.vy;
      this.pulse += 0.018;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 190) {
        this.x += dx * 0.0018;
        this.y += dy * 0.0018;
      }
    };

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
      W = canvas.width  = mount.offsetWidth  || window.innerWidth;
      H = canvas.height = mount.offsetHeight || 680;
      nodes = [];
      for (let i = 0; i < cfg.nodeCount; i++) nodes.push(new Node());
    }

    // ── Draw ──────────────────────────────────────────────────────────────────
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cfg.maxDist) {
            const alpha = (1 - dist / cfg.maxDist) * 0.32;
            ctx.beginPath();
            ctx.strokeStyle = cfg.lineColor + alpha + ')';
            ctx.lineWidth   = 0.75;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        n.update();
        const pulse = 0.55 + 0.45 * Math.sin(n.pulse);
        const alpha = 0.5  + 0.5  * pulse;
        const r     = n.r  * (0.85 + 0.3 * pulse);

        // Glow halo
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4.5);
        grd.addColorStop(0, cfg.nodeColor + (alpha * 0.45) + ')');
        grd.addColorStop(1, cfg.nodeColor + '0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = cfg.nodeColor + alpha + ')';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    // ── Mouse ─────────────────────────────────────────────────────────────────
    document.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
