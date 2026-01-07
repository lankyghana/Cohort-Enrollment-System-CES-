const startsWithAny = (value: string, prefixes: string[]): boolean => {
  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) return true
  }
  return false
}

/**
 * Build a URL for a file placed in Vite's `public/` directory.
 *
 * This respects Vite's `base` (e.g. `/app/` in production) so assets
 * always resolve correctly when the SPA is served from a sub-path.
 */
export const publicAssetUrl = (path: string): string => {
  const raw = (path ?? '').trim()
  if (!raw) return ''

  // Already a full URL or special scheme.
  if (startsWithAny(raw, ['http://', 'https://', 'data:', 'blob:'])) {
    return raw
  }

  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
  const normalizedPath = raw.startsWith('/') ? raw.slice(1) : raw

  return normalizedBase + normalizedPath
}
