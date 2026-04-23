import Link from 'next/link';
import { Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SITE_NAME } from '@/lib/constants';

const NAV_ITEMS = [
  { href: '/' as const, label: 'Home' },
  { href: '/exhibitions' as const, label: 'Exhibitions' },
  { href: '/map' as const, label: 'Map' },
  { href: '/galleries' as const, label: 'Galleries' },
  { href: '/about' as const, label: 'About' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <Container as="div" className="flex h-14 items-center justify-between gap-4 md:h-16">
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {SITE_NAME}
        </Link>
        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/search"
          aria-label="Search"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Search className="h-5 w-5" aria-hidden />
        </Link>
      </Container>
    </header>
  );
}
