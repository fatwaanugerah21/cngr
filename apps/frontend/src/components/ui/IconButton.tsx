import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon or element to display */
  icon: React.ReactNode;
  /** Accessible label for screen readers */
  'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={`cursor-pointer rounded p-1 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
