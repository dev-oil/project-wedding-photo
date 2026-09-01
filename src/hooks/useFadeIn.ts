/**
 * 마운트 직후 한 박자 늦게 true가 되는 플래그 — 페이지 fade-in 트랜지션용.
 */
'use client';

import { useEffect, useState } from 'react';

export function useFadeIn(delayMs = 60): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return visible;
}
