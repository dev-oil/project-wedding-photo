/**
 * 4컷 촬영 플로우 훅
 * 카운트다운 완료 → 캡처 → 플래시 → 다음 컷 반복을 관리하고,
 * 마지막 컷을 찍으면 step을 'done'으로 올립니다.
 */
'use client';

import { useCallback, useRef, useState } from 'react';
import { useBoothStore } from '@/store/boothStore';

export const TOTAL_SHOTS = 4;

const FLASH_MS = 200;
const NEXT_SHOT_DELAY_MS = 500;
/** 프레임이 아직 없어 캡처가 비었을 때 같은 컷을 다시 시도하는 횟수 */
const MAX_CAPTURE_RETRIES = 5;

export function useShootingSession(captureShot: () => HTMLCanvasElement | null) {
  const { setStep, addPhoto } = useBoothStore();

  const [shotIndex, setShotIndex] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const captureRetries = useRef(0);

  const start = useCallback(() => {
    setStep('shooting');
    setShotIndex(0);
    captureRetries.current = 0;
    setIsCounting(true);
  }, [setStep]);

  const handleCountdownComplete = useCallback(() => {
    setIsCounting(false);

    const canvas = captureShot();
    if (!canvas) {
      // 아직 유효한 프레임이 없다. 그냥 return하면 isCounting이 false인 채로
      // 멈춰 촬영이 통째로 죽는다. 컷을 버리지 않고 카운트다운부터 다시 한다
      // — 찍은 컷은 모두 남긴다는 정책상 조용히 건너뛰면 안 된다.
      if (captureRetries.current < MAX_CAPTURE_RETRIES) {
        captureRetries.current += 1;
        setTimeout(() => setIsCounting(true), NEXT_SHOT_DELAY_MS);
      }
      return;
    }
    captureRetries.current = 0;
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
