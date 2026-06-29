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
    'bg-accent text-white hover:opacity-90 active:scale-[0.98]',
  secondary:
    'bg-bg text-fg border border-border hover:border-muted active:scale-[0.98]',
  ghost:
    'bg-transparent text-muted hover:text-fg active:scale-[0.98]',
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
        min-h-[60px] rounded-full px-8 py-4 font-body text-base
        transition-all duration-300 ease-smooth
        disabled:pointer-events-none disabled:opacity-50
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
