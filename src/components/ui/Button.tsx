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
        min-h-[56px] rounded-[14px] px-8 py-3 font-body text-base font-semibold
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
