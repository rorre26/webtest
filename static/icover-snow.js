const canvas = document.getElementById("icover-snow");
const context = canvas?.getContext("2d");

if (canvas && context) {
  const particles = [];
  const density = 120;
  const speedMultiplier = 1.2;
  const pointer = { x: null, y: null };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 10 + Math.random() * 6;
    return {
      x,
      y,
      size,
      speed: (0.4 + Math.random() * 0.6) * speedMultiplier,
      drift: (Math.random() - 0.5) * 0.3,
      vx: 0,
      vy: 0,
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < density; i += 1) {
      particles.push(createParticle());
    }
  }

  function updateParticle(particle) {
    particle.y += particle.speed + particle.vy;
    particle.x += particle.drift + particle.vx;
    particle.vx *= 0.92;
    particle.vy *= 0.92;

    if (pointer.x !== null && pointer.y !== null) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 80) {
        const force = (80 - distance) / 80;
        particle.vx += (dx / distance) * force * 0.8;
        particle.vy += (dy / distance) * force * 0.8;
      }
    }

    if (particle.y > canvas.height + 20) {
      particle.y = -20;
      particle.x = Math.random() * canvas.width;
    }

    if (particle.x > canvas.width + 40) {
      particle.x = -40;
    }

    if (particle.x < -40) {
      particle.x = canvas.width + 40;
    }
  }

  function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0.55)";
    context.textAlign = "center";
    context.textBaseline = "middle";

    particles.forEach((particle) => {
      updateParticle(particle);
      context.font = `${particle.size}px Inter, Segoe UI, sans-serif`;
      context.fillText("icover", particle.x, particle.y);
    });

    requestAnimationFrame(render);
  }

  window.addEventListener("resize", () => {
    resize();
  });

  window.addEventListener("mousemove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });

  window.addEventListener("touchmove", (event) => {
    if (event.touches.length > 0) {
      pointer.x = event.touches[0].clientX;
      pointer.y = event.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    pointer.x = null;
    pointer.y = null;
  });

  init();
  render();
}
