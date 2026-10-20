/** Prefix local URLs for repository hosting while preserving remote media and anchors. */
export function withBase(path: string, base = import.meta.env?.BASE_URL || '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const prefix = '/' + base.split('/').filter(Boolean).join('/');
  if (prefix === '/' || path === prefix || path.startsWith(prefix + '/')) return path;
  return prefix + path;
}
