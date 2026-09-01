/**
 * 3초 카운트다운 오버레이
 * 촬영 전 화면 중앙에 큰 숫자를 표시합니다.
 * 배경을 딤드하지 않는다 — 사용자가 실제 찍히는 색감 그대로 미리보기를
 * 봐야 하므로, 숫자 가독성은 텍스트 섀도로만 확보한다.
 */
'use client';

import { useEffect, useState } from 'react';

/** 카운트다운 시작 숫자 */
const COUNTDOWN_FROM = 3;

type CountdownProps = {
  onComplete: () => void;
};

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(COUNTDOWN_FROM);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count <= 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <span
        key={count}
        className="animate-countdown font-display text-[calc(var(--u)*18)] font-light tracking-tight text-bg [text-shadow:0_2px_10px_rgba(23,24,26,0.55),0_6px_36px_rgba(23,24,26,0.45)]"
      >
        {count}
      </span>
    </div>
  );
}
