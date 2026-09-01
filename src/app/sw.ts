/**
 * 서비스 워커 (Serwist)
 * 빌드 시 next.config.mjs의 withSerwist가 public/sw.js로 컴파일합니다.
 * __SW_MANIFEST는 빌드 산출물 프리캐시 목록으로 컴파일 타임에 주입됩니다.
 */
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // 새 버전 배포 시 대기 없이 즉시 교체 — 식장에서 열어둔 아이패드에도 바로 반영
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
