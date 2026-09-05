/**
 * 부스 화면
 * 카메라 미리보기 + 프레임/필터 선택 + 4컷 촬영을 수행합니다.
 * 촬영 완료(step === 'done') 시 4컷을 합성해 /result로 이동합니다.
 *
 * 구성
 * - 레이아웃 셸/헤더: components/layout/PosterShell (홈·결과 화면과 공용)
 * - 촬영 플로우(카운트다운→캡처→플래시→다음 컷): features/camera/useShootingSession
 * - 미리보기 비율: 합성 슬롯과 동일한 466:690 (lib/canvas의 SLOT_ASPECT)
 */
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { PosterShell, PosterHeader } from '@/components/layout/PosterShell';
import { Button } from '@/components/ui/Button';
import { CameraPreview } from '@/features/camera/CameraPreview';
import { Countdown } from '@/features/camera/Countdown';
import { useCamera } from '@/features/camera/useCamera';
import { TOTAL_SHOTS, useShootingSession } from '@/features/camera/useShootingSession';
import { FilterSelector } from '@/features/filter/FilterSelector';
import { FrameSelector } from '@/features/frame/FrameSelector';
import { composePhotoStrip } from '@/lib/canvas';
import { getFilterById } from '@/lib/filters';
import { getFrameById } from '@/lib/frames';
import { useBoothStore } from '@/store/boothStore';

export default function BoothPage() {
  const router = useRouter();
  const { videoRef, isReady, error, capture, cleanup } = useCamera();

  const { step, selectedFrame, selectedFilter, photos, setFrame, setFilter, setComposedImage, reset } =
    useBoothStore();

  const filter = getFilterById(selectedFilter);
  const { isCounting, flashVisible, start, handleCountdownComplete } = useShootingSession(() =>
    capture(filter.css),
  );

  /**
   * 이번 마운트에서 실제로 촬영을 시작했는지.
   *
   * 스토어는 페이지 이동으로 초기화되지 않는다. 결과 화면에서 '처음으로'를
   * 누르고 다시 들어오면 step이 'done', photos가 4장인 채로 마운트되는데,
   * 아래 reset()은 다음 렌더에나 반영되므로 같은 커밋의 합성 effect가
   * 잔여 상태를 보고 곧장 /result로 튕겨버린다(= 완료 화면으로 되돌아감).
   * 이 플래그로 이번 마운트의 촬영만 합성하도록 막는다.
   */
  const shotThisMount = useRef(false);

  const beginShooting = useCallback(() => {
    shotThisMount.current = true;
    start();
  }, [start]);

  // 페이지 진입 시 이전 세션 상태 초기화
  useEffect(() => {
    reset();
  }, [reset]);

  // 언마운트 시 카메라 스트림 정리
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // 4컷 완료 → 합성 → /result 이동
  useEffect(() => {
    if (!shotThisMount.current) return; // 이전 세션의 잔여 'done' 상태 무시
    if (step !== 'done' || photos.length < TOTAL_SHOTS) return;

    async function compose() {
      const frame = getFrameById(selectedFrame);
      const blob = await composePhotoStrip(photos, frame, filter);
      setComposedImage(blob);
      router.push('/result');
    }

    compose();
  }, [step, photos, selectedFrame, filter, setComposedImage, router]);

  // 카메라 권한 거부 등 에러 화면
  if (error) {
    return (
      <PosterShell className="items-center justify-center gap-[calc(var(--u)*4)]">
        <p className="font-display text-[calc(var(--u)*4.5)] tracking-tight text-ink">
          카메라를 사용할 수 없습니다
        </p>
        <p className="max-w-md text-center font-body text-[calc(var(--u)*2.4)] text-muted">{error}</p>
        <Button onClick={() => router.push('/')} variant="secondary">
          처음으로
        </Button>
      </PosterShell>
    );
  }

  return (
    <PosterShell>
      <PosterHeader
        label="PHOTO TIME"
        right={
          // 현재 촬영 중인 컷 번호 (01 / 04)
          <span className="pl-[calc(var(--u)*2)] font-body text-[calc(var(--u)*2.3)] font-semibold tracking-[0.14em] text-forest">
            {String(Math.min(photos.length + 1, TOTAL_SHOTS)).padStart(2, '0')} / 04
          </span>
        }
      />

      {/* 카메라 미리보기 — 4컷 슬롯 비율(466:690) 고정 */}
      <section className="flex min-h-0 flex-1 items-center justify-center py-[calc(var(--u)*3)]">
        <div className="relative h-full overflow-hidden rounded-[14px]">
          <CameraPreview videoRef={videoRef} filterCss={filter.css} isReady={isReady} />

          {isCounting && <Countdown onComplete={handleCountdownComplete} />}

          {/* 촬영 순간 플래시 */}
          {flashVisible && (
            <div className="absolute inset-0 z-20 bg-bg opacity-80 transition-opacity duration-200" />
          )}

          {/* 컷 진행 표시 바 */}
          {step === 'shooting' && (
            <div className="absolute bottom-[calc(var(--u)*2.5)] left-1/2 z-10 flex -translate-x-1/2 gap-[calc(var(--u)*1)]">
              {Array.from({ length: TOTAL_SHOTS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-[calc(var(--u)*1)] w-[calc(var(--u)*4)] rounded-full transition-colors duration-300 ${
                    i < photos.length ? 'bg-bg' : 'bg-bg/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 컨트롤 — 프레임/필터 선택 + 촬영 시작 (선택 단계에서만) */}
      {step === 'select' && (
        <section className="flex shrink-0 flex-col gap-[calc(var(--u)*3)]">
          <div>
            <p className="mb-[calc(var(--u)*1.5)] font-body text-[calc(var(--u)*1.9)] font-semibold tracking-[0.18em] text-forest">
              FRAME
            </p>
            <FrameSelector selected={selectedFrame} onSelect={setFrame} />
          </div>
          <div>
            <p className="mb-[calc(var(--u)*1.5)] font-body text-[calc(var(--u)*1.9)] font-semibold tracking-[0.18em] text-forest">
              FILTER
            </p>
            <FilterSelector selected={selectedFilter} onSelect={setFilter} />
          </div>
          <button
            onClick={beginShooting}
            disabled={!isReady}
            className="mt-[calc(var(--u)*1)] flex h-[min(calc(var(--u)*14),76px)] items-center justify-center rounded-[14px] bg-forest font-body text-[min(calc(var(--u)*4),24px)] font-semibold tracking-[0.02em] text-bg transition-transform duration-300 ease-smooth active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40"
          >
            촬영 시작
          </button>
        </section>
      )}
    </PosterShell>
  );
}
