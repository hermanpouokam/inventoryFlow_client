"use client"; // si tu es en App Router

import { useEffect } from "react";

export default function CircuitBackground() {
  useEffect(() => {
    const svg = document.getElementById("circuit");
    const width = window.innerWidth;
    const height = window.innerHeight;

    function getRandomEdgePosition() {
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0:
          return { x: Math.random() * width, y: 0 };
        case 1:
          return { x: width, y: Math.random() * height };
        case 2:
          return { x: Math.random() * width, y: height };
        case 3:
          return { x: 0, y: Math.random() * height };
      }
    }

    function createSegmentLine(x, y, segments = 8, length = 100) {
      const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      let d = `M${x},${y}`;
      let points = [[x, y]];
      for (let i = 0; i < segments; i++) {
        const [dx, dy] = directions[Math.floor(Math.random() * 4)];
        x += dx * length;
        y += dy * length;
        x = Math.max(0, Math.min(width, x));
        y = Math.max(0, Math.min(height, y));
        d += ` L${x},${y}`;
        points.push([x, y]);
      }
      return { d, points };
    }

    function createAnimatedLine() {
      const start = getRandomEdgePosition();
      const segments = 8;
      const { d, points } = createSegmentLine(start.x, start.y, segments);

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", d);
      path.setAttribute("stroke", "#0ea5e9");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("filter", "drop-shadow(0 0 4px #0ea5e9)");
      path.style.strokeWidth = "6";
      path.style.strokeDasharray = "1000";
      path.style.strokeDashoffset = "1000";
      path.style.animation = `dashMove ${
        3 + Math.random() * 3
      }s linear forwards`;

      svg.appendChild(path);

      // Épaisseur dynamique
      let thickness = 6;
      let step = 0;
      const interval = setInterval(() => {
        if (step >= points.length) {
          clearInterval(interval);
        } else {
          path.style.strokeWidth = Math.max(1, thickness - step * 0.6);
          step++;
        }
      }, 180);

      setTimeout(() => {
        svg.removeChild(path);
      }, 5000);
    }

    const interval = setInterval(createAnimatedLine, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      id="circuit"
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
    >
      <style>{`
        @keyframes dashMove {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}
