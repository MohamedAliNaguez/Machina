export function productImageUrl(src: string, width: number) {
  if (!src.startsWith('https://cdn.sanity.io/images/')) return src;
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('fit', 'max');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('q', '85');
  return url.href;
}
export function productImageSrcset(src: string) {
  return src.startsWith('https://cdn.sanity.io/images/')
    ? [320, 640, 960, 1440, 1920]
        .map((width) => `${productImageUrl(src, width)} ${width}w`)
        .join(', ')
    : undefined;
}
