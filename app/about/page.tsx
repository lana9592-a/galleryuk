import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${SITE_NAME} and how to get in touch.`,
};

export default function AboutPage() {
  return (
    <Container as="div" className="max-w-prose space-y-6 py-6 md:py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">About {SITE_NAME}</h1>
      <p className="leading-relaxed text-text">
        {SITE_NAME} is a small, independent guide to art exhibitions in London. We bring
        together what&rsquo;s on at major institutions and independent galleries so you
        can plan a visit in a few taps — then jump straight to the official ticketing
        page.
      </p>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold">What you&rsquo;ll find</h2>
        <ul className="list-disc space-y-1 pl-5 text-text">
          <li>Current and upcoming exhibitions across London venues</li>
          <li>Gallery profiles with opening hours and location</li>
          <li>1-tap links to each venue&rsquo;s official booking page</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold">Data &amp; corrections</h2>
        <p className="leading-relaxed text-text">
          We check venues&rsquo; official websites for the latest details. If you spot
          something out of date, please{' '}
          <a
            href="https://github.com/lana9592-a/galleryuk/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            open an issue on GitHub
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold">Contact</h2>
        <p className="text-text">
          Questions or partnership ideas:{' '}
          <a
            href="mailto:hello@galleryuk.co"
            className="text-primary underline hover:no-underline"
          >
            hello@galleryuk.co
          </a>
          .
        </p>
      </section>
    </Container>
  );
}
