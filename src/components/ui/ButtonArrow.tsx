import { ArrowRight } from 'lucide-react';

/** Стрелка для кнопок: на hover уходит вправо, новая приходит слева (внутри group/btn или group). */
export function ButtonArrow({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="relative inline-flex overflow-hidden"
      style={{ width: size, height: size }}
    >
      <ArrowRight
        size={size}
        className="transition-transform duration-300 ease-out group-hover:translate-x-[120%] group-hover/btn:translate-x-[120%] group-focus-visible/btn:translate-x-[120%]"
      />
      <ArrowRight
        size={size}
        className="absolute inset-0 -translate-x-[120%] transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover/btn:translate-x-0 group-focus-visible/btn:translate-x-0"
      />
    </span>
  );
}
