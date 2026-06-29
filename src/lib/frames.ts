/**
 * 프레임 정의
 * 새 프레임 추가 시 FRAMES 배열에 객체 한 줄만 추가하면 됩니다.
 * footerText는 환경변수에서 커플 이름과 날짜를 읽어옵니다.
 */
import type { Frame } from '@/types';

const coupleNames = process.env.NEXT_PUBLIC_COUPLE_NAMES ?? '신랑 ♥ 신부';
const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE ?? '2026.05.20';
const footer = `${coupleNames}  ${weddingDate}`;

export const FRAMES: Frame[] = [
  {
    id: 'cream',
    label: '말차 크림',
    padding: { top: 60, right: 60, bottom: 140, left: 60 },
    gap: 24,
    background: '#f2f5ea',
    textColor: '#20301f',
    footerText: footer,
  },
  {
    id: 'forest',
    label: '포레스트',
    padding: { top: 60, right: 60, bottom: 140, left: 60 },
    gap: 24,
    background: '#20301f',
    textColor: '#e7ecda',
    footerText: footer,
  },
  {
    id: 'sage',
    label: '세이지',
    padding: { top: 80, right: 80, bottom: 160, left: 80 },
    gap: 32,
    background: '#e7ecda',
    textColor: '#5a8f4e',
    footerText: footer,
    borderColor: '#dde3d1',
  },
];

export function getFrameById(id: string): Frame {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
