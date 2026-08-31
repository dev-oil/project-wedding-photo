/**
 * 카메라 접근 훅
 * getUserMedia를 감싸서 비디오 스트림, 캡처, 에러 처리를 제공합니다.
 * NEXT_PUBLIC_MOCK_CAMERA=true 이면 카메라 대신 Canvas 목 스트림을 씁니다.
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
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
          videoRef.current.srcObject = mediaStream;
          // iOS Safari: play()이 자동 실행 정책에 의해 거부될 수 있음
          await videoRef.current.play().catch(() => {});
          setIsReady(true);
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

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // CSS filter를 Canvas에 적용
      if (filterCss && filterCss !== 'none') {
        ctx.filter = filterCss;
      }

      // 셀카 모드: 좌우 반전
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return canvas;
    },
    [isReady],
  );

  return { videoRef, isReady, error, capture, cleanup };
}
