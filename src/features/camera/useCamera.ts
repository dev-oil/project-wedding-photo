/**
 * 카메라 접근 훅
 * getUserMedia를 감싸서 비디오 스트림, 캡처, 에러 처리를 제공합니다.
 * NEXT_PUBLIC_MOCK_CAMERA=true 이면 카메라 대신 Canvas 목 스트림을 씁니다.
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { applyCssFilter } from '@/lib/imageFilter';
import type { UseCameraReturn } from '@/types';
import { createMockStream, isMockCamera } from './mockCamera';

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: 'user',
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  audio: false,
};

/** 디코딩된 프레임이 실제로 생길 때까지 기다린다 (최대 3초) */
function waitForFirstFrame(video: HTMLVideoElement): Promise<void> {
  const hasFrame = () =>
    video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0;

  if (hasFrame()) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener('loadeddata', check);
      video.removeEventListener('canplay', check);
      clearTimeout(timer);
      resolve();
    };
    const check = () => {
      if (hasFrame()) done();
    };
    // 못 기다려도 진행은 시킨다 — capture()가 프레임을 다시 검사한다
    const timer = setTimeout(done, 3000);

    video.addEventListener('loadeddata', check);
    video.addEventListener('canplay', check);
  });
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsReady(false);
  }, [stream]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const mediaStream = isMockCamera
          ? createMockStream()
          : await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);

        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(mediaStream);

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = mediaStream;
          // iOS Safari: play()이 자동 실행 정책에 의해 거부될 수 있음
          await video.play().catch(() => {});
          // play() 성공은 첫 프레임이 디코딩됐다는 뜻이 아니다. 특히 iOS에서
          // 그렇다. 여기서 바로 준비 완료로 치면 프레임이 없는 상태로 캡처가
          // 돌아 검은 사진이 저장된다(JPEG는 투명을 검정으로 굽는다).
          await waitForFirstFrame(video);
          if (!cancelled) setIsReady(true);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            setError(
              '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.',
            );
          } else if (err.name === 'NotFoundError') {
            setError('카메라를 찾을 수 없습니다.');
          } else {
            setError(`카메라 오류: ${err.message}`);
          }
        } else {
          setError('카메라를 시작할 수 없습니다.');
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 언마운트 시 스트림 정리
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  /** 현재 비디오 프레임을 Canvas로 캡처 (CSS filter 적용) */
  const capture = useCallback(
    (filterCss: string): HTMLCanvasElement | null => {
      const video = videoRef.current;
      if (!video || !isReady) return null;

      // 프레임이 없으면 캡처하지 않는다. videoWidth가 0이면 0×0 캔버스가
      // 만들어지고, 프레임이 비어 있으면 검은 컷이 그대로 저장된다.
      // null을 돌려주면 촬영 훅이 이 컷을 다시 찍는다.
      if (video.readyState < video.HAVE_CURRENT_DATA) return null;
      if (!video.videoWidth || !video.videoHeight) return null;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 셀카 모드: 좌우 반전
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 필터는 그린 뒤 픽셀에 직접 적용한다.
      // ctx.filter는 Safari 17부터라 구형 아이패드에서 조용히 무시되고,
      // 그러면 프리뷰만 필터가 걸리고 최종 사진은 원본으로 나온다.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      applyCssFilter(ctx, canvas.width, canvas.height, filterCss);

      return canvas;
    },
    [isReady],
  );

  return { videoRef, isReady, error, capture, cleanup };
}
