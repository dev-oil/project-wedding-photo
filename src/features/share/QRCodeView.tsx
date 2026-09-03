/**
 * QR 코드 뷰
 * 결과 화면 진입 시 자동으로 업로드하고(모든 촬영본 보존),
 * 24시간 유효한 다운로드 URL을 QR로 바로 표시합니다.
 * 실패하면 재시도 버튼을 보여줍니다 — 자동 업로드가 유일한 저장 경로입니다.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { uploadPhoto } from '@/lib/upload';
import { Button } from '@/components/ui/Button';
import { useBoothStore } from '@/store/boothStore';

type QRCodeViewProps = {
  blob: Blob;
};

export function QRCodeView({ blob }: QRCodeViewProps) {
  const selectedFrame = useBoothStore((s) => s.selectedFrame);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false); // StrictMode 이중 실행에 의한 중복 업로드 방지

  const upload = useCallback(async () => {
    setError(null);
    try {
      setUrl(await uploadPhoto(blob, selectedFrame));
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.');
    }
  }, [blob, selectedFrame]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    upload();
  }, [upload]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-center font-body text-sm text-muted">{error}</p>
        <Button onClick={upload} variant="secondary">
          다시 시도
        </Button>
      </div>
    );
  }

  if (!url) {
    return (
      <p className="text-center font-body text-sm text-muted">
        QR 준비 중...
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl bg-bg p-4">
        <QRCodeSVG value={url} size={180} level="M" />
      </div>
      <p className="text-center font-body text-sm text-muted">
        QR을 스캔하면 사진이 저장됩니다
        <br />
        (링크는 24시간 동안 유효합니다)
      </p>
    </div>
  );
}
