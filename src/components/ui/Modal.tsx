/**
 * 공용 모달 컴포넌트
 * 배경 오버레이 + 중앙 카드 형태입니다.
 */
'use client';

import { useEffect, type ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 카드 */}
      <div className="relative z-10 mx-4 max-w-md rounded-2xl bg-bg shadow-sm">
        {children}
      </div>
    </div>
  );
}
