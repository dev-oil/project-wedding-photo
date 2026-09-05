/**
 * 프레임 정의
 * 새 프레임 추가 시 FRAMES 배열에 객체 한 줄만 추가하면 됩니다.
 * 슬롯 배치는 lib/canvas.ts의 고정 2×2 레이아웃 공용 — 여기서는 색 조합만 정의합니다.
 * 푸터(커플 이름 줄 + 날짜 줄)는 lib/couple.ts에서 읽어옵니다.
 */
import { COUPLE_NAMES, WEDDING_DATE } from '@/lib/couple';
import type { Frame } from '@/types';

/** 모든 프레임 공통 푸터 — 이름 아래 날짜가 떨어지는 2줄 구성 */
const footer = { footerText: COUPLE_NAMES, footerDate: WEDDING_DATE };

export const FRAMES: Frame[] = [
  {
    id: 'cream',
    label: '말차 크림',
    background: '#f2f5ea',
    textColor: '#1d4634',
    ...footer,
  },
  {
    id: 'forest',
    label: '포레스트',
    background: '#1d4634',
    textColor: '#e7ecda',
    ...footer,
  },
  {
    id: 'sage',
    label: '세이지',
    background: '#e7ecda',
    textColor: '#1d4634',
    ...footer,
    borderColor: '#dde3d1',
  },
];

export function getFrameById(id: string): Frame {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
