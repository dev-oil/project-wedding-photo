/**
 * 공용 타입 정의
 * 프로젝트 전체에서 사용하는 타입을 한 곳에서 관리합니다.
 */

/** 카메라 촬영 플로우의 현재 단계 */
export type BoothStep = 'select' | 'shooting' | 'done';

/** CSS filter 기반 필터 정의 */
export type Filter = {
  id: string;
  label: string;
  /** CSS filter 속성값 — video 미리보기와 canvas 캡처 모두에 적용 */
  css: string;
  /** Canvas 합성 후 추가 효과 (grain, vignette 등) */
  postProcess?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
};

/**
 * 4컷 프레임 색 구성 정의
 * 슬롯 배치(1080×1920, 2×2 그리드)는 lib/canvas.ts의 고정 레이아웃을 따르고,
 * 프레임은 색 조합만 바꿉니다.
 */
export type Frame = {
  id: string;
  label: string;
  /** 프레임 배경색 */
  background: string;
  /** 하단 푸터 텍스트 색상 */
  textColor: string;
  /** 푸터 첫 줄 — 커플 이름 (예: "신랑 ♥ 신부") */
  footerText?: string;
  /** 푸터 둘째 줄 — 결혼식 날짜 (예: "2026.05.20") */
  footerDate?: string;
  /** 사진 테두리 색상 */
  borderColor?: string;
};

/** Zustand 스토어 상태 + 액션 */
export type BoothState = {
  step: BoothStep;
  selectedFrame: string;
  selectedFilter: string;
  photos: HTMLCanvasElement[];
  composedImage: Blob | null;

  setStep: (step: BoothStep) => void;
  setFrame: (id: string) => void;
  setFilter: (id: string) => void;
  addPhoto: (canvas: HTMLCanvasElement) => void;
  setComposedImage: (blob: Blob) => void;
  reset: () => void;
};

/** 카메라 훅 반환 타입 */
export type UseCameraReturn = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  error: string | null;
  capture: (filterCss: string) => HTMLCanvasElement | null;
  cleanup: () => void;
};
