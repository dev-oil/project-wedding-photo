/**
 * 앱 설치 배너
 * 브라우저로 열었을 때만 상단에 떠서 홈 화면 설치를 안내합니다.
 *
 * - Android/데스크톱 Chrome: beforeinstallprompt를 받아 '설치' 버튼으로 바로 띄움
 * - iOS/iPadOS Safari: 설치 API가 없어 공유 → '홈 화면에 추가' 안내만 표시
 * - 이미 설치해서 실행한 경우(standalone/fullscreen)엔 아예 렌더하지 않음
 *
 * beforeinstallprompt는 layout <head>의 선점 스크립트가 잡아 window.__bip에
 * 넣어둡니다 — Chrome이 하이드레이션 전에 쏘기 때문에 여기서 리스너를 달면
 * 이미 늦습니다. 그래서 상태를 두지 않고 useSyncExternalStore로 읽습니다.
 */
'use client';

import { useState, useSyncExternalStore } from 'react';

/** beforeinstallprompt는 아직 표준 타입에 없어 직접 선언 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type BipWindow = Window & { __bip?: BeforeInstallPromptEvent | null };

const DISMISS_KEY = 'install-prompt-dismissed';

/** 설치된 앱으로 실행 중인지 — 이 경우 배너는 필요 없다 */
function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // iOS Safari 전용 플래그
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** 사생활 보호 모드 등에서 localStorage 접근이 던질 수 있다 */
function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** 선점 스크립트가 보관한 설치 이벤트 — 같은 객체를 돌려주므로 스냅샷으로 안전 */
function getInstallEvent(): BeforeInstallPromptEvent | null {
  return (window as BipWindow).__bip ?? null;
}

function subscribeInstallEvent(onChange: () => void): () => void {
  window.addEventListener('bip', onChange);
  return () => window.removeEventListener('bip', onChange);
}

/** 이벤트를 비우고 구독자에게 알린다 — 소비했거나 설치가 끝났을 때 */
function clearInstallEvent(): void {
  (window as BipWindow).__bip = null;
  window.dispatchEvent(new Event('bip'));
}

/**
 * iOS/iPadOS Safari 안내를 띄울지.
 * 브라우저에서만 알 수 있는 값이라 서버 스냅샷은 항상 false.
 * 값이 바뀌지 않으므로 구독은 빈 함수.
 */
const subscribeNever = () => () => {};

function needsIosHint(): boolean {
  if (isInstalled() || isDismissed()) return false;
  const ua = navigator.userAgent;
  // iPadOS Safari는 데스크톱급 브라우징이 기본이라 자신을 Macintosh로 보고한다.
  // 터치 포인트로 진짜 맥과 구분한다 — 이게 없으면 아이패드에서 안내가 안 뜬다.
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  const iOS = /iPad|iPhone|iPod/.test(ua) || iPadOS;
  if (!iOS) return false;

  // '홈 화면에 추가'는 진짜 Safari에만 있다. 블랙리스트로는 끝이 없어서
  // (카톡으로 링크를 돌리는 게 기본 시나리오다) 화이트리스트로 뒤집는다.
  // 인앱 브라우저는 WKWebView라 Version/·Safari/ 토큰이 없다.
  const realSafari = /Version\/\d/.test(ua) && /Safari/.test(ua);
  const otherBrowser =
    /CriOS|FxiOS|EdgiOS|OPT\/|KAKAOTALK|NAVER|Whale|FBAN|FBAV|Instagram|Line\/|DaumApps/i.test(ua);

  return realSafari && !otherBrowser;
}

export function InstallPrompt() {
  const [dismissed, setDismissed] = useState(false);

  const installEvent = useSyncExternalStore(
    subscribeInstallEvent,
    getInstallEvent,
    () => null,
  );
  const iosHint = useSyncExternalStore(subscribeNever, needsIosHint, () => false);

  if (dismissed) return null;
  if (!installEvent && !iosHint) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // 저장 못 해도 이번 세션 동안은 닫힌다
    }
    setDismissed(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    // prompt는 한 번만 쓸 수 있다 — 결과와 무관하게 참조를 버린다
    clearInstallEvent();
  };

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      <div className="flex max-w-[520px] items-center gap-3 rounded-full border border-forest/25 bg-bg/95 py-2 pl-4 pr-2 font-body text-[13px] text-forest shadow-[0_8px_24px_-12px_rgba(23,24,26,0.5)] backdrop-blur">
        {installEvent ? (
          <>
            <span className="font-medium">홈 화면에 앱으로 설치할 수 있어요</span>
            <button
              onClick={install}
              className="shrink-0 rounded-full bg-forest px-4 py-1.5 font-semibold text-bg transition-transform duration-200 ease-smooth active:scale-95"
            >
              설치
            </button>
          </>
        ) : (
          <span className="flex items-center gap-1.5 font-medium">
            공유
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 15V3m0 0L8 7m4-4l4 4" />
              <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            → &lsquo;홈 화면에 추가&rsquo;
          </span>
        )}
        <button
          onClick={dismiss}
          aria-label="설치 안내 닫기"
          className="shrink-0 rounded-full px-2 py-1 text-forest/50 transition-colors hover:text-forest"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
