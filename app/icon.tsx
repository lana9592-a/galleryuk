import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#B91C1C',
          borderRadius: 96,
          color: '#FAFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontWeight: 800,
          fontSize: 340,
          letterSpacing: -8,
        }}
      >
        G
      </div>
    ),
    size,
  );
}
