// Simple confetti effect using canvas
// Based on canvas-confetti but lightweight inline implementation

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  angle?: number;
  origin?: { x?: number; y?: number };
}

export function confetti(options: ConfettiOptions = {}): void {
  if (typeof window === "undefined") return;

  const {
    particleCount = 50,
    spread = 60,
    angle = 90,
    origin = { x: 0.5, y: 0.5 },
  } = options;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Particle[] = [];
  const colors = ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const rad = (angle * Math.PI) / 180;
    const spreadRad = (spread * Math.PI) / 180;

    particles.push({
      x: (origin.x || 0.5) * canvas.width,
      y: (origin.y || 0.5) * canvas.height,
      vx: Math.cos(rad - spreadRad / 2 + Math.random() * spreadRad) * (10 + Math.random() * 10),
      vy: Math.sin(rad - spreadRad / 2 + Math.random() * spreadRad) * (10 + Math.random() * 10) - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  // Animate
  let frame = 0;
  const maxFrames = 150;

  function animate() {
    if (frame >= maxFrames) {
      document.body.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity = 1 - frame / maxFrames;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
}