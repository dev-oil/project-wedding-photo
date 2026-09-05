/**
 * 앱 설치 배너
 * 브라우저로 열었을 때만 상단에 떠서 홈 화면 설치를 안내합니다.
 *
 * - Android/데스크톱 Chrome: beforeinstallprompt를 가로채 '설치' 버튼으로 바로 띄움
 * - iOS Safari: 설치 API가 없어 공유 → '홈 화면에 추가' 안내만 표시
 * - 이미 설치해서 실행한 경우(standalone/fullscreen)엔 아예 렌더하지 않음
 */
'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/** beforeinstallprompt는 아직 표준 타입에 없어 직접 선언 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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

/**
 * iOS Safari 안내를 띄울지 — 브라우저에서만 알 수 있는 값이라
 * useSyncExternalStore로 읽는다(서버 스냅샷은 항상 false).
 * 값이 바뀌지 않으므로 구독은 빈 함수.
 */
const subscribeNever = () => () => {};

function needsIosHint(): boolean {
  if (isInstalled() || isDismissed()) return false;
  const ua = navigator.userAgent;
  // iOS의 Chrome/Firefox/Edge는 '홈 화면에 추가'가 없어 안내 대상이 아니다
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const iosHint =
    useSyncExternalStore(subscribeNever, needsIosHint, () => false) && !dismissed;

  useEffect(() => {
    if (isInstalled() || isDismissed()) return;

    const onPrompt = (e: Event) => {
      // 기본 미니 인포바를 막고 우리 배너에서 원하는 시점에 띄운다
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    // 설치가 끝나면 배너를 즉시 걷는다
    const onInstalled = () => setDeferred(null);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!deferred && !iosHint) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // 저장 못 해도 이번 세션 동안은 닫힌다
    }
    setDeferred(null);
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    // prompt는 한 번만 쓸 수 있다 — 결과와 무관하게 참조를 버린다
    setDeferred(null);
  };

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      <div className="flex max-w-[520px] items-center gap-3 rounded-full border border-forest/25 bg-bg/95 py-2 pl-4 pr-2 font-body text-[13px] text-forest shadow-[0_8px_24px_-12px_rgba(23,24,26,0.5)] backdrop-blur">
        {deferred ? (
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
