/**
 * 시작 화면
 * 에디토리얼 포스터 레이아웃 — 초대형 타이포(PHOTO / BOOTH) 위에
 * 그린 티켓 · 모노그램 · 스티커를 얹은 구성입니다.
 *
 * 레이아웃 규칙 — components/layout/PosterShell 공용 셸 사용.
 * 모든 치수는 스케일 단위 --u(= min(1vw, 8.2px))에 비례 → 폰~아이패드까지 같은 비율.
 */
'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { PosterShell, PosterHeader } from '@/components/layout/PosterShell';
import { useFadeIn } from '@/hooks/useFadeIn';

const coupleNames = process.env.NEXT_PUBLIC_COUPLE_NAMES ?? '신랑 ♥ 신부';

/** 4각 별 — 포스터 곳곳의 포인트 마크 */
function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 0c.6 6.2 5.2 10.8 12 12-6.8 1.2-11.4 5.8-12 12-.6-6.2-5.2-10.8-12-12C6.8 10.8 11.4 6.2 12 0z" />
    </svg>
  );
}

/** 천천히 도는 원형 텍스트 링 — 중앙 별은 고정 */
function SpinRing({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full animate-[ring-spin_26s_linear_infinite] text-forest/75"
      >
        <defs>
          <path
            id="ring-path"
            d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0"
            fill="none"
          />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <text
          fill="currentColor"
          fontSize="9"
          letterSpacing="2.2"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
        >
          <textPath href="#ring-path" startOffset="0">
            PHOTO BOOTH ✦ PHOTO BOOTH ✦
          </textPath>
        </text>
      </svg>
      <Sparkle className="absolute left-1/2 top-1/2 h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 text-forest" />
    </div>
  );
}

/**
 * 포스터 워드마크
 * textLength로 글자를 컨테이너 폭에 정확히 맞춰 가로 압축한다.
 * → 기기 폭과 무관하게 좌우가 꽉 차고, 굵기는 그대로인 채 폭만 좁아진다(초콘덴스드).
 * viewBox 높이 374 = fontSize 520 × 캡하이트 비율 0.72.
 * fontSize를 자연 폭보다 크게 잡아 textLength가 가로로 눌러준다 → 더 크고 더 좁게.
 * viewBox는 캡하이트에 딱 맞춰져 있어 O의 베이스라인 오버슈트가 밖으로 나간다
 * → overflow-visible 필수(없으면 O 밑이 평평하게 잘림).
 */
function PosterWord({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 1000 374"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      className="relative z-10 block w-full max-h-[24vh] overflow-visible"
    >
      <text
        x="0"
        y="374"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fontSize="520"
        fill="var(--color-ink)"
        style={{ fontFamily: 'var(--font-poster)' }}
      >
        {children}
      </text>
    </svg>
  );
}

/** 그린 티켓 — 양끝 스캘럽(반원 컷) 처리 */
function Ticket({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="rounded-[3px] bg-forest p-[calc(var(--u)*1.6)] shadow-[0_10px_22px_-12px_rgba(23,24,26,0.6)]">
        <div className="flex items-stretch gap-[calc(var(--u)*1.4)] border border-bg/60 px-[calc(var(--u)*1.5)] py-[calc(var(--u)*1.8)]">
          <span className="self-center text-center font-body text-[calc(var(--u)*1.65)] font-medium leading-[1.35] tracking-[0.08em] text-bg/90 [writing-mode:vertical-rl] rotate-180">
            WEDDING DAY
            <br />
            MEMORIES
          </span>
          <span className="self-stretch border-l border-dashed border-bg/50" />
          <span className="flex-1 self-center text-center font-body text-[calc(var(--u)*2.3)] font-semibold leading-[1.45] tracking-[0.05em] text-bg">
            COLLECT
            <br />
            THE MOMENTS
            <br />
            THAT LAST
          </span>
          <span className="self-stretch border-l border-dashed border-bg/50" />
          <span className="self-center text-center font-body text-[calc(var(--u)*1.8)] font-semibold leading-none tracking-[0.14em] text-bg [writing-mode:vertical-rl]">
            ADMIT LOVE
          </span>
        </div>
      </div>

      {/* 양끝 반원 컷 */}
      {(['left', 'right'] as const).map((side) => (
        <div
          key={side}
          className={`absolute inset-y-0 flex flex-col justify-evenly ${
            side === 'left'
              ? 'left-[calc(var(--u)*-0.75)]'
              : 'right-[calc(var(--u)*-0.75)]'
          }`}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-[calc(var(--u)*1.5)] w-[calc(var(--u)*1.5)] rounded-full bg-bg"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const visible = useFadeIn();

  return (
    <PosterShell
      className={`transition-all duration-700 ease-smooth ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {/* 종이 질감 그레인 */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply">
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" opacity="0.08" />
      </svg>

      {/* 상단 라벨 */}
      <PosterHeader label="WEDDING PHOTO BOOTH" />

      {/* 포스터 본문 */}
      <section className="relative flex min-h-0 flex-1 flex-col justify-center">
        <h1 className="sr-only">{coupleNames} 웨딩 포토부스</h1>

        {/* 배경 장식 레이어 — 링 · 원 · 선 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <span className="absolute left-[3%] top-[13%] aspect-square w-[40%] rounded-full border border-forest/50" />
          {/* 큰 그린 원 — 티켓 뒤로 깔리는 포인트(레퍼런스 포스터 참고) */}
          <span className="absolute right-[24%] top-[11%] aspect-square w-[34%] rounded-full bg-forest" />
          <span className="absolute right-[4%] bottom-[14%] aspect-square w-[30%] rounded-full bg-forest/[0.13]" />
          <span className="absolute left-0 top-[31%] h-px w-[20%] bg-forest/45" />
          <span className="absolute bottom-[7%] left-[26%] aspect-square w-[1.8%] rounded-full bg-forest" />
        </div>

        {/* 회전 텍스트 링 — 우측 상단 레이어 */}
        <SpinRing className="absolute right-[1%] top-[1%] z-20 h-[calc(var(--u)*19)] w-[calc(var(--u)*19)]" />

        <PosterWord>PHOTO</PosterWord>

        {/* 중단 밴드 — 티켓 */}
        <div className="relative z-10 flex items-center justify-end py-[4vh]">
          {/* 이탤릭 세리프 태그라인 + 화살표 — 왼쪽 정렬 */}
          <div className="absolute left-[2%] top-1/2 z-10 flex w-[32%] -translate-y-1/2 flex-col gap-[calc(var(--u)*1.2)]">
            <p className="font-display text-[calc(var(--u)*3)] italic leading-[1.32] text-ink">
              Timeless
              <br />
              moments for
              <br />
              your day
            </p>
            <svg
              viewBox="0 0 60 10"
              aria-hidden
              className="w-[55%] self-end text-forest"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M1 5h55m0 0l-5.5-4M56 5l-5.5 4" />
            </svg>
          </div>

          <Ticket className="w-[47%] rotate-[-5deg]" />
        </div>

        {/* BOOTH + 그린 스와시 + 스티커 */}
        <div className="relative z-10">
          <span
            aria-hidden
            className="absolute -bottom-[calc(var(--u)*1)] left-[5%] h-[calc(var(--u)*5)] w-[42%] -skew-x-[22deg] bg-forest"
          />
          <PosterWord>
            {'BO'}
            <tspan fill="none" stroke="var(--color-forest)" strokeWidth="5">O</tspan>
            {'TH'}
          </PosterWord>
          <span className="absolute -bottom-[calc(var(--u)*2.5)] right-[3%] z-20 flex rotate-[-6deg] items-center gap-[calc(var(--u)*1.2)] rounded-full border border-forest bg-bg px-[calc(var(--u)*2.6)] py-[calc(var(--u)*1.5)] shadow-[0_6px_16px_-8px_rgba(23,24,26,0.6)]">
            <Sparkle className="h-[calc(var(--u)*2.3)] w-[calc(var(--u)*2.3)] text-forest" />
            <span className="font-body text-[calc(var(--u)*2.2)] font-semibold tracking-[0.16em] text-forest">
              CELEBRATE LOVE
            </span>
          </span>
        </div>
      </section>

      {/* 시작 버튼 */}
      <button
        onClick={() => router.push('/booth')}
        className="relative z-10 mt-[calc(var(--u)*5)] flex h-[min(calc(var(--u)*16),88px)] shrink-0 items-center justify-center gap-[calc(var(--u)*3)] rounded-[14px] bg-forest font-body text-[min(calc(var(--u)*4.9),28px)] font-semibold tracking-[0.02em] text-bg transition-transform duration-300 ease-smooth active:scale-[0.985]"
      >
        시작하기
        <Sparkle className="h-[min(calc(var(--u)*4.4),24px)] w-[min(calc(var(--u)*4.4),24px)] text-bg" />
      </button>
    </PosterShell>
  );
}
