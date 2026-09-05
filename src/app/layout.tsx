/**
 * 루트 레이아웃
 * Google Fonts, PWA 메타, 전역 스타일을 설정합니다.
 */
import type { Metadata, Viewport } from 'next';
import { InstallPrompt } from '@/features/pwa/InstallPrompt';
import { COUPLE_NAMES } from '@/lib/couple';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: `${COUPLE_NAMES} Wedding Photo Booth`,
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
        {/*
          beforeinstallprompt 선점 스크립트.
          Chrome은 이 이벤트를 페이지 로드 직후 한 번만 쏘는데, React가
          하이드레이션되기 전인 경우가 많다. InstallPrompt의 useEffect에서
          리스너를 달면 이미 지나간 뒤라 영영 못 받는다.
          그래서 <head>에서 미리 잡아 window에 보관하고, 컴포넌트가
          마운트되면 그 값을 읽어간다.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__bip=null;addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bip=e;dispatchEvent(new Event('bip'))});addEventListener('appinstalled',function(){window.__bip=null;dispatchEvent(new Event('bip'))});",
          }}
        />
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
