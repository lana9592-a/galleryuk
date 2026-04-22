import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants';

export const runtime = 'edge';
export const alt = `${SITE_NAME} — Art exhibitions across London`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'linear-gradient(135deg, #1A1A1A 0%, #B91C1C 100%)',
          color: '#FAFAF7',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#FAFAF7',
              color: '#B91C1C',
              fontWeight: 800,
              fontSize: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            G
          </div>
          <div style={{ fontSize: 28, letterSpacing: 1, opacity: 0.85 }}>
            {SITE_NAME.toUpperCase()}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            Art exhibitions across London, in one place.
          </div>
          <div style={{ fontSize: 28, opacity: 0.8, maxWidth: 900 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
