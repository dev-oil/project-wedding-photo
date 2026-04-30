/**
 * 시작 화면
 * 결혼식 타이틀과 시작하기 버튼을 보여줍니다.
 * 하객이 화면을 터치하면 /booth로 이동합니다.
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

const coupleNames = process.env.NEXT_PUBLIC_COUPLE_NAMES ?? '신랑 ♥ 신부';
const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE ?? '2026.05.20';

export default function HomePage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  // 부드러운 fade-in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className={`flex h-dvh flex-col items-center justify-center gap-10 px-8 transition-opacity duration-700 ease-smooth ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 날짜 */}
      <p className="font-body text-sm tracking-widest text-muted">
        {weddingDate}
      </p>

      {/* 커플 이름 */}
      <h1 className="text-center font-display text-6xl font-light leading-tight tracking-tight text-fg md:text-7xl">
        {coupleNames}
      </h1>

      {/* 서브 텍스트 */}
      <p className="font-body text-base text-muted">
        화면을 터치하여 포토부스를 시작하세요
      </p>

      {/* 시작 버튼 */}
      <Button
        onClick={() => router.push('/booth')}
        className="mt-4 px-12"
      >
        시작하기
      </Button>
    </main>
  );
}
