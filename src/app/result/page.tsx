/**
 * 결과 화면
 * 합성된 4컷 이미지를 미리보기하고,
 * 다운로드 / QR 전송 / 다시 찍기를 제공합니다.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useBoothStore } from '@/store/boothStore';
import { DownloadButton } from '@/features/share/DownloadButton';
import { QRCodeView } from '@/features/share/QRCodeView';
import { Button } from '@/components/ui/Button';

export default function ResultPage() {
  const router = useRouter();
  const { composedImage, reset } = useBoothStore();
  const [visible, setVisible] = useState(false);

  // 합성 이미지가 없으면 부스로 리다이렉트
  useEffect(() => {
    if (!composedImage) {
      router.replace('/booth');
      return;
    }
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [composedImage, router]);

  // Blob → Object URL (미리보기용)
  const previewUrl = useMemo(() => {
    if (!composedImage) return null;
    return URL.createObjectURL(composedImage);
  }, [composedImage]);

  // 정리
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleRetry = () => {
    reset();
    router.push('/booth');
  };

  const handleGoHome = () => {
    reset();
    router.push('/');
  };

  if (!composedImage || !previewUrl) return null;

  return (
    <main
      className={`flex h-dvh flex-col items-center justify-center gap-8 px-6 py-8 transition-opacity duration-700 ease-smooth lg:flex-row lg:gap-12 lg:px-12 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 미리보기 이미지 */}
      <div className="flex max-h-[70vh] justify-center lg:max-h-[85vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="촬영 결과"
          className="h-full rounded-2xl border border-border object-contain shadow-sm"
        />
      </div>

      {/* 버튼 그룹 */}
      <div className="flex flex-col gap-4">
        <DownloadButton blob={composedImage} />
        <QRCodeView blob={composedImage} />
        <Button onClick={handleRetry} variant="secondary">
          다시 찍기
        </Button>
        <Button onClick={handleGoHome} variant="ghost">
          처음으로
        </Button>
      </div>
    </main>
  );
}
