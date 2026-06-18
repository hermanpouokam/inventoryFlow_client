import React, { useEffect, useLayoutEffect, useRef } from "react";

interface Point { x: number; y: number }
interface Worm {
  x: number; y: number;
  angle: number; speed: number;
  turnSpeed: number; turnChange: number; turnTimer: number;
  radius: number; length: number;
  color: string; alpha: number;
  tail: Point[]; dead: boolean;
  distTraveled: number;
  minDist: number;
}

const WORM_COLORS = [
  "rgba(99,102,241,",
  "rgba(139,92,246,",
  "rgba(59,130,246,",
  "rgba(167,139,250,",
  "rgba(196,181,253,",
];

function rand(a: number, b: number) { return a + Math.random() * (b - a); }
function randInt(a: number, b: number) { return Math.floor(rand(a, b)); }

function spawnWorm(W: number, H: number): Worm {
  const side = randInt(0, 4);
  let x = 0, y = 0;
  if (side === 0) { x = rand(0, W); y = -20; }
  else if (side === 1) { x = W + 20; y = rand(0, H); }
  else if (side === 2) { x = rand(0, W); y = H + 20; }
  else { x = -20; y = rand(0, H); }
  return {
    x, y,
    angle: Math.atan2(H / 2 - y, W / 2 - x) + rand(-1.2, 1.2),
    speed: rand(0.7, 2.0),
    turnSpeed: rand(0.012, 0.045) * (Math.random() < 0.5 ? 1 : -1),
    turnChange: rand(80, 240),
    turnTimer: 0,
    radius: rand(2.5, 6.5),
    length: randInt(60, 200),
    color: WORM_COLORS[randInt(0, WORM_COLORS.length)],
    alpha: rand(0.22, 0.55),
    tail: [], dead: false,
    distTraveled: 0,
    minDist: Math.sqrt(W * W + H * H) * rand(0.5, 0.85),
  };
}

function stepWorm(w: Worm, W: number, H: number) {
  w.turnTimer++;
  if (w.turnTimer > w.turnChange) {
    w.turnSpeed = rand(0.015, 0.055) * (Math.random() < 0.5 ? 1 : -1);
    w.turnChange = rand(60, 220);
    w.turnTimer = 0;
  }
  w.angle += w.turnSpeed;
  w.x += Math.cos(w.angle) * w.speed;
  w.y += Math.sin(w.angle) * w.speed;
  w.distTraveled += w.speed;
  w.tail.unshift({ x: w.x, y: w.y });
  if (w.tail.length > w.length) w.tail.pop();
  const pad = 60;
  const outOfBounds = w.x < -pad || w.x > W + pad || w.y < -pad || w.y > H + pad;
  if (outOfBounds && w.distTraveled >= w.minDist) w.dead = true;
}

function paintWorm(ctx: CanvasRenderingContext2D, w: Worm) {
  for (let i = 0; i < w.tail.length - 1; i++) {
    const t = 1 - i / w.tail.length;
    const r = w.radius * t;
    if (r < 0.3) continue;
    ctx.beginPath();
    ctx.arc(w.tail[i].x, w.tail[i].y, r, 0, Math.PI * 2);
    ctx.fillStyle = w.color + (w.alpha * t).toFixed(2) + ")";
    ctx.fill();
  }
}

// --- Canvas component ---
export default function WormsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let worms: Worm[] = [];
    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 20; i++) worms.push(spawnWorm(canvas.width, canvas.height));
    const loop = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      worms.forEach((w) => { stepWorm(w, W, H); paintWorm(ctx, w); });
      worms = worms.filter((w) => !w.dead);
      while (worms.length < 14) worms.push(spawnWorm(W, H));
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <>
    <style>{`
        @keyframes morph1 {
          0%,100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%; transform: translate(0,0) rotate(0deg); }
          25%     { border-radius: 40% 70% 30% 60% / 60% 30% 70% 40%; transform: translate(30px,-20px) rotate(15deg); }
          50%     { border-radius: 70% 30% 50% 50% / 30% 70% 50% 60%; transform: translate(-20px,30px) rotate(-10deg); }
          75%     { border-radius: 30% 60% 40% 70% / 70% 40% 60% 30%; transform: translate(25px,15px) rotate(20deg); }
        }
        @keyframes morph2 {
          0%,100% { border-radius: 40% 60% 50% 70% / 60% 40% 70% 30%; transform: translate(0,0) rotate(0deg); }
          30%     { border-radius: 70% 30% 60% 40% / 40% 70% 30% 60%; transform: translate(-35px,25px) rotate(-18deg); }
          60%     { border-radius: 50% 60% 30% 70% / 70% 30% 60% 40%; transform: translate(20px,-30px) rotate(12deg); }
        }
        @keyframes morph3 {
          0%,100% { border-radius: 55% 45% 65% 35% / 45% 65% 35% 55%; transform: translate(0,0) rotate(0deg); }
          40%     { border-radius: 35% 65% 45% 55% / 65% 35% 55% 45%; transform: translate(28px,35px) rotate(-22deg); }
          70%     { border-radius: 65% 35% 55% 45% / 35% 65% 45% 55%; transform: translate(-30px,-20px) rotate(15deg); }
        }
        @keyframes morph4 {
          0%,100% { border-radius: 45% 55% 60% 40% / 55% 45% 40% 60%; transform: translate(0,0) rotate(0deg); }
          35%     { border-radius: 60% 40% 45% 55% / 40% 60% 55% 45%; transform: translate(-25px,-35px) rotate(25deg); }
          65%     { border-radius: 40% 60% 55% 45% / 60% 40% 45% 55%; transform: translate(35px,20px) rotate(-15deg); }
        }
      `}</style>

    {/* Blob indigo — haut gauche */}
    <div className="absolute pointer-events-none" style={{
      width: 480, height: 380, top: -120, left: -100,
      background: "#6366f1", filter: "blur(100px)", opacity: 0.4,
      animation: "morph1 14s ease-in-out infinite",
    }} />
    {/* Blob rose — bas droite */}
    <div className="absolute pointer-events-none" style={{
      width: 360, height: 420, bottom: -130, right: -80,
      background: "#ec4899", filter: "blur(100px)", opacity: 0.35,
      animation: "morph2 18s ease-in-out infinite",
    }} />
    {/* Blob cyan — bas gauche */}
    <div className="absolute pointer-events-none" style={{
      width: 300, height: 260, bottom: 40, left: 20,
      background: "#06b6d4", filter: "blur(100px)", opacity: 0.28,
      animation: "morph3 12s ease-in-out infinite",
    }} />
    {/* Blob ambre — haut droite */}
    <div className="absolute pointer-events-none" style={{
      width: 220, height: 280, top: 60, right: 40,
      background: "#f59e0b", filter: "blur(100px)", opacity: 0.25,
      animation: "morph4 16s ease-in-out infinite",
    }} />

    {/* <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" /> */}
  </>;
}