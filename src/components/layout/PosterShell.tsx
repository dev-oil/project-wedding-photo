/**
 * 포스터 화면 공통 레이아웃 셸
 * 홈/부스/결과 세 화면이 공유하는 고정 스케일 규칙을 한곳에 모읍니다.
 *
 * - 세로 한 화면 고정(스크롤 없음), 최대 폭 820px(아이패드 기준)
 * - 스케일 단위 --u(= min(1vw, 8.2px)) — 폰~아이패드까지 같은 비율
 * - safe-area 상하 패딩
 */
'use client';

import type { CSSProperties, ReactNode } from 'react';

const scaleStyle = {
  '--u': 'min(1vw, 8.2px)',
  paddingTop: 'max(calc(var(--u) * 4), env(safe-area-inset-top))',
  paddingBottom: 'max(calc(var(--u) * 4), env(safe-area-inset-bottom))',
} as CSSProperties;

export function PosterShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      style={scaleStyle}
      className={`relative mx-auto flex h-dvh w-full max-w-[820px] flex-col overflow-hidden px-[calc(var(--u)*5)] ${className}`}
    >
      {children}
    </main>
  );
}

/**
 * 상단 라벨 헤더 — 배지에서 우측 요소까지 끊김 없이 이어지는 라인.
 * right를 생략하면 기본 점(dot)으로 마감합니다.
 */
export function PosterHeader({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <header className="relative z-20 flex shrink-0 items-center">
      <span className="rounded-full border-[1.5px] border-forest px-[calc(var(--u)*3)] py-[calc(var(--u)*1.3)] font-body text-[calc(var(--u)*2.3)] font-semibold tracking-[0.16em] text-forest">
        {label}
      </span>
      <span className="h-[1.5px] flex-1 bg-forest" />
      {right ?? (
        <span className="h-[calc(var(--u)*1.8)] w-[calc(var(--u)*1.8)] rounded-full bg-forest" />
      )}
    </header>
  );
}
