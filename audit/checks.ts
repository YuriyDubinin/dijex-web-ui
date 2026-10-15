/**
 * Проверки вёрстки — выполняются внутри страницы (page.evaluate), поэтому без импортов.
 * Возвращают список проблем: что не так, селектор и текст элемента.
 */
export type LayoutProblem = {
  kind:
    | 'page-overflow'
    | 'off-screen'
    | 'clipped-text'
    | 'overlap'
    | 'small-target'
    | 'long-heading';
  selector: string;
  text: string;
  detail: string;
};

export type CheckOptions = {
  /** Проверять размер тач-целей (только узкие экраны). */
  checkTargets: boolean;
};

export function runLayoutChecks({ checkTargets }: CheckOptions): LayoutProblem[] {
  const problems: LayoutProblem[] = [];
  const viewportWidth = document.documentElement.clientWidth;
  const TOLERANCE = 1.5;

  const describe = (element: Element) => {
    const parts: string[] = [];
    let node: Element | null = element;
    while (node && node !== document.body && parts.length < 4) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        parts.unshift(`${part}#${node.id}`);
        break;
      }
      const classes = Array.from(node.classList)
        .filter((name) => !name.includes(':') && !name.includes('['))
        .slice(0, 2);
      if (classes.length) part += `.${classes.join('.')}`;
      parts.unshift(part);
      node = node.parentElement;
    }
    return parts.join(' > ');
  };
  const textOf = (element: Element) =>
    (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);

  /** Элемент реально виден: не display:none, не прозрачен по цепочке предков. */
  const visible = (element: Element) => {
    let opacity = 1;
    let node: Element | null = element;
    while (node) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      opacity *= Number(style.opacity);
      if (opacity < 0.3) return false;
      node = node.parentElement;
    }
    return true;
  };
  const allowed = (element: Element) => element.closest('[data-allow-overflow]') !== null;
  /** Сцены визуалов рисуют «интерфейс внутри интерфейса»: наложения там — композиция, не ошибка. */
  const insideScene = (element: Element) => element.closest('[role="img"]') !== null;

  /** Элементы с собственным текстом и прямоугольник именно текста (а не блока). */
  const textElements: { element: Element; rect: DOMRect; lines: DOMRect[] }[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set<Element>();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || seen.has(parent) || !(node.textContent ?? '').trim()) continue;
    if (
      parent.closest('script, style, noscript, [aria-hidden="true"]:not([role="img"] *), .sr-only')
    )
      continue;
    seen.add(parent);
    const range = document.createRange();
    range.selectNodeContents(parent);
    const rect = range.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    if (!visible(parent)) continue;
    const lines = Array.from(range.getClientRects()).filter((line) => line.width > 1);
    textElements.push({ element: parent, rect, lines });
  }

  // 1. Горизонтальная прокрутка документа
  if (document.documentElement.scrollWidth > viewportWidth + TOLERANCE) {
    problems.push({
      kind: 'page-overflow',
      selector: 'html',
      text: '',
      detail: `scrollWidth ${document.documentElement.scrollWidth} > ${viewportWidth}`,
    });
  }

  for (const { element, rect } of textElements) {
    if (allowed(element)) continue;

    // 2. Текст за краем экрана (обрезан html { overflow-x: clip } — прокрутки нет, но текст не виден)
    let clipper: Element | null = element.parentElement;
    let clipRect: DOMRect | null = null;
    let deliberate = false;
    for (
      let node: Element | null = element;
      node && node !== document.body;
      node = node.parentElement
    ) {
      const style = getComputedStyle(node);
      if (style.textOverflow === 'ellipsis' || style.webkitLineClamp !== 'none') deliberate = true;
      if (node !== element && (style.overflowX !== 'visible' || style.overflowY !== 'visible')) {
        clipper = node;
        clipRect = node.getBoundingClientRect();
        break;
      }
    }
    const fullyOutside = (box: DOMRect) =>
      rect.right <= box.left + TOLERANCE ||
      rect.left >= box.right - TOLERANCE ||
      rect.bottom <= box.top + TOLERANCE ||
      rect.top >= box.bottom - TOLERANCE;

    if (!clipRect && (rect.right > viewportWidth + TOLERANCE || rect.left < -TOLERANCE)) {
      problems.push({
        kind: 'off-screen',
        selector: describe(element),
        text: textOf(element),
        detail: `text spans ${Math.round(rect.left)}…${Math.round(rect.right)} of ${viewportWidth}px`,
      });
      continue;
    }

    // 3. Текст обрезан контейнером с overflow: hidden (без многоточия / line-clamp)
    if (clipper && clipRect && !deliberate && !fullyOutside(clipRect)) {
      // Прокручиваемый контейнер (ряд вкладок, таблица) — до текста можно доскроллить
      const clipStyle = getComputedStyle(clipper);
      const scrollableX = clipStyle.overflowX === 'auto' || clipStyle.overflowX === 'scroll';
      const cutX =
        !scrollableX &&
        (rect.left < clipRect.left - TOLERANCE || rect.right > clipRect.right + TOLERANCE);
      const cutY = rect.top < clipRect.top - TOLERANCE || rect.bottom > clipRect.bottom + TOLERANCE;
      if (cutX || cutY) {
        problems.push({
          kind: 'clipped-text',
          selector: describe(element),
          text: textOf(element),
          detail: `${cutX ? 'horizontally' : 'vertically'} clipped by ${describe(clipper)}`,
        });
      }
    }
  }

  // 4. Текст наезжает на текст (вне сцен визуалов)
  const flowTexts = textElements.filter(
    ({ element }) => !insideScene(element) && !element.closest('[data-allow-overflow]'),
  );
  for (let a = 0; a < flowTexts.length; a += 1) {
    const first = flowTexts[a];
    if (!first) continue;
    for (let b = a + 1; b < flowTexts.length; b += 1) {
      const second = flowTexts[b];
      if (!second) continue;
      if (first.element.contains(second.element) || second.element.contains(first.element))
        continue;
      if (
        first.rect.right <= second.rect.left ||
        second.rect.right <= first.rect.left ||
        first.rect.bottom <= second.rect.top ||
        second.rect.bottom <= first.rect.top
      )
        continue;
      // Сравниваем строки текста, а не общие рамки: соседние inline-фрагменты одной строки не в счёт
      let worst: { x: number; y: number } | null = null;
      for (const lineA of first.lines) {
        for (const lineB of second.lines) {
          const x = Math.min(lineA.right, lineB.right) - Math.max(lineA.left, lineB.left);
          const y = Math.min(lineA.bottom, lineB.bottom) - Math.max(lineA.top, lineB.top);
          if (x > 4 && y > 4 && (!worst || x * y > worst.x * worst.y)) worst = { x, y };
        }
      }
      if (worst) {
        problems.push({
          kind: 'overlap',
          selector: `${describe(first.element)}  ×  ${describe(second.element)}`,
          text: `${textOf(first.element)}  ×  ${textOf(second.element)}`,
          detail: `${Math.round(worst.x)}×${Math.round(worst.y)}px`,
        });
      }
    }
  }

  // 5. Длина заголовков: H1 первого экрана ≤ 2 строк на ≥ 1280 и ≤ 4 на узких; заголовки секций ≤ 3 строк на мобильных
  const lineCount = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const tops = new Set<number>();
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width > 1 && rect.height > 1) tops.add(Math.round(rect.top / 4));
    }
    // Соседние «верхушки» в пределах 4px — одна строка (маски слов чуть смещены)
    const sorted = [...tops].sort((a, b) => a - b);
    return sorted.filter((top, index) => index === 0 || top - (sorted[index - 1] ?? top) > 2)
      .length;
  };
  const headingLimits: { selector: string; max: number }[] = [
    { selector: '#hero-title, #solution-title', max: viewportWidth >= 1280 ? 2 : 4 },
    ...(viewportWidth < 768 ? [{ selector: 'main section h2.text-h1', max: 3 }] : []),
  ];
  for (const { selector, max } of headingLimits) {
    for (const heading of Array.from(document.querySelectorAll(selector))) {
      if (!visible(heading)) continue;
      const lines = lineCount(heading);
      if (lines > max) {
        problems.push({
          kind: 'long-heading',
          selector: describe(heading),
          text: textOf(heading),
          detail: `${lines} lines (max ${max})`,
        });
      }
    }
  }

  // 6. Тач-цели на узких экранах (WCAG 2.2 AA — не меньше 24×24; ссылки внутри текста не считаются)
  if (checkTargets) {
    const targets = document.querySelectorAll(
      'a[href], button, [role="tab"], input, select, textarea',
    );
    for (const target of Array.from(targets)) {
      if (target.closest('p, li > span, [role="img"], .sr-only, [data-allow-small]')) continue;
      const rect = target.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1 || !visible(target)) continue;
      if (rect.width < 24 || rect.height < 24) {
        problems.push({
          kind: 'small-target',
          selector: describe(target),
          text: textOf(target) || target.getAttribute('aria-label') || '',
          detail: `${Math.round(rect.width)}×${Math.round(rect.height)}px`,
        });
      }
    }
  }

  return problems;
}
