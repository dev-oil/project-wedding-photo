/**
 * 루트 레이아웃
 * Google Fonts, PWA 메타, 전역 스타일을 설정합니다.
 */
import type { Metadata, Viewport } from 'next';
import { InstallPrompt } from '@/features/pwa/InstallPrompt';
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
  themeColor: '#f2f5ea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 디스플레이: Hahmlet (한글 세리프) + Bebas Neue (포스터 콘덴스드) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Hahmlet:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* 본문: Pretendard (모던 한글 산세, 공식 CDN) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* PWA 아이콘 */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-body">
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
