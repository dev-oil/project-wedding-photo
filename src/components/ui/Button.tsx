/**
 * 공용 버튼 컴포넌트
 * primary / secondary / ghost 3가지 variant를 제공합니다.
 */
'use client';

import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-forest text-bg active:scale-[0.985]',
  secondary:
    'border-[1.5px] border-forest bg-transparent text-forest active:scale-[0.985]',
  ghost:
    'bg-transparent text-fg/45 hover:text-fg active:scale-[0.985]',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        min-h-[clamp(44px,calc(var(--u)*9.5),56px)] rounded-[14px]
        px-[clamp(16px,calc(var(--u)*5.5),32px)] py-[clamp(8px,calc(var(--u)*2),12px)]
        font-body text-[clamp(12px,calc(var(--u)*2.7),16px)] font-semibold
        transition-all duration-300 ease-smooth
        disabled:pointer-events-none disabled:opacity-40
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
