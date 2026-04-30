/**
 * 4컷 합성 로직
 * 4장의 캡처된 Canvas와 프레임/필터 정보를 받아
 * 1200x1800 크기의 한 장으로 합성합니다.
 */
import type { Frame, Filter } from '@/types';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 1800;

/** 4장의 사진과 프레임을 합성하여 Blob으로 반환 */
export async function composePhotoStrip(
  photos: HTMLCanvasElement[],
  frame: Frame,
  filter: Filter,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context를 생성할 수 없습니다.');

  // 배경
  ctx.fillStyle = frame.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 사진 영역 계산
  const { padding, gap } = frame;
  const contentWidth = CANVAS_WIDTH - padding.left - padding.right;
  const totalGap = gap * 3;
  const footerSpace = frame.footerText ? 0 : 0; // 이미 padding.bottom에 포함
  const contentHeight = CANVAS_HEIGHT - padding.top - padding.bottom - footerSpace;
  const photoHeight = (contentHeight - totalGap) / 4;
  const photoWidth = contentWidth;

  // 각 사진 그리기
  for (let i = 0; i < 4; i++) {
    const photo = photos[i];
    if (!photo) continue;

    const x = padding.left;
    const y = padding.top + i * (photoHeight + gap);

    // 테두리가 있으면 먼저 그리기
    if (frame.borderColor) {
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 0.5, y - 0.5, photoWidth + 1, photoHeight + 1);
    }

    // 사진을 영역에 맞춰 그리기 (cover 방식 — 비율 유지하며 채움)
    drawImageCover(ctx, photo, x, y, photoWidth, photoHeight);
  }

  // 필터 후처리 효과 (grain, vignette 등)
  if (filter.postProcess) {
    filter.postProcess(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // 하단 텍스트
  if (frame.footerText) {
    drawFooterText(ctx, frame);
  }

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

/** 하단 텍스트 그리기 */
function drawFooterText(ctx: CanvasRenderingContext2D, frame: Frame) {
  if (!frame.footerText) return;

  ctx.save();
  ctx.fillStyle = frame.textColor;
  ctx.font = '32px "Fraunces", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textY = CANVAS_HEIGHT - frame.padding.bottom / 2;
  ctx.fillText(frame.footerText, CANVAS_WIDTH / 2, textY);
  ctx.restore();
}
