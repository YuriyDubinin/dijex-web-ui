import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';
import { downgradeMotionTier } from '@/motion/tier';

const VERTEX = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

/** Аврора на domain-warped fbm-шуме: три фирменных цвета медленно дрейфуют, курсор подсвечивает область. */
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_scroll;
uniform float u_intensity;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  // Скролл «стягивает» поле к центру
  p *= 1.0 + u_scroll * 0.6;
  float t = u_time * 0.045;
  vec2 mouse = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);

  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 3.1));
  vec2 r = vec2(fbm(p * 1.7 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
                fbm(p * 1.7 + 2.0 * q + vec2(8.3, 2.8) - t));
  // Курсор слегка «притягивает» поле
  r += (mouse - p) * 0.08 * smoothstep(0.7, 0.0, length(p - mouse));
  float f = fbm(p * 1.5 + 2.4 * r);

  vec3 base = vec3(0.039, 0.043, 0.078);
  vec3 indigo = vec3(0.388, 0.400, 0.945);
  vec3 cyan = vec3(0.024, 0.714, 0.831);
  vec3 violet = vec3(0.545, 0.361, 0.965);

  vec3 col = base;
  col = mix(col, indigo * 0.9, smoothstep(0.3, 0.9, f) * 0.62 * u_intensity);
  col = mix(col, violet * 0.85, smoothstep(0.4, 1.0, length(q)) * 0.38 * u_intensity);
  col = mix(col, cyan * 0.8, smoothstep(0.5, 1.0, r.x) * 0.34 * u_intensity);

  // Мягкий свет от курсора
  col += indigo * 0.18 * u_intensity * smoothstep(0.55, 0.0, length(p - mouse));

  // Фокус к верхней половине (под заголовком), края уходят в фон
  float focus = smoothstep(1.45, 0.1, length(p * vec2(0.75, 1.1) - vec2(0.0, 0.05)));
  col = mix(base, col, focus);
  col = mix(col, base, clamp(u_scroll * 0.9, 0.0, 1.0));

  // Дизеринг против бандинга градиентов
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) / 255.0;
  outColor = vec4(col, 1.0);
}`;

type Props = {
  /** Прогресс ухода hero при скролле (0..1). */
  scrollProgress?: MotionValue<number>;
  /** Сила эффекта: 1 — главная, ~0.6 — спокойный режим внутренних страниц. */
  intensity?: number;
  /** Первый кадр отрисован — можно убирать CSS-фолбэк. */
  onReady?: () => void;
  className?: string;
};

const MAX_DPR = 1.5;
const RESOLUTION_SCALE = 0.75;
/** Если средний кадр дольше этого порога два окна подряд — переходим на облегчённый режим. */
const SLOW_FRAME_MS = 20;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.warn('[HeroShader]', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Живой фон hero на чистом WebGL2 (без библиотек). Рендер в пониженном разрешении, пауза вне экрана
 * и в скрытой вкладке, автоматическое понижение до CSS-фона, если устройство не держит FPS.
 */
export function HeroShader({ scrollProgress, intensity = 1, onReady, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });
    if (!gl) return undefined;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return undefined;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (import.meta.env.DEV) console.warn('[HeroShader]', gl.getProgramInfoLog(program));
      return undefined;
    }
    gl.useProgram(program);

    // Полноэкранный треугольник
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      res: gl.getUniformLocation(program, 'u_res'),
      time: gl.getUniformLocation(program, 'u_time'),
      mouse: gl.getUniformLocation(program, 'u_mouse'),
      scroll: gl.getUniformLocation(program, 'u_scroll'),
      intensity: gl.getUniformLocation(program, 'u_intensity'),
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * RESOLUTION_SCALE;
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const mouse = { x: 0.5, y: 0.6, targetX: 0.5, targetY: 0.6 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = (event.clientX - rect.left) / rect.width;
      mouse.targetY = 1 - (event.clientY - rect.top) / rect.height;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let frame = 0;
    let running = false;
    let visible = true;
    let readySent = false;
    const start = performance.now();
    let last = start;
    let windowStart = start;
    let windowFrames = 0;
    let windowTime = 0;
    let slowWindows = 0;

    const render = (now: number) => {
      frame = 0;
      if (!running) return;
      const delta = now - last;
      last = now;

      // Мониторинг производительности (после первой секунды прогрева)
      if (now - start > 1000) {
        windowFrames += 1;
        windowTime += delta;
        if (now - windowStart > 2000) {
          slowWindows = windowTime / windowFrames > SLOW_FRAME_MS ? slowWindows + 1 : 0;
          windowStart = now;
          windowFrames = 0;
          windowTime = 0;
          if (slowWindows >= 2) {
            downgradeMotionTier();
            return;
          }
        }
      } else {
        windowStart = now;
      }

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, (now - start) / 1000);
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
      gl.uniform1f(uniforms.scroll, scrollProgress?.get() ?? 0);
      gl.uniform1f(uniforms.intensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!readySent) {
        readySent = true;
        onReadyRef.current?.();
      }
      frame = requestAnimationFrame(render);
    };

    const updateRunning = () => {
      const shouldRun = visible && !document.hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) {
        last = performance.now();
        frame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frame);
      }
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
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
      // loseContext() не вызываем: в StrictMode тот же canvas монтируется повторно и получил бы потерянный контекст
    };
  }, [scrollProgress, intensity]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
