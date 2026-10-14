/**
 * Глобальная «атмосфера»: статичное плёночное зерно и мягкая виньетка поверх всего сайта.
 * Без анимаций — нулевая стоимость в рантайме. Декоративный слой.
 */
export function AmbientLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[45]">
      <div className="absolute inset-0 bg-grain opacity-[0.035] mix-blend-overlay" />
      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
