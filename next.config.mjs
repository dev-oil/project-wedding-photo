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
const nextConfig = {};

export default withSerwist(nextConfig);
