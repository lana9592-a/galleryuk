'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Search, Menu } from 'lucide-react';
import type { Route } from 'next';
import { cn } from '@/lib/utils';

const ITEMS: { href: Route; label: string; Icon: typeof Home }[] = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/map', label: 'Map', Icon: Map },
  { href: '/search', label: 'Search', Icon: Search },
  { href: '/about', label: 'More', Icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                  active ? 'text-primary' : 'text-text-muted hover:text-text',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
