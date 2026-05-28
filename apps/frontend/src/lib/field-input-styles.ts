import type { FocusEvent } from 'react';
import { COLORS } from '../constants/colors';

const FORM_FOCUS_RING = `0 0 0 2px color-mix(in srgb, ${COLORS.primary} 18%, transparent)`;
const LEGACY_FOCUS_RING = `0 0 0 2px ${COLORS.primary}30`;

export function fieldInputBaseStyle(borderColor: string) {
  return {
    borderColor,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBackground,
  };
}

export function applyFieldInputBlur(el: HTMLElement, borderColor: string) {
  el.style.borderColor = borderColor;
  el.style.boxShadow = 'none';
  el.style.backgroundColor = COLORS.inputBackground;
}

export function applyFieldInputFocus(
  el: HTMLElement,
  options?: { accentBorder?: boolean; ring?: 'form' | 'legacy' }
) {
  if (options?.accentBorder !== false) {
    el.style.borderColor = COLORS.primary;
    el.style.boxShadow = options?.ring === 'legacy' ? LEGACY_FOCUS_RING : FORM_FOCUS_RING;
  }
  el.style.backgroundColor = COLORS.white;
}

type FocusHandler<E extends HTMLElement> = (event: FocusEvent<E>) => void;

export function bindFieldInputFocusHandlers<E extends HTMLElement>(options: {
  blurBorderColor: string;
  accentBorderOnFocus?: boolean;
  ring?: 'form' | 'legacy';
  onFocus?: FocusHandler<E>;
  onBlur?: FocusHandler<E>;
}): { onFocus: FocusHandler<E>; onBlur: FocusHandler<E> } {
  const { blurBorderColor, accentBorderOnFocus = true, ring = 'form', onFocus, onBlur } = options;

  return {
    onFocus: (event) => {
      applyFieldInputFocus(event.currentTarget, {
        accentBorder: accentBorderOnFocus,
        ring,
      });
      onFocus?.(event);
    },
    onBlur: (event) => {
      applyFieldInputBlur(event.currentTarget, blurBorderColor);
      onBlur?.(event);
    },
  };
}
