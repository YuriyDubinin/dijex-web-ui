/** Элемент непустого списка по кругу: pick(items, cycle) — данные сцены меняются от цикла к циклу. */
export function pick<T>(items: readonly [T, ...T[]], index: number): T {
  return items[((index % items.length) + items.length) % items.length] ?? items[0];
}
