/**
 * 카메라 미리보기 컴포넌트
 * video 태그를 감싸고, 실시간으로 선택된 CSS filter를 적용합니다.
 * 컨테이너는 합성 슬롯 비율(466:690)에 맞춰 세로형으로 고정 —
 * 미리보기에서 보이는 중앙 크롭이 최종 합성 크롭과 일치합니다.
 */
'use client';

import type { RefObject } from 'react';
import { SLOT_ASPECT } from '@/lib/canvas';

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  filterCss: string;
  isReady: boolean;
};

export function CameraPreview({ videoRef, filterCss, isReady }: CameraPreviewProps) {
  return (
    <div
      className="relative h-full overflow-hidden rounded-[14px] bg-forest/10"
      style={{ aspectRatio: SLOT_ASPECT }}
    >
      <video
        ref={videoRef as React.Ref<HTMLVideoElement>}
        playsInline
        muted
        autoPlay
        className="h-full w-full object-cover"
        style={{
          filter: filterCss !== 'none' ? filterCss : undefined,
          transform: 'scaleX(-1)', // 셀카 미러링
        }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-subtle">
          <p className="font-body text-[calc(var(--u)*2.2)] text-muted">카메라 준비 중...</p>
        </div>
      )}
    </div>
  );
}
