/**
 * 결과 화면
 * 합성된 4컷 이미지 + QR을 함께 보여줍니다.
 * 합성 이미지가 없으면(직접 URL 진입 등) /booth로 돌려보냅니다.
 *
 * 왜 준비될 때까지 아무것도 안 보여주는가 —
 * 사진을 먼저 띄우고 QR만 늦게 붙이면, 하객이 사진만 보고 QR을 놓친 채
 * 자리를 뜹니다. 게다가 업로드 중에 '처음으로'를 누르면 사진은 버킷에
 * 올라가는데 링크는 아무도 모르는 상태가 됩니다. 그래서 QR이 나올 때까지는
 * 스피너만 띄우고, 준비가 끝나면 사진·QR·버튼을 한꺼번에 냅니다.
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
import { QRCodeView } from '@/features/share/QRCodeView';
import { useQrUpload } from '@/features/share/useQrUpload';
import { useFadeIn } from '@/hooks/useFadeIn';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { useBoothStore } from '@/store/boothStore';

/** 준비 중 화면의 회전 링 */
function Spinner() {
  return (
    <svg
      viewBox="0 0 50 50"
      aria-hidden
      className="h-[min(calc(var(--u)*8),56px)] w-[min(calc(var(--u)*8),56px)] animate-spin text-forest motion-reduce:animate-none"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <circle cx="25" cy="25" r="20" strokeOpacity="0.2" />
      {/* 원주 ≈ 126 — 32만 그려 4분의 1짜리 호를 만든다 */}
      <circle cx="25" cy="25" r="20" strokeLinecap="round" strokeDasharray="32 126" />
    </svg>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const { composedImage } = useBoothStore();

  const visible = useFadeIn(100);
  const previewUrl = useObjectUrl(composedImage);
  const upload = useQrUpload(composedImage);

  // 합성 이미지 없이 진입하면 부스로 리다이렉트
  useEffect(() => {
    if (!composedImage) router.replace('/booth');
  }, [composedImage, router]);

  // 여기서 reset()을 부르면 composedImage가 지워져 위 리다이렉트 effect가
  // /booth로 가로채므로, 이동만 한다. 상태 초기화는 부스 화면이 마운트 시 수행.
  const restart = (path: '/' | '/booth') => router.push(path);

  if (!composedImage || !previewUrl) return null;

  // QR이 준비될 때까지 — 사진도 버튼도 아직 내지 않는다
  if (upload.status === 'uploading') {
    return (
      <PosterShell className="transition-opacity duration-700 ease-smooth">
        <PosterHeader label="ALMOST THERE" />
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[calc(var(--u)*3)]">
          <Spinner />
          <div className="text-center">
            <p className="font-display text-[calc(var(--u)*3.6)] tracking-tight text-ink">
              사진을 준비하고 있어요
            </p>
            <p className="mt-[calc(var(--u)*1.4)] font-body text-[clamp(11px,calc(var(--u)*2),14px)] text-muted">
              QR이 만들어지면 사진과 함께 보여드릴게요
            </p>
          </div>
        </section>
      </PosterShell>
    );
  }

  // 업로드 실패 — 다시 시도할 수 있게 열어둔다 (여기서 갇히면 안 된다)
  if (upload.status === 'error') {
    return (
      <PosterShell className="transition-opacity duration-700 ease-smooth">
        <PosterHeader label="ALMOST THERE" />
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[calc(var(--u)*3)]">
          <div className="text-center">
            <p className="font-display text-[calc(var(--u)*3.6)] tracking-tight text-ink">
              사진을 올리지 못했어요
            </p>
            <p className="mt-[calc(var(--u)*1.4)] font-body text-[clamp(11px,calc(var(--u)*2),14px)] text-muted">
              {upload.message}
            </p>
          </div>
          <div className="flex w-full max-w-[300px] flex-col gap-[calc(var(--u)*2)]">
            <Button onClick={upload.retry}>다시 시도</Button>
            <Button onClick={() => restart('/booth')} variant="ghost">
              다시 찍기
            </Button>
          </div>
        </section>
      </PosterShell>
    );
  }

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
          <QRCodeView url={upload.url} />
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
