/**
 * QR 코드 뷰
 * Supabase에 이미지를 업로드하고, public URL을 QR 코드로 보여줍니다.
 * 모달 안에서 큰 QR을 표시합니다.
 */
'use client';

import { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { uploadPhoto } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type QRCodeViewProps = {
  blob: Blob;
};

export function QRCodeView({ blob }: QRCodeViewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const publicUrl = await uploadPhoto(blob);
      setUrl(publicUrl);
      setShowModal(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '업로드에 실패했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [blob]);

  return (
    <>
      <Button
        onClick={handleGenerate}
        variant="secondary"
        disabled={isLoading}
      >
        {isLoading ? '업로드 중...' : 'QR로 받기'}
      </Button>

      {error && (
        <p className="mt-2 text-center font-body text-sm text-muted">
          {error}
        </p>
      )}

      {url && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="flex flex-col items-center gap-6 p-8">
            <p className="font-display text-2xl tracking-tight text-fg">
              QR 코드를 스캔하세요
            </p>
            <div className="rounded-2xl bg-bg p-6">
              <QRCodeSVG value={url} size={280} level="M" />
            </div>
            <p className="max-w-xs text-center font-body text-sm text-muted">
              휴대폰 카메라로 QR 코드를 스캔하면
              <br />
              사진을 바로 저장할 수 있습니다.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
