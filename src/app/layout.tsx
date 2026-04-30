/**
 * 루트 레이아웃
 * Google Fonts, PWA 메타, 전역 스타일을 설정합니다.
 */
import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

const coupleNames = process.env.NEXT_PUBLIC_COUPLE_NAMES ?? '신랑 ♥ 신부';

export const metadata: Metadata = {
  title: `${coupleNames} Wedding Photo Booth`,
  description: '결혼식 인생네컷 포토부스',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Photo Booth',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Fonts: Fraunces (가변 세리프) + Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* PWA 아이콘 */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-body">{children}</body>
    </html>
  );
}
