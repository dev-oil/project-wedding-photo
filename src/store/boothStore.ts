/**
 * Zustand 스토어
 * 촬영 플로우의 전역 상태를 관리합니다.
 * select → shooting → done 단계로 진행됩니다.
 */
import { create } from 'zustand';
import type { BoothState } from '@/types';

export const useBoothStore = create<BoothState>((set) => ({
  step: 'select',
  selectedFrame: 'cream',
  selectedFilter: 'none',
  photos: [],
  composedImage: null,

  setStep: (step) => set({ step }),
  setFrame: (id) => set({ selectedFrame: id }),
  setFilter: (id) => set({ selectedFilter: id }),
  addPhoto: (canvas) =>
    set((state) => ({ photos: [...state.photos, canvas] })),
  setComposedImage: (blob) => set({ composedImage: blob }),
  reset: () =>
    set({
      step: 'select',
      selectedFrame: 'cream',
      selectedFilter: 'none',
      photos: [],
      composedImage: null,
    }),
}));
