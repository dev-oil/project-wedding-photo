/**
 * 4컷 촬영 플로우 훅
 * 카운트다운 완료 → 캡처 → 플래시 → 다음 컷 반복을 관리하고,
 * 마지막 컷을 찍으면 step을 'done'으로 올립니다.
 */
'use client';

import { useCallback, useState } from 'react';
import { useBoothStore } from '@/store/boothStore';

export const TOTAL_SHOTS = 4;

const FLASH_MS = 200;
const NEXT_SHOT_DELAY_MS = 500;

export function useShootingSession(captureShot: () => HTMLCanvasElement | null) {
  const { setStep, addPhoto } = useBoothStore();

  const [shotIndex, setShotIndex] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);

  const start = useCallback(() => {
    setStep('shooting');
    setShotIndex(0);
    setIsCounting(true);
  }, [setStep]);

  const handleCountdownComplete = useCallback(() => {
    setIsCounting(false);

    const canvas = captureShot();
    if (!canvas) return;
    addPhoto(canvas);

    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), FLASH_MS);

    const nextIndex = shotIndex + 1;
    if (nextIndex < TOTAL_SHOTS) {
      setShotIndex(nextIndex);
      setTimeout(() => setIsCounting(true), NEXT_SHOT_DELAY_MS);
    } else {
      setStep('done');
    }
  }, [captureShot, addPhoto, shotIndex, setStep]);

  return { isCounting, flashVisible, start, handleCountdownComplete };
}
