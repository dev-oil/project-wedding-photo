/**
 * 서비스 워커 (Serwist)
 * 빌드 시 next.config.mjs의 withSerwist가 public/sw.js로 컴파일합니다.
 * __SW_MANIFEST는 빌드 산출물 프리캐시 목록으로 컴파일 타임에 주입됩니다.
 */
import { defaultCache, PAGES_CACHE_NAME } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { ExpirationPlugin, NetworkFirst, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * 페이지 요청 캐싱 — defaultCache보다 먼저 매칭시킨다.
 *
 * Serwist 기본값의 페이지 항목(rsc·html·others)에는 networkTimeoutSeconds가
 * 없다. 그래서 네트워크가 '죽지는 않았는데 느린' 상태 — 하객 200명이 물린
 * 식장 와이파이의 전형 — 에서는 브라우저가 포기 판정을 내릴 때까지 수십 초를
 * 매달린 뒤에야 캐시로 넘어간다. 멎어 있는 키오스크는 빈 화면보다 나쁘다.
 * 3초 안에 응답이 없으면 캐시된 화면을 먼저 내주고, 네트워크 응답은 뒤에서
 * 계속 받아 캐시를 갱신한다.
 *
 * 수명도 기본 24시간에서 7일로 늘린다. 24시간짜리는 전날 미리 캐시를
 * 채워둬도 당일 아침이면 이미 만료돼 있다.
 *
 * 업로드(/api/photos POST)는 여기 해당 없다 — 런타임 캐싱은 GET만 다루므로
 * 사진 전송은 늘 네트워크를 끝까지 기다린다.
 */
const PAGE_NETWORK_TIMEOUT_SECONDS = 3;
const PAGE_CACHE_MAX_AGE = 7 * 24 * 60 * 60;

const pageHandler = (cacheName: string) =>
  new NetworkFirst({
    cacheName,
    networkTimeoutSeconds: PAGE_NETWORK_TIMEOUT_SECONDS,
    plugins: [
      new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: PAGE_CACHE_MAX_AGE }),
    ],
  });

const pageCache: typeof defaultCache = [
  {
    matcher: ({ request, url: { pathname }, sameOrigin }) =>
      sameOrigin && !pathname.startsWith('/api/') && request.headers.get('RSC') === '1',
    handler: pageHandler(PAGES_CACHE_NAME.rsc),
  },
  {
    matcher: ({ request, url: { pathname }, sameOrigin }) =>
      sameOrigin && !pathname.startsWith('/api/') && request.mode === 'navigate',
    handler: pageHandler(PAGES_CACHE_NAME.html),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // 새 버전 배포 시 대기 없이 즉시 교체 — 식장에서 열어둔 아이패드에도 바로 반영
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...pageCache, ...defaultCache],
});

serwist.addEventListeners();
