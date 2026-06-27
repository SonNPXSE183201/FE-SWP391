import React from 'react';
import toast, { type Toast } from 'react-hot-toast';

const toastBody = (title: string, message?: string) =>
  React.createElement(
    'div',
    { className: 'flex flex-col gap-0.5 min-w-0 max-w-[320px]' },
    React.createElement('span', { className: 'font-semibold text-sm text-text-primary leading-tight' }, title),
    message
      ? React.createElement(
          'span',
          { className: 'text-xs text-text-secondary leading-snug break-words' },
          message,
        )
      : null,
  );

const baseOptions = {
  className: 'premium-toast',
  duration: 5000,
} as const;

export const showAppToast = (title: string, message?: string, options?: { icon?: string }) =>
  toast(toastBody(title, message), {
    ...baseOptions,
    icon: options?.icon,
  });

export const showAppSuccess = (message: string) =>
  toast.success(message, baseOptions);

export const showAppError = (message: string) =>
  toast.error(message, baseOptions);

export const showNotificationToast = (title: string, message?: string) =>
  showAppToast(title, message, { icon: '🔔' });

export const dismissToast = (t: Toast) => toast.dismiss(t.id);
