import { useEffect, useRef } from 'react';

type Point = { x: number; y: number; vx: number; vy: number };

type Impulse = {
  /** Цепочка индексов точек, по которой бежит импульс. */
  path: number[];
  start: number;
};

type Props = {
  /** Число нейронов (по умолчанию масштабируется от площади). */
  density?: number;
  /** Спокойный режим: без реакции на курсор, реже импульсы (404, внутренние страницы). */
  calm?: boolean;
  className?: string;
};

const LINK_DISTANCE = 120;
const CURSOR_RADIUS = 160;
const IMPULSE_INTERVAL = 2600;
const IMPULSE_SEGMENT_MS = 260;
const MAX_DPR = 1.5;

/**
 * «Нейросеть» над фоном hero: дрейфующие точки, связи по расстоянию, отклик на курсор
 * и импульсы, бегущие по цепочкам связей, — метафора оркестрации. Canvas 2D, без библиотек.
 */
export function NeuralField({ density, calm = false, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    const impulses: Impulse[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const seed = () => {
      const count = density ?? Math.round(Math.min(60, Math.max(28, (width * height) / 24000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (points.length === 0) seed();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      if (calm) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      mouse.active = mouse.y >= 0 && mouse.y <= rect.height;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    /** Случайная цепочка из 4–6 соседних точек. */
    const spawnImpulse = (now: number) => {
      const startIndex = Math.floor(Math.random() * points.length);
      const path = [startIndex];
      const length = 4 + Math.floor(Math.random() * 3);
      while (path.length < length) {
        const current = points[path[path.length - 1] ?? 0];
        if (!current) break;
        const candidates = points
          .map((point, index) => ({
            index,
            distance: Math.hypot(point.x - current.x, point.y - current.y),
          }))
          .filter((item) => item.distance < LINK_DISTANCE && !path.includes(item.index));
        const next = candidates[Math.floor(Math.random() * candidates.length)];
        if (!next) break;
        path.push(next.index);
      }
      if (path.length >= 3) impulses.push({ path, start: now });
    };

    let frame = 0;
    let running = false;
    let visible = true;
    let lastImpulse = 0;

    const draw = (now: number) => {
      frame = 0;
      if (!running) return;
      context.clearRect(0, 0, width, height);

      for (const point of points) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        if (mouse.active) {
          const dx = point.x - mouse.x;
          const dy = point.y - mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < CURSOR_RADIUS && distance > 0) {
            // Лёгкое отталкивание от курсора
            const force = (1 - distance / CURSOR_RADIUS) * 0.35;
            point.x += (dx / distance) * force;
            point.y += (dy / distance) * force;
          }
        }
      }

      context.lineWidth = 1;
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        if (!a) continue;
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j];
          if (!b) continue;
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > LINK_DISTANCE) continue;
          const alpha = (1 - distance / LINK_DISTANCE) * 0.16;
          context.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      for (const point of points) {
        const distance = mouse.active ? Math.hypot(point.x - mouse.x, point.y - mouse.y) : Infinity;
        const near = distance < CURSOR_RADIUS ? 1 - distance / CURSOR_RADIUS : 0;
        if (near > 0) {
          context.strokeStyle = `rgba(103, 232, 249, ${near * 0.35})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(mouse.x, mouse.y);
          context.stroke();
        }
        context.fillStyle = `rgba(199, 210, 254, ${0.35 + near * 0.6})`;
        context.beginPath();
        context.arc(point.x, point.y, 1.2 + near * 1.4, 0, Math.PI * 2);
        context.fill();
      }

      // Импульсы по цепочкам
      if (now - lastImpulse > IMPULSE_INTERVAL * (calm ? 1.8 : 1)) {
        lastImpulse = now;
        spawnImpulse(now);
      }
      for (let k = impulses.length - 1; k >= 0; k -= 1) {
        const impulse = impulses[k];
        if (!impulse) continue;
        const progress = (now - impulse.start) / IMPULSE_SEGMENT_MS;
        const segment = Math.floor(progress);
        if (segment >= impulse.path.length - 1) {
          impulses.splice(k, 1);
          continue;
        }
        const from = points[impulse.path[segment] ?? 0];
        const to = points[impulse.path[segment + 1] ?? 0];
        if (!from || !to) continue;
        const local = progress - segment;
        const x = from.x + (to.x - from.x) * local;
        const y = from.y + (to.y - from.y) * local;
        context.strokeStyle = 'rgba(103, 232, 249, 0.55)';
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(x, y);
        context.stroke();
        const glow = context.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, 'rgba(165, 243, 252, 0.95)');
        glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, 10, 0, Math.PI * 2);
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    const updateRunning = () => {
      const shouldRun = visible && !document.hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      updateRunning();
    });
    intersection.observe(canvas);
    document.addEventListener('visibilitychange', updateRunning);
    updateRunning();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', updateRunning);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [density, calm]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
