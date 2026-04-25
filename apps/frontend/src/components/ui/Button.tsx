import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { COLORS } from '../../constants/colors';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  /** Optional left icon/element */
  leftIcon?: React.ReactNode;
  /** Optional right icon/element */
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-0 text-white font-medium hover:brightness-[0.98] active:brightness-[0.95] focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  outline:
    'border border-border bg-white font-medium text-text-primary hover:bg-gray-50 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'border-0 bg-transparent font-medium text-text-primary hover:bg-gray-100 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeClasses = {
  sm: 'px-6 py-2.5 text-sm gap-2',
  md: 'px-8 py-3 text-sm gap-2',
  lg: 'px-10 py-3.5 text-base gap-2.5',
};

function radiusClass(variant: ButtonVariant) {
  return variant === 'ghost' ? 'rounded-lg' : 'rounded-full';
}

function primaryGradientStyle(): CSSProperties {
  return {
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${COLORS.white} 14%, ${COLORS.primary}) 0%, ${COLORS.primary} 48%, ${COLORS.primaryHover} 100%)`,
    boxShadow: `0 6px 18px color-mix(in srgb, ${COLORS.primary} 32%, transparent)`,
  };
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      leftIcon,
      rightIcon,
      fullWidth,
      className = '',
      disabled,
      type = 'button',
      style,
      ...props
    },
    ref
  ) => {
    const mergedStyle: CSSProperties | undefined =
      variant === 'primary' ? { ...primaryGradientStyle(), ...style } : style;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={[
          'inline-flex items-center justify-center transition-[filter,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          fullWidth ? 'w-full' : 'w-fit',
          variantClasses[variant],
          sizeClasses[size],
          radiusClass(variant),
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={mergedStyle}
        {...props}
      >
        {leftIcon && <span className="flex shrink-0 items-center [&>svg]:size-[18px]">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex shrink-0 items-center [&>svg]:size-[18px]">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
