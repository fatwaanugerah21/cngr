import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { COLORS } from '../../constants/colors';

export type ButtonVariant = 'primary' | 'submit' | 'outline' | 'ghost';

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
  submit:
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

function filledGradientStyle(base: string, hover: string): CSSProperties {
  return {
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${COLORS.white} 14%, ${base}) 0%, ${base} 48%, ${hover} 100%)`,
    boxShadow: `0 6px 18px color-mix(in srgb, ${base} 32%, transparent)`,
  };
}

function primaryGradientStyle(): CSSProperties {
  return filledGradientStyle(COLORS.primary, COLORS.primaryHover);
}

function submitGradientStyle(): CSSProperties {
  return filledGradientStyle(COLORS.submit, COLORS.submitHover);
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
      variant === 'primary'
        ? { ...primaryGradientStyle(), ...style }
        : variant === 'submit'
          ? { ...submitGradientStyle(), ...style }
          : style;

    const focusRingClass =
      variant === 'submit' ? 'focus-visible:ring-submit' : 'focus-visible:ring-primary';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={[
          'inline-flex cursor-pointer items-center justify-center transition-[filter,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
          focusRingClass,
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
