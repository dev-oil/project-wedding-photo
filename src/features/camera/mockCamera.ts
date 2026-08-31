/**
 * 목(mock) 카메라
 * 카메라가 없는 환경(데스크톱 개발 등)에서 UI 작업을 할 수 있도록
 * Canvas를 실시간으로 그려 가짜 MediaStream을 만듭니다.
 *
 * 사용법: .env.local 에 NEXT_PUBLIC_MOCK_CAMERA=true
 * getUserMedia 자리에 그대로 끼워지므로 촬영/필터/합성 경로는 실제와 동일합니다.
 */

const MOCK_WIDTH = 1280;
const MOCK_HEIGHT = 720;
const MOCK_FPS = 30;

/** 목 스트림 활성화 여부 */
export const isMockCamera = process.env.NEXT_PUBLIC_MOCK_CAMERA === 'true';

/** Canvas를 그리며 흐르는 가짜 카메라 스트림을 만듭니다. */
export function createMockStream(): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = MOCK_WIDTH;
  canvas.height = MOCK_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('목 카메라: Canvas 컨텍스트를 만들 수 없습니다.');

  const stream = canvas.captureStream(MOCK_FPS);
  const [track] = stream.getVideoTracks();
  const start = performance.now();

  const draw = () => {
    // cleanup()으로 트랙이 멈추면 루프도 종료
    if (!track || track.readyState === 'ended') return;

    const t = (performance.now() - start) / 1000;

    // 배경 — 천천히 도는 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, MOCK_WIDTH, MOCK_HEIGHT);
    const shift = (Math.sin(t * 0.4) + 1) / 2;
    gradient.addColorStop(0, '#1d4634');
    gradient.addColorStop(0.5 + shift * 0.2, '#2f6b4b');
    gradient.addColorStop(1, '#10251c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MOCK_WIDTH, MOCK_HEIGHT);

    // 살아있음을 확인하는 움직이는 원
    ctx.beginPath();
    ctx.arc(
      MOCK_WIDTH / 2 + Math.cos(t) * 220,
      MOCK_HEIGHT / 2 + Math.sin(t * 1.3) * 120,
      70,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = 'rgba(242, 245, 234, 0.22)';
    ctx.fill();

    // 좌우 반전 캡처(셀카 모드)를 감안해 텍스트도 미리 뒤집어 그림
    ctx.save();
    ctx.translate(MOCK_WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = '#f2f5ea';
    ctx.textAlign = 'center';

    ctx.font = 'bold 78px Pretendard, sans-serif';
    ctx.fillText('MOCK CAMERA', MOCK_WIDTH / 2, MOCK_HEIGHT / 2 - 10);

    ctx.font = '34px Pretendard, sans-serif';
    ctx.fillStyle = 'rgba(242, 245, 234, 0.75)';
    ctx.fillText(
      `NEXT_PUBLIC_MOCK_CAMERA=true · ${t.toFixed(1)}s`,
      MOCK_WIDTH / 2,
      MOCK_HEIGHT / 2 + 56,
    );
    ctx.restore();

    requestAnimationFrame(draw);
  };

  draw();

  return stream;
}
