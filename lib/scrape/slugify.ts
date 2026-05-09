// Convert "Hockney: Late Works" → "hockney-late-works".
// Constrained to /^[a-z0-9-]+$/ so it satisfies ExhibitionSchema's id rule.
export function slugify(input: string, maxLength = 80): string {
  const slug = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
  return slug || `exhibition-${Date.now()}`;
}
