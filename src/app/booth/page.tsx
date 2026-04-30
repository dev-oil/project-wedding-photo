/**
 * 부스 화면
 * 카메라 미리보기 + 프레임/필터 선택 + 4컷 촬영을 수행합니다.
 * 촬영 완료 후 /result로 자동 이동합니다.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useCamera } from '@/features/camera/useCamera';
import { CameraPreview } from '@/features/camera/CameraPreview';
import { Countdown } from '@/features/camera/Countdown';
import { FrameSelector } from '@/features/frame/FrameSelector';
import { FilterSelector } from '@/features/filter/FilterSelector';
import { Button } from '@/components/ui/Button';
import { useBoothStore } from '@/store/boothStore';
import { getFilterById } from '@/lib/filters';
import { getFrameById } from '@/lib/frames';
import { composePhotoStrip } from '@/lib/canvas';

const TOTAL_SHOTS = 4;

export default function BoothPage() {
  const router = useRouter();
  const { videoRef, isReady, error, capture, cleanup } = useCamera();

  const {
    step,
    selectedFrame,
    selectedFilter,
    photos,
    setStep,
    setFrame,
    setFilter,
    addPhoto,
    setComposedImage,
    reset,
  } = useBoothStore();

  const [shotIndex, setShotIndex] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);

  const filter = getFilterById(selectedFilter);

  // 페이지 진입 시 상태 초기화
  useEffect(() => {
    reset();
  }, [reset]);

  // 언마운트 시 카메라 정리
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // 촬영 시작
  const handleStartShooting = useCallback(() => {
    setStep('shooting');
    setShotIndex(0);
    setIsCounting(true);
  }, [setStep]);

  // 카운트다운 완료 → 캡처
  const handleCountdownComplete = useCallback(() => {
    setIsCounting(false);

    const canvas = capture(filter.css);
    if (!canvas) return;

    addPhoto(canvas);

    // 플래시 효과
    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), 200);

    const nextIndex = shotIndex + 1;

    if (nextIndex < TOTAL_SHOTS) {
      // 다음 컷 촬영 (0.5초 대기 후)
      setShotIndex(nextIndex);
      setTimeout(() => setIsCounting(true), 500);
    } else {
      // 4컷 촬영 완료
      setStep('done');
    }
  }, [capture, filter.css, addPhoto, shotIndex, setStep]);

  // 4컷 촬영 완료 → 합성 → /result 이동
  useEffect(() => {
    if (step !== 'done' || photos.length < TOTAL_SHOTS) return;

    async function compose() {
      const frame = getFrameById(selectedFrame);
      const blob = await composePhotoStrip(photos, frame, filter);
      setComposedImage(blob);
      router.push('/result');
    }

    compose();
  }, [step, photos, selectedFrame, filter, setComposedImage, router]);

  // 카메라 에러 화면
  if (error) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-6 px-8">
        <p className="font-display text-3xl tracking-tight text-fg">
          카메라를 사용할 수 없습니다
        </p>
        <p className="max-w-md text-center font-body text-base text-muted">
          {error}
        </p>
        <Button onClick={() => router.push('/')} variant="secondary">
          처음으로
        </Button>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col gap-6 p-6 lg:flex-row lg:gap-8 lg:p-8">
      {/* 카메라 영역 */}
      <section className="relative flex-1 overflow-hidden rounded-2xl">
        <CameraPreview
          videoRef={videoRef}
          filterCss={filter.css}
          isReady={isReady}
        />

        {/* 카운트다운 오버레이 */}
        {isCounting && <Countdown onComplete={handleCountdownComplete} />}

        {/* 촬영 플래시 */}
        {flashVisible && (
          <div className="absolute inset-0 z-20 bg-bg opacity-80 transition-opacity duration-200" />
        )}

        {/* 촬영 진행 표시 */}
        {step === 'shooting' && (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_SHOTS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                    i < photos.length ? 'bg-bg' : 'bg-bg/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 컨트롤 영역 */}
      {step === 'select' && (
        <section className="flex flex-col gap-6 lg:w-80 lg:justify-center">
          <div>
            <p className="mb-3 font-display text-xl tracking-tight text-fg">
              프레임
            </p>
            <FrameSelector selected={selectedFrame} onSelect={setFrame} />
          </div>
          <div>
            <p className="mb-3 font-display text-xl tracking-tight text-fg">
              필터
            </p>
            <FilterSelector selected={selectedFilter} onSelect={setFilter} />
          </div>
          <Button
            onClick={handleStartShooting}
            disabled={!isReady}
            className="mt-4"
          >
            촬영 시작
          </Button>
        </section>
      )}
    </main>
  );
}
