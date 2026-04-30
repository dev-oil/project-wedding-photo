/**
 * 필터 선택 UI
 * 가로 스크롤 카드 리스트로 필터를 선택합니다.
 */
'use client';

import { FILTERS } from '@/lib/filters';

type FilterSelectorProps = {
  selected: string;
  onSelect: (id: string) => void;
};

export function FilterSelector({ selected, onSelect }: FilterSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onSelect(filter.id)}
          className={`flex-shrink-0 rounded-full border px-5 py-3 font-body text-sm transition-all duration-300 ease-smooth ${
            selected === filter.id
              ? 'border-fg bg-fg text-bg'
              : 'border-border bg-bg text-fg hover:border-muted'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
