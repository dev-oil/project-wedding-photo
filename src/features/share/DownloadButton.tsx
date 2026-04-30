/**
 * 다운로드 버튼
 * 합성된 이미지를 로컬에 저장합니다.
 */
'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';

type DownloadButtonProps = {
  blob: Blob;
};

export function DownloadButton({ blob }: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [blob]);

  return (
    <Button onClick={handleDownload} variant="primary">
      다운로드
    </Button>
  );
}
