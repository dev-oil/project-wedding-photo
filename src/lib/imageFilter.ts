/**
 * CSS filter 문자열을 Canvas 픽셀에 직접 적용합니다.
 *
 * 왜 ctx.filter를 안 쓰는가 —
 * CanvasRenderingContext2D.filter는 Safari 17에서야 들어왔습니다. 그 이전
 * 사파리(구형 아이패드)에서는 속성 자체가 없어 대입이 조용히 무시되고,
 * 프리뷰만 필터가 걸린 채 최종 사진은 원본으로 나옵니다. 행사 당일 기기를
 * 고를 수 없으므로 브라우저 지원에 기대지 않고 직접 계산합니다.
 *
 * 계산식은 CSS Filter Effects 명세의 색 행렬을 그대로 따르므로
 * 프리뷰(<video>에 걸린 진짜 CSS filter)와 결과가 일치합니다.
 * 지원 함수: grayscale · sepia · saturate · brightness · contrast
 * (blur 등 공간 필터는 픽셀 루프로 재현하지 않고 무시합니다.)
 */

type Rgb = [number, number, number];

/** 0~1로 정규화된 색에 적용할 변환 하나 */
type ColorOp = (c: Rgb) => Rgb;

/** "0.7" 또는 "70%" → 0.7 */
function parseAmount(raw: string, fallback: number): number {
  const s = raw.trim();
  if (!s) return fallback;
  const n = Number.parseFloat(s);
  if (Number.isNaN(n)) return fallback;
  return s.endsWith('%') ? n / 100 : n;
}

/** 명세의 선형 보간 행렬 — amount 0이면 항등, 1이면 완전 적용 */
function matrix(m: number[]): ColorOp {
  return ([r, g, b]) => [
    m[0] * r + m[1] * g + m[2] * b,
    m[3] * r + m[4] * g + m[5] * b,
    m[6] * r + m[7] * g + m[8] * b,
  ];
}

function grayscaleOp(amount: number): ColorOp {
  const k = 1 - Math.min(Math.max(amount, 0), 1);
  return matrix([
    0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k,
    0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k,
    0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k,
  ]);
}

function sepiaOp(amount: number): ColorOp {
  const k = 1 - Math.min(Math.max(amount, 0), 1);
  return matrix([
    0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k,
    0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k,
    0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k,
  ]);
}

function saturateOp(s: number): ColorOp {
  return matrix([
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ]);
}

const brightnessOp = (b: number): ColorOp => ([r, g, bl]) => [r * b, g * b, bl * b];

const contrastOp = (k: number): ColorOp => ([r, g, b]) => [
  (r - 0.5) * k + 0.5,
  (g - 0.5) * k + 0.5,
  (b - 0.5) * k + 0.5,
];

/** CSS filter 문자열 → 순서대로 적용할 변환 목록 (명세상 나열 순서대로 합성) */
export function parseCssFilter(css: string): ColorOp[] {
  if (!css || css === 'none') return [];

  const ops: ColorOp[] = [];
  for (const [, name, arg] of css.matchAll(/([a-z-]+)\(([^)]*)\)/gi)) {
    switch (name.toLowerCase()) {
      case 'grayscale':
        ops.push(grayscaleOp(parseAmount(arg, 1)));
        break;
      case 'sepia':
        ops.push(sepiaOp(parseAmount(arg, 1)));
        break;
      case 'saturate':
        ops.push(saturateOp(parseAmount(arg, 1)));
        break;
      case 'brightness':
        ops.push(brightnessOp(parseAmount(arg, 1)));
        break;
      case 'contrast':
        ops.push(contrastOp(parseAmount(arg, 1)));
        break;
      default:
        // blur, drop-shadow 등 공간 필터는 여기서 재현하지 않는다
        break;
    }
  }
  return ops;
}

/**
 * 캔버스 전체(또는 지정 영역)의 픽셀에 CSS filter를 적용합니다.
 * 적용할 색 변환이 없으면 아무 일도 하지 않습니다.
 */
export function applyCssFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  css: string,
): void {
  const ops = parseCssFilter(css);
  if (ops.length === 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    let c: Rgb = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
    for (const op of ops) c = op(c);

    // 명세대로 0~1로 클램프한 뒤 되돌린다
    data[i] = Math.min(Math.max(c[0], 0), 1) * 255;
    data[i + 1] = Math.min(Math.max(c[1], 0), 1) * 255;
    data[i + 2] = Math.min(Math.max(c[2], 0), 1) * 255;
  }

  ctx.putImageData(imageData, 0, 0);
}
