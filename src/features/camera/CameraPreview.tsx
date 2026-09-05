/**
 * 카메라 미리보기 컴포넌트
 * video 태그를 감싸고, 실시간으로 선택된 CSS filter를 적용합니다.
 *
 * 크기는 부모가 정합니다 — 여기서는 그냥 채우기만 합니다.
 * 예전에는 이 컴포넌트도 h-full + aspectRatio를 들고 있었는데, 부모까지
 * h-full이라 퍼센트 높이가 2단으로 겹쳤습니다. 폭이 그 높이에서 역산되는
 * 순환 의존이라 브라우저가 어떤 축을 먼저 확정하느냐에 따라 결과가 갈렸고,
 * 화면 회전이나 재진입 때마다 세로형과 가로 가득참을 오갔습니다.
 * 비율은 부모 한 곳(booth/page.tsx)에서만 겁니다.
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
    <div className="relative h-full w-full overflow-hidden bg-forest/10">
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
