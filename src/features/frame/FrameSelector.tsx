/**
 * 프레임 선택 UI
 * 가로 스크롤 카드 리스트로 프레임을 선택합니다.
 * 각 카드는 프레임 색상을 미리보기로 보여줍니다.
 */
'use client';

import { FRAMES } from '@/lib/frames';

type FrameSelectorProps = {
  selected: string;
  onSelect: (id: string) => void;
};

export function FrameSelector({ selected, onSelect }: FrameSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {FRAMES.map((frame) => (
        <button
          key={frame.id}
          onClick={() => onSelect(frame.id)}
          className={`flex flex-shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ease-smooth ${
            selected === frame.id
              ? 'border-fg shadow-sm'
              : 'border-border hover:border-muted'
          }`}
        >
          {/* 프레임 색상 미리보기 */}
          <div
            className="h-10 w-7 rounded-sm border border-border"
            style={{ background: frame.background }}
          >
            {/* 작은 4컷 레이아웃 표시 */}
            <div className="flex h-full flex-col justify-evenly px-[3px] py-[3px]">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full rounded-[1px]"
                  style={{
                    height: '18%',
                    background: frame.textColor,
                    opacity: 0.2,
                  }}
                />
              ))}
            </div>
          </div>
          <span className="font-body text-sm text-fg">{frame.label}</span>
        </button>
      ))}
    </div>
  );
}
