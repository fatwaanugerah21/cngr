import type { ComponentType, ReactNode } from 'react';
import { COLORS } from '../../constants/colors';
import Modal from './Modal';
import Button from './Button';
import AlertIcon from '../../icons/alert.icon';

type SvgIconComponent = ComponentType<{ fill?: string; className?: string }>;

export type ConfirmationModalComponentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon?: SvgIconComponent;
  title: string;
  description: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
  closeOnConfirm?: boolean;
  onConfirm: () => void;
};

export default function ConfirmationModalComponent({
  open,
  onOpenChange,
  icon = AlertIcon,
  title,
  description,
  cancelLabel = 'Kembali',
  confirmLabel,
  confirmDisabled = false,
  closeOnConfirm = true,
  onConfirm,
}: ConfirmationModalComponentProps) {
  const Icon = icon;
  return (
    <Modal open={open} onOpenChange={onOpenChange} closeOnBackdropClick={false}>
      <div className="flex flex-col items-center gap-6 text-center">
        <div aria-hidden>
          <Icon fill={COLORS.primary} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: COLORS.textPrimary }}>
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
            {description}
          </p>
        </div>

        <div className="flex w-full gap-5">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={confirmDisabled}
            style={{
              backgroundColor: '#F3F4F6',
              color: '#94A3B8',
              boxShadow: 'none',
              backgroundImage: 'none',
            }}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            size="md"
            className="flex-1"
            onClick={() => {
              onConfirm();
              if (closeOnConfirm) onOpenChange(false);
            }}
            disabled={confirmDisabled}
            style={{
              backgroundColor: COLORS.primary,
              backgroundImage: 'none',
              boxShadow: 'none',
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

