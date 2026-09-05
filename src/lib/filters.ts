/**
 * 필터 정의
 * 새 필터 추가 시 FILTERS 배열에 객체 한 줄만 추가하면 됩니다.
 * postProcess는 Canvas 합성 단계에서 추가 효과를 입힙니다.
 */
import type { Filter } from '@/types';

/** 필름 그레인 효과 — 랜덤 노이즈 픽셀을 약하게 덮음 */
function applyGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.06,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * intensity;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }

  ctx.putImageData(imageData, 0, 0);
}

/** 비네팅 효과 — 가장자리에 어두운 라디얼 그라디언트 */
function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.4,
) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(width, height) / 2;

  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 소프트 글로우 — 흐린 복사본을 lighter 블렌드로 덮어 하이라이트를 번지게 함.
 *
 * ctx.filter의 blur()를 쓰지 않고 축소→확대로 흐림을 만든다.
 * ctx.filter는 Safari 17부터라 구형 아이패드에서 조용히 무시되는데,
 * 그러면 블러 없는 원본이 그대로 덧대어져 그냥 밝아지기만 한다.
 * 1/20로 줄였다가 되키우면 보간이 blur(20px)과 비슷한 흐림을 만든다.
 */
const GLOW_DOWNSCALE = 1 / 20;

function applyGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.15,
) {
  const small = document.createElement('canvas');
  small.width = Math.max(1, Math.round(width * GLOW_DOWNSCALE));
  small.height = Math.max(1, Math.round(height * GLOW_DOWNSCALE));

  const smallCtx = small.getContext('2d');
  if (!smallCtx) return;
  smallCtx.drawImage(ctx.canvas, 0, 0, small.width, small.height);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = intensity;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, width, height);
  ctx.restore();
}

/** 뽀얀 베일 — 화면 전체에 밝은 막을 씌워 블랙을 들어올림 (안개 낀 렌즈 느낌) */
function applyVeil(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.08,
) {
  ctx.save();
  ctx.fillStyle = `rgba(255, 252, 248, ${intensity})`;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export const FILTERS: Filter[] = [
  {
    id: 'none',
    label: '원본',
    css: 'none',
  },
  {
    id: 'bw',
    label: '흑백',
    css: 'grayscale(1) contrast(1.1)',
  },
  {
    id: 'sepia',
    label: '세피아',
    css: 'sepia(0.7) brightness(1.05) contrast(1.05)',
  },
  {
    // 인스타 감성 헤이즈 — 채도 낮고 뽀샤시, 지문 묻은 렌즈처럼 부드럽게 번지는 톤
    id: 'hazy',
    label: '뽀야미',
    css: 'saturate(0.78) brightness(1.1) contrast(0.9)',
    postProcess: (ctx, w, h) => {
      applyGlow(ctx, w, h, 0.28); // 강한 소프트포커스 — 하이라이트가 몽글하게 번짐
      applyVeil(ctx, w, h, 0.09); // 웜톤 베일로 블랙 리프트
    },
  },
  {
    id: 'film',
    label: '필름',
    css: 'contrast(1.2) saturate(0.85) brightness(1.05) sepia(0.15)',
    postProcess: (ctx, w, h) => {
      applyGrain(ctx, w, h, 0.05);
      applyVignette(ctx, w, h, 0.35);
    },
  },
  {
    id: 'glow',
    label: '글로우',
    css: 'brightness(1.15) contrast(0.95) saturate(1.1)',
    postProcess: (ctx, w, h) => {
      applyGlow(ctx, w, h, 0.12);
    },
  },
  {
    id: 'sharp',
    label: '쨍하게',
    css: 'contrast(1.3) saturate(1.2) brightness(1.05)',
  },
];

export function getFilterById(id: string): Filter {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}
