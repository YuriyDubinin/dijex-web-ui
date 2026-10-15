import { Container } from '@/components/layout/Container';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { IMAGES, liveVisualFor, type ImageKey } from '@/content/images';

const KEYS = (Object.keys(IMAGES) as ImageKey[]).filter((key) => liveVisualFor(key) !== null);

/**
 * Dev-галерея «живых» визуалов: все сцены на одной странице — для QA на разных языках и уровнях
 * движения (?lang=de&motion=lite). В прод-сборку не попадает (маршрут подключается только в dev).
 */
export function VisualsGalleryPage() {
  return (
    <Container className="py-28">
      <h1 className="font-display text-h2 font-bold text-text-primary">Visuals</h1>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {KEYS.map((key) => (
          <figure key={key} data-visual-key={key}>
            <ImageSlot image={key} />
            <figcaption className="mt-3 font-mono text-xs text-text-muted">
              {key} → {liveVisualFor(key)}
            </figcaption>
          </figure>
        ))}
      </div>
    </Container>
  );
}
