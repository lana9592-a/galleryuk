import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SITE_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-24 hidden border-t border-border bg-bg md:block">
      <Container as="div" className="flex h-16 items-center justify-between text-sm text-text-muted">
        <p>
          © {new Date().getFullYear()} {SITE_NAME} · v1.0
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-5">
            <li>
              <Link href="/about" className="hover:text-text">
                About
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-text">
                Contact
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/lana9592-a/galleryuk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text"
              >
                Source
              </a>
            </li>
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
