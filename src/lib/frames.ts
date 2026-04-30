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
    id: 'classic',
    label: '클래식 화이트',
    padding: { top: 60, right: 60, bottom: 140, left: 60 },
    gap: 24,
    background: '#fafaf7',
    textColor: '#1a1a1a',
    footerText: footer,
  },
  {
    id: 'black',
    label: '블랙',
    padding: { top: 60, right: 60, bottom: 140, left: 60 },
    gap: 24,
    background: '#1a1a1a',
    textColor: '#fafaf7',
    footerText: footer,
  },
  {
    id: 'minimal',
    label: '미니멀',
    padding: { top: 80, right: 80, bottom: 160, left: 80 },
    gap: 32,
    background: '#fafaf7',
    textColor: '#a8a8a3',
    footerText: footer,
    borderColor: '#e8e6e0',
  },
];

export function getFrameById(id: string): Frame {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
