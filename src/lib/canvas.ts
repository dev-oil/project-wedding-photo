/**
 * 4컷 합성 로직 — 인생네컷형 세로 프레임
 * 4장의 캡처된 Canvas와 프레임/필터 정보를 받아
 * 1080×1920(9:16) 한 장으로 합성합니다.
 *
 * 레이아웃(레퍼런스 프레임 PNG 알파 측정값 기준):
 * - 2×2 그리드, 슬롯 466×690(세로형)
 * - 좌우 여백 62 · 상단 여백 77 · 슬롯 간 갭 24
 * - 그리드 아래(y=1481~) ~440px가 푸터 영역
 */
import type { Frame, Filter } from '@/types';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

const MARGIN_X = 62;
const MARGIN_TOP = 77;
const GAP = 24;

export const SLOT_WIDTH = (CANVAS_WIDTH - MARGIN_X * 2 - GAP) / 2; // 466
export const SLOT_HEIGHT = 690;

/** 카메라 프리뷰/미리보기가 따라야 하는 슬롯 비율 (CSS aspect-ratio 값) */
export const SLOT_ASPECT = `${SLOT_WIDTH} / ${SLOT_HEIGHT}`;

/** 푸터 영역 시작 y — 그리드 하단 */
const FOOTER_TOP = MARGIN_TOP + SLOT_HEIGHT * 2 + GAP; // 1481

/** 4장의 사진과 프레임을 합성하여 Blob으로 반환 */
export async function composePhotoStrip(
  photos: HTMLCanvasElement[],
  frame: Frame,
  filter: Filter,
): Promise<Blob> {
  // 푸터 텍스트에 쓰는 웹폰트(Hahmlet/Pretendard)가 로드된 뒤 그리기
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready.catch(() => {});
  }

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context를 생성할 수 없습니다.');

  // 배경
  ctx.fillStyle = frame.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2×2 슬롯에 사진 그리기 (0: 좌상 → 1: 우상 → 2: 좌하 → 3: 우하)
  for (let i = 0; i < 4; i++) {
    const photo = photos[i];
    if (!photo) continue;

    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN_X + col * (SLOT_WIDTH + GAP);
    const y = MARGIN_TOP + row * (SLOT_HEIGHT + GAP);

    if (frame.borderColor) {
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 0.5, y - 0.5, SLOT_WIDTH + 1, SLOT_HEIGHT + 1);
    }

    // 사진을 슬롯에 맞춰 그리기 (cover 방식 — 비율 유지하며 채움)
    drawImageCover(ctx, photo, x, y, SLOT_WIDTH, SLOT_HEIGHT);
  }

  // 필터 후처리 효과 (grain, vignette 등)
  if (filter.postProcess) {
    filter.postProcess(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawFooter(ctx, frame);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('이미지 생성에 실패했습니다.'));
      },
      'image/jpeg',
      0.92,
    );
  });
}

/** cover 방식으로 이미지를 지정 영역에 맞춰 그리기 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const sourceRatio = source.width / source.height;
  const destRatio = dw / dh;

  let sx = 0;
  let sy = 0;
  let sw = source.width;
  let sh = source.height;

  if (sourceRatio > destRatio) {
    // 소스가 더 넓음 → 좌우 잘라냄
    sw = source.height * destRatio;
    sx = (source.width - sw) / 2;
  } else {
    // 소스가 더 높음 → 상하 잘라냄
    sh = source.width / destRatio;
    sy = (source.height - sh) / 2;
  }

  ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * 푸터 그리기 — 세리프 커플 이름 · 날짜 + 자간 넓은 대문자 라벨
 * canvas에는 letter-spacing이 없어 라벨은 헤어스페이스( )로 자간을 만든다.
 */
function drawFooter(ctx: CanvasRenderingContext2D, frame: Frame) {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = (FOOTER_TOP + CANVAS_HEIGHT) / 2;
  const label = 'WEDDING PHOTO BOOTH'.split('').join('\u200a\u200a');

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = frame.textColor;

  if (frame.footerText) {
    // 1줄: 커플 이름 (세리프)
    ctx.font = '500 56px Hahmlet, "Nanum Myeongjo", serif';
    ctx.fillText(frame.footerText, centerX, centerY - 62);

    // 2줄: 날짜 — 이름 아래로 떨어뜨림 (헤어스페이스 자간)
    if (frame.footerDate) {
      const date = frame.footerDate.split('').join('\u200a');
      ctx.globalAlpha = 0.85;
      ctx.font = '500 32px Pretendard, -apple-system, sans-serif';
      ctx.fillText(date, centerX, centerY + 18);
    }

    // 3줄: 워드마크 라벨
    ctx.globalAlpha = 0.55;
    ctx.font = '600 24px Pretendard, -apple-system, sans-serif';
    ctx.fillText(label, centerX, centerY + 92);
  } else {
    ctx.font = '600 30px Pretendard, -apple-system, sans-serif';
    ctx.fillText(label, centerX, centerY);
  }

  ctx.restore();
}
