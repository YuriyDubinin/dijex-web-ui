import { Container } from '@/components/layout/Container';
import { VisualSlot } from '@/components/ui/VisualSlot';
import { SLOT_KEYS, VISUAL_SLOTS } from '@/content/visualSlots';

/**
 * Dev-галерея сцен: все визуальные места на одной странице — для QA на разных языках и уровнях
 * движения (?motion=lite). В прод-сборку не попадает (маршрут подключается только в dev).
 */
export function VisualsGalleryPage() {
  return (
    <Container className="py-28">
      <h1 className="font-display text-h2 font-bold text-text-primary">Visuals</h1>
      <div className="mt-10 grid items-start gap-10 md:grid-cols-2">
        {SLOT_KEYS.map((key) => (
          <figure key={key} data-visual-key={key}>
            <VisualSlot slot={key} />
            <figcaption className="mt-3 font-mono text-xs text-text-muted">
              {key} → {VISUAL_SLOTS[key]}
            </figcaption>
          </figure>
        ))}
      </div>
    </Container>
  );
}
