import withSerwistInit from '@serwist/next';

/**
 * PWA 서비스 워커 — Serwist (next-pwa 후속, 유지보수 활발)
 * src/app/sw.ts를 빌드 시 public/sw.js로 컴파일하고 자동 등록합니다.
 * 개발 모드에서는 캐시가 디버깅을 방해하므로 비활성화.
 */
const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // dev는 Turbopack으로 돌리기 위한 명시 (Serwist는 dev에서 비활성이라 무관).
  // 프로덕션 빌드는 Serwist(webpack 플러그인) 때문에 `next build --webpack` 사용 —
  // Serwist가 Turbopack을 정식 지원하면 플래그 제거.
  turbopack: {},
};

export default withSerwist(nextConfig);
