import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-text focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" className="pb-24 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
