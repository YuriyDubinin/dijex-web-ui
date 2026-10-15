import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { BrainCircuit, ChartLine, Cloud, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useContent } from '@/i18n/useContent';
import { cn } from '@/lib/cn';
import { useVisual } from '../context';
import { useVisualFormat } from '../format';
import { pick } from '../pick';
import { RollingValue } from '../parts/RollingValue';
import { useVisualTicker } from '../useVisualLoop';

/** Сцена 480×360: глобус в центре-слева, орбиты вокруг, плашка «в работе» справа снизу. */
const W = 480;
const H = 360;
const CX = 214;
const CY = 178;
const R = 132;
/** Наклон полярной оси. */
const TILT = (18 * Math.PI) / 180;
/** Канвас рисуется с запасом по плотности: сцена масштабируется CSS-ом. */
const DENSITY = 2;

type Polygon = readonly (readonly [number, number])[];

/**
 * Упрощённые контуры материков (широта, долгота) — прямо в коде, без файлов карты.
 * Точности хватает, чтобы материки узнавались на точечной сфере.
 */
const CONTINENTS: readonly Polygon[] = [
  // Северная Америка
  [
    [70, -165],
    [72, -140],
    [70, -125],
    [75, -95],
    [72, -80],
    [62, -75],
    [60, -64],
    [52, -56],
    [45, -61],
    [43, -70],
    [35, -76],
    [30, -81],
    [25, -80],
    [30, -85],
    [29, -95],
    [22, -98],
    [18, -95],
    [15, -88],
    [9, -79],
    [8, -83],
    [15, -92],
    [20, -105],
    [23, -110],
    [32, -117],
    [40, -124],
    [48, -125],
    [55, -132],
    [60, -146],
    [58, -153],
    [55, -162],
    [60, -166],
    [66, -168],
  ],
  // Гренландия
  [
    [83, -35],
    [82, -60],
    [78, -72],
    [76, -68],
    [70, -55],
    [60, -44],
    [65, -38],
    [70, -22],
    [78, -18],
  ],
  // Южная Америка
  [
    [12, -72],
    [10, -62],
    [5, -52],
    [0, -50],
    [-5, -35],
    [-10, -36],
    [-23, -42],
    [-34, -53],
    [-40, -62],
    [-52, -68],
    [-55, -70],
    [-50, -75],
    [-40, -73],
    [-30, -71],
    [-18, -70],
    [-5, -81],
    [2, -80],
    [8, -77],
  ],
  // Евразия
  [
    [36, -9],
    [43, -9],
    [48, -5],
    [51, 2],
    [54, 8],
    [57, 8],
    [58, 6],
    [62, 5],
    [66, 13],
    [70, 20],
    [71, 28],
    [69, 35],
    [67, 41],
    [69, 55],
    [73, 70],
    [76, 100],
    [73, 113],
    [72, 130],
    [70, 160],
    [68, 180],
    [62, 178],
    [60, 163],
    [57, 160],
    [52, 157],
    [60, 150],
    [59, 140],
    [53, 141],
    [46, 138],
    [40, 128],
    [35, 127],
    [38, 121],
    [31, 122],
    [23, 117],
    [21, 108],
    [10, 107],
    [8, 104],
    [13, 100],
    [7, 100],
    [1, 104],
    [6, 98],
    [16, 95],
    [22, 91],
    [15, 80],
    [8, 77],
    [20, 73],
    [24, 67],
    [26, 57],
    [22, 59],
    [17, 55],
    [13, 45],
    [20, 40],
    [28, 34],
    [31, 32],
    [36, 36],
    [37, 28],
    [40, 26],
    [38, 22],
    [40, 19],
    [45, 13],
    [40, 15],
    [38, 16],
    [44, 8],
    [43, 3],
    [38, 0],
    [36, -6],
  ],
  // Британия
  [
    [58, -5],
    [57, -2],
    [53, 0],
    [51, 1],
    [50, -5],
    [54, -4],
  ],
  // Африка
  [
    [37, 10],
    [33, 11],
    [31, 20],
    [32, 30],
    [30, 32],
    [22, 37],
    [12, 44],
    [11, 51],
    [2, 46],
    [-10, 40],
    [-25, 35],
    [-34, 26],
    [-34, 18],
    [-22, 14],
    [-12, 13],
    [-5, 12],
    [4, 9],
    [5, -5],
    [4, -8],
    [10, -15],
    [15, -17],
    [21, -17],
    [28, -13],
    [33, -8],
    [36, -6],
  ],
  // Мадагаскар
  [
    [-12, 49],
    [-25, 47],
    [-25, 44],
    [-16, 44],
  ],
  // Япония
  [
    [45, 142],
    [41, 141],
    [35, 140],
    [33, 131],
    [35, 133],
    [40, 140],
  ],
  // Калимантан и Суматра
  [
    [7, 117],
    [1, 119],
    [-4, 116],
    [-3, 110],
    [2, 109],
  ],
  [
    [5, 95],
    [-5, 105],
    [-3, 106],
    [4, 98],
  ],
  // Австралия
  [
    [-11, 132],
    [-12, 142],
    [-18, 146],
    [-25, 153],
    [-33, 152],
    [-38, 147],
    [-38, 141],
    [-35, 137],
    [-32, 133],
    [-35, 118],
    [-31, 115],
    [-22, 114],
    [-14, 127],
  ],
];

/** Точка внутри многоугольника (луч по долготе) — плоская проекция широта/долгота. */
function inside(polygon: Polygon, lat: number, lon: number): boolean {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [latI, lonI] = polygon[i] ?? [0, 0];
    const [latJ, lonJ] = polygon[j] ?? [0, 0];
    if (latI > lat !== latJ > lat && lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI) {
      hit = !hit;
    }
  }
  return hit;
}

const isLand = (lat: number, lon: number) =>
  lat < -66 || CONTINENTS.some((polygon) => inside(polygon, lat, lon));

type Point = { lat: number; lon: number };

/** Точки на сфере по спирали Фибоначчи — равномерно; оставляем только сушу (считается один раз). */
function buildDots(count: number): Point[] {
  const dots: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = (((((index * golden * 180) / Math.PI) % 360) + 360) % 360) - 180;
    if (isLand(lat, lon)) dots.push({ lat, lon });
  }
  return dots;
}

const CITIES: readonly Point[] = [
  { lat: 55.7, lon: 37.6 }, // Москва
  { lat: 13.7, lon: 100.5 }, // Бангкок
  { lat: 31.2, lon: 121.5 }, // Шанхай
  { lat: 35.7, lon: 139.7 }, // Токио
  { lat: 48.9, lon: 2.3 }, // Париж
  { lat: 52.5, lon: 13.4 }, // Берлин
  { lat: 51.5, lon: -0.1 }, // Лондон
  { lat: 25.2, lon: 55.3 }, // Дубай
];

/** Маршруты дуг-перелётов (индексы городов) — идут по кругу. */
const ROUTES: readonly (readonly [number, number])[] = [
  [6, 0],
  [0, 3],
  [4, 7],
  [7, 1],
  [5, 2],
  [2, 3],
  [1, 4],
  [3, 5],
];

const ORBITS: readonly {
  rx: number;
  ry: number;
  tilt: number;
  duration: number;
  icons: readonly LucideIcon[];
}[] = [
  { rx: 182, ry: 54, tilt: -14, duration: 30, icons: [BrainCircuit, Cloud] },
  { rx: 160, ry: 70, tilt: 28, duration: 24, icons: [ShieldCheck, ChartLine] },
];

const LANGUAGE_CODES: readonly [string, ...string[]] = [
  'EN',
  'RU',
  'TH',
  'ZH',
  'JA',
  'FR',
  'DE',
  'AR',
];

const rad = (degrees: number) => (degrees * Math.PI) / 180;

type Projected = { x: number; y: number; z: number };

function project({ lat, lon }: Point, rotation: number, tilt: number): Projected {
  const phi = rad(lat);
  const lambda = rad(lon) + rotation;
  const x = Math.cos(phi) * Math.sin(lambda);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lambda);
  const yTilted = y * Math.cos(tilt) - z * Math.sin(tilt);
  const zTilted = y * Math.sin(tilt) + z * Math.cos(tilt);
  return { x: CX + R * x, y: CY - R * yTilted, z: zTilted };
}

/** Точка дуги между городами: сферическая интерполяция + подъём над поверхностью к середине. */
function arcPoint(a: Point, b: Point, t: number, rotation: number, tilt: number): Projected {
  const toVec = ({ lat, lon }: Point) => [
    Math.cos(rad(lat)) * Math.cos(rad(lon)),
    Math.cos(rad(lat)) * Math.sin(rad(lon)),
    Math.sin(rad(lat)),
  ];
  const va = toVec(a);
  const vb = toVec(b);
  const dot = va.reduce((sum, value, index) => sum + value * (vb[index] ?? 0), 0);
  const omega = Math.acos(Math.min(1, Math.max(-1, dot)));
  const sinOmega = Math.sin(omega) || 1;
  const wa = Math.sin((1 - t) * omega) / sinOmega;
  const wb = Math.sin(t * omega) / sinOmega;
  const v = va.map((value, index) => value * wa + (vb[index] ?? 0) * wb);
  const lift = 1 + Math.sin(Math.PI * t) * 0.18;
  const lat = (Math.asin(Math.max(-1, Math.min(1, v[2] ?? 0))) * 180) / Math.PI;
  const lon = (Math.atan2(v[1] ?? 0, v[0] ?? 1) * 180) / Math.PI;
  const p = project({ lat, lon }, rotation, tilt);
  return { x: CX + (p.x - CX) * lift, y: CY + (p.y - CY) * lift, z: p.z };
}

const ARC_DRAW_MS = 1300;
const ARC_LIFE_MS = 2600;
const SPAWN_MS = 1600;
/** Постер (off): глобус повёрнут к Европе и Азии. */
const POSTER_ROTATION = rad(-62);

/** «О компании»: точечный глобус, по которому летят проекты и данные между городами. */
export function GlobeVisual() {
  const text = useContent('visuals', 'globe');
  const format = useVisualFormat();
  const { running, tier, full, interactive, pointerX, pointerY } = useVisual();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dots = useMemo(() => buildDots(tier === 'lite' ? 3200 : 4800), [tier]);
  const tick = useVisualTicker(2400);
  const projects = 14 + (tick % 4);
  const language = pick(LANGUAGE_CODES, tick);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim() || '255 255 255';
    const primary = token('--accent-primary');
    const secondary = token('--accent-secondary');
    const glow = token('--accent-glow');
    const textColor = token('--text-secondary');

    let rotation = POSTER_ROTATION;
    let last = performance.now();
    let lastDraw = 0;
    let lastSpawn = -SPAWN_MS;
    let routeIndex = 0;
    let frame = 0;
    const arcs: { route: readonly [number, number]; start: number }[] = [];

    const draw = (now: number, poster: boolean) => {
      const tilt = TILT + (interactive ? pointerY.get() * rad(16) : 0);
      const turn = rotation + (interactive ? pointerX.get() * rad(40) : 0);
      context.setTransform(DENSITY, 0, 0, DENSITY, 0, 0);
      context.clearRect(0, 0, W, H);

      // Объём сферы
      const body = context.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.1, CX, CY, R);
      body.addColorStop(0, `rgb(${primary} / 0.22)`);
      body.addColorStop(0.7, `rgb(${primary} / 0.06)`);
      body.addColorStop(1, `rgb(${secondary} / 0.18)`);
      context.fillStyle = body;
      context.beginPath();
      context.arc(CX, CY, R, 0, Math.PI * 2);
      context.fill();

      // Точки суши: задняя полусфера — тусклее и мельче
      for (const dot of dots) {
        const p = project(dot, turn, tilt);
        const front = p.z > 0;
        if (!front && p.z < -0.35) continue;
        context.fillStyle = front
          ? `rgb(${textColor} / ${(0.3 + p.z * 0.6).toFixed(2)})`
          : `rgb(${primary} / 0.08)`;
        const size = front ? 1 + p.z * 0.7 : 0.7;
        context.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }

      // Города
      for (const city of CITIES) {
        const p = project(city, turn, tilt);
        if (p.z <= 0.05) continue;
        context.fillStyle = `rgb(${secondary} / 0.25)`;
        context.beginPath();
        context.arc(p.x, p.y, 5, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgb(${secondary})`;
        context.beginPath();
        context.arc(p.x, p.y, 2, 0, Math.PI * 2);
        context.fill();
      }

      // Дуги-перелёты
      const list = poster
        ? ROUTES.slice(0, 3).map((route) => ({ route, start: now - ARC_DRAW_MS }))
        : arcs;
      for (const arc of list) {
        const age = now - arc.start;
        const from = CITIES[arc.route[0]];
        const to = CITIES[arc.route[1]];
        if (!from || !to) continue;
        const progress = Math.min(1, age / ARC_DRAW_MS);
        const fade = poster
          ? 1
          : Math.max(0, 1 - Math.max(0, age - ARC_DRAW_MS) / (ARC_LIFE_MS - ARC_DRAW_MS));
        const steps = 40;
        context.lineWidth = 1.4;
        context.lineCap = 'round';
        context.beginPath();
        let started = false;
        let head: Projected | null = null;
        for (let step = 0; step <= steps * progress; step += 1) {
          const p = arcPoint(from, to, step / steps, turn, tilt);
          if (p.z < -0.15) {
            started = false;
            continue;
          }
          if (started) context.lineTo(p.x, p.y);
          else context.moveTo(p.x, p.y);
          started = true;
          head = p;
        }
        const gradient = context.createLinearGradient(CX - R, CY, CX + R, CY);
        gradient.addColorStop(0, `rgb(${glow} / ${0.8 * fade})`);
        gradient.addColorStop(1, `rgb(${secondary} / ${0.95 * fade})`);
        context.strokeStyle = gradient;
        context.stroke();
        // Пакет на конце дуги и пинг на приёме
        if (head && progress < 1) {
          context.fillStyle = `rgb(255 255 255 / ${fade})`;
          context.beginPath();
          context.arc(head.x, head.y, 2.2, 0, Math.PI * 2);
          context.fill();
        } else if (head && !poster) {
          const ping = Math.min(1, (age - ARC_DRAW_MS) / 700);
          context.strokeStyle = `rgb(${secondary} / ${(1 - ping) * 0.8})`;
          context.lineWidth = 1;
          context.beginPath();
          context.arc(head.x, head.y, 3 + ping * 10, 0, Math.PI * 2);
          context.stroke();
        }
      }

      // Ободок атмосферы
      context.strokeStyle = `rgb(${secondary} / 0.35)`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(CX, CY, R + 0.5, 0, Math.PI * 2);
      context.stroke();
    };

    if (tier === 'off' || !running) {
      draw(performance.now(), tier === 'off');
      return undefined;
    }

    // lite — 10 кадров в секунду, full — каждый кадр
    const minFrame = tier === 'lite' ? 100 : 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const delta = Math.min(64, now - last);
      last = now;
      rotation += delta * 0.00012 * (full ? 1 : 0.7);
      if (now - lastSpawn > SPAWN_MS * (full ? 1 : 1.5)) {
        const route = ROUTES[routeIndex % ROUTES.length];
        if (route) arcs.push({ route, start: now });
        routeIndex += 1;
        lastSpawn = now;
      }
      while (arcs.length && now - (arcs[0]?.start ?? now) > ARC_LIFE_MS) arcs.shift();
      if (now - lastDraw < minFrame) return;
      lastDraw = now;
      draw(now, false);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [dots, running, tier, full, interactive, pointerX, pointerY]);

  return (
    <div className="absolute inset-0">
      <div
        className="absolute rounded-full bg-glow-indigo opacity-80 blur-2xl"
        style={{ left: CX - 170, top: CY - 150, width: 340, height: 300 }}
      />

      <canvas
        ref={canvasRef}
        width={W * DENSITY}
        height={H * DENSITY}
        className="absolute inset-0 h-full w-full"
      />

      {/* Орбиты с узлами-сервисами — поверх глобуса */}
      {ORBITS.map((orbit, orbitIndex) => {
        const path = `M ${CX - orbit.rx},${CY} a ${orbit.rx},${orbit.ry} 0 1,0 ${orbit.rx * 2},0 a ${orbit.rx},${orbit.ry} 0 1,0 ${-orbit.rx * 2},0`;
        return (
          <div
            key={orbitIndex}
            className="absolute inset-0"
            style={{ transform: `rotate(${orbit.tilt}deg)`, transformOrigin: `${CX}px ${CY}px` }}
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <path
                d={path}
                fill="none"
                stroke="rgb(var(--accent-secondary))"
                strokeOpacity={0.35}
                strokeDasharray={orbitIndex === 1 ? '2 6' : undefined}
              />
            </svg>
            {orbit.icons.map((Icon, index) => (
              <div
                key={index}
                className={cn('absolute left-0 top-0', tier !== 'off' && 'animate-orbit')}
                style={
                  {
                    offsetPath: `path('${path}')`,
                    offsetRotate: '0deg',
                    offsetDistance: `${index * 50 + 15}%`,
                    '--orbit-duration': `${orbit.duration}s`,
                    animationDelay: `${-(orbit.duration / 2) * index - orbit.duration * 0.15}s`,
                  } as CSSProperties
                }
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-elevated/95 text-accent-secondary shadow-[0_0_16px_-4px_rgb(var(--accent-secondary)/0.7)]"
                  style={{ transform: `rotate(${-orbit.tilt}deg)` }}
                >
                  <Icon size={14} />
                </span>
              </div>
            ))}
          </div>
        );
      })}

      {/* Сейчас в работе */}
      <div
        className="absolute flex w-[124px] flex-col gap-1.5 rounded-xl border border-border bg-bg-elevated/95 p-2.5"
        style={{ left: 344, top: 268 }}
      >
        <span className="line-clamp-2 text-[9.5px] leading-tight text-text-secondary">
          {text.projects}
        </span>
        <span className="flex items-center justify-between gap-2">
          <RollingValue
            value={format.integer(projects)}
            className="font-display text-[20px] font-bold leading-none text-text-primary"
          />
          <RollingValue
            value={language}
            className="rounded-md border border-accent-primary/40 bg-accent-primary/15 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-accent-primary"
          />
        </span>
      </div>
    </div>
  );
}
