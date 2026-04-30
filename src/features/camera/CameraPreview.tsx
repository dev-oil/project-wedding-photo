/**
 * 카메라 미리보기 컴포넌트
 * video 태그를 감싸고, 실시간으로 선택된 CSS filter를 적용합니다.
 */
'use client';

import type { RefObject } from 'react';

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  filterCss: string;
  isReady: boolean;
};

export function CameraPreview({ videoRef, filterCss, isReady }: CameraPreviewProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-fg/5">
      <div className="aspect-video w-full">
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
      </div>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-subtle">
          <p className="font-body text-muted">카메라 준비 중...</p>
        </div>
      )}
    </div>
  );
}
