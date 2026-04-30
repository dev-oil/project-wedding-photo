/**
 * 3초 카운트다운 오버레이
 * 촬영 전 화면 중앙에 큰 숫자를 표시합니다.
 */
'use client';

import { useEffect, useState } from 'react';

type CountdownProps = {
  from?: number;
  onComplete: () => void;
};

export function Countdown({ from = 3, onComplete }: CountdownProps) {
  const [count, setCount] = useState(from);

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
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-overlay">
      <span
        key={count}
        className="animate-countdown font-display text-[12rem] font-light tracking-tight text-bg"
      >
        {count}
      </span>
    </div>
  );
}
