/**
 * 결과 화면
 * 합성된 4컷 이미지 미리보기 + 다운로드 / QR 전송 / 다시 찍기.
 * 합성 이미지가 없으면(직접 URL 진입 등) /booth로 돌려보냅니다.
 *
 * 구성
 * - 레이아웃 셸/헤더: components/layout/PosterShell (홈·부스 화면과 공용)
 * - 9:16 결과물(좌) + 버튼 컬럼(우, 38% · max 300px)
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PosterShell, PosterHeader } from '@/components/layout/PosterShell';
import { Button } from '@/components/ui/Button';
import { DownloadButton } from '@/features/share/DownloadButton';
import { QRCodeView } from '@/features/share/QRCodeView';
import { useFadeIn } from '@/hooks/useFadeIn';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { useBoothStore } from '@/store/boothStore';

export default function ResultPage() {
  const router = useRouter();
  const { composedImage } = useBoothStore();

  const visible = useFadeIn(100);
  const previewUrl = useObjectUrl(composedImage);

  // 합성 이미지 없이 진입하면 부스로 리다이렉트
  useEffect(() => {
    if (!composedImage) router.replace('/booth');
  }, [composedImage, router]);

  // 여기서 reset()을 부르면 composedImage가 지워져 아래 리다이렉트 effect가
  // /booth로 가로채므로, 이동만 한다. 상태 초기화는 부스 화면이 마운트 시 수행.
  const restart = (path: '/' | '/booth') => router.push(path);

  if (!composedImage || !previewUrl) return null;

  return (
    <PosterShell
      className={`transition-opacity duration-700 ease-smooth ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <PosterHeader label="YOUR MOMENTS" />

      {/* 결과 미리보기(좌) + 액션 버튼 컬럼(우) */}
      <section className="flex min-h-0 flex-1 items-center justify-center gap-[calc(var(--u)*6)] py-[calc(var(--u)*3)]">
        <div className="flex h-full min-w-0 flex-1 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="촬영 결과"
            className="max-h-full max-w-full rounded-[14px] border-[1.5px] border-forest/25 shadow-[0_18px_40px_-24px_rgba(23,24,26,0.5)]"
          />
        </div>

        <div className="flex w-[38%] max-w-[300px] shrink-0 flex-col gap-[calc(var(--u)*2.2)]">
          <DownloadButton blob={composedImage} />
          <QRCodeView blob={composedImage} />
          <Button onClick={() => restart('/booth')} variant="secondary">
            다시 찍기
          </Button>
          <Button onClick={() => restart('/')} variant="ghost">
            처음으로
          </Button>
        </div>
      </section>
    </PosterShell>
  );
}
