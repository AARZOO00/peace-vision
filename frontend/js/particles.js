// ═══════════════════════════════════════
//   PEACE VISION — Particles (Updated)
//   Teal + Rose Gold palette
//   Mouse repulsion interaction
// ═══════════════════════════════════════

(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  const COLORS = [
    '58, 184, 204',   // teal glow
    '212, 149, 106',  // rose gold
    '42, 122, 140',   // teal bright
    '232, 184, 154',  // rose light
    '248, 244, 239',  // pearl
  ];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle(fromBottom = false) {
    return {
      x: Math.random() * canvas.width,
      y: fromBottom ? canvas.height + 5 : Math.random() * canvas.height,
      size: Math.random() * 2 + 0.4,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -(Math.random() * 0.35 + 0.08),
      opacity: Math.random() * 0.55 + 0.08,
      life: fromBottom ? 1 : Math.random(),
      decay: Math.random() * 0.002 + 0.0005,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2, // phase offset for pulsing
    };
  }

  function init() {
    particles = [];
    const density = Math.floor((canvas.width * canvas.height) / 7000);
    const count = Math.min(Math.max(density, 30), 120);
    for (let i = 0; i < count; i++) particles.push(createParticle(false));
  }

  function drawConnections() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.06 * particles[i].life * particles[j].life;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(58, 184, 204, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Mouse repulsion
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 120) {
        const force = (120 - mdist) / 120;
        p.x += (mdx / mdist) * force * 1.2;
        p.y += (mdy / mdist) * force * 1.2;
      }

      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= p.decay;
      p.pulse += 0.02;

      // Respawn
      if (p.life <= 0 || p.y < -10 || p.x < -20 || p.x > canvas.width + 20) {
        particles[i] = createParticle(true);
        continue;
      }

      // Subtle pulsing size
      const s = p.size + Math.sin(p.pulse) * 0.3;
      const alpha = p.opacity * p.life;

      // Draw glow
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3);
      gradient.addColorStop(0, `rgba(${p.color}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, s * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw core
      ctx.beginPath();
      ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  // Mouse tracking
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener('resize', () => { resize(); init(); });

  resize();
  init();
  requestAnimationFrame(animate);
})();