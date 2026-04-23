import type { Route } from 'next';

// Next 14 `typedRoutes` currently cannot infer dynamic-segment templates
// from runtime strings. Centralising the cast here means we only bend the
// type system in one spot and get a consistent call site for route changes.

export function galleryHref(id: string): Route {
  return `/galleries/${id}` as Route;
}

export function exhibitionHref(id: string): Route {
  return `/exhibitions/${id}` as Route;
}

export function exhibitionsHref(search?: URLSearchParams | string): Route {
  const qs = typeof search === 'string' ? search : search?.toString() ?? '';
  return (qs ? `/exhibitions?${qs}` : '/exhibitions') as Route;
}

export function searchHref(q?: string): Route {
  const trimmed = q?.trim();
  return (trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search') as Route;
}
