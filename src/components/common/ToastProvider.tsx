import { createPortal } from 'react-dom';
import { Toaster } from 'react-hot-toast';

/**
 * Toast phải render trực tiếp lên document.body (portal), không nằm trong #root.
 * #root có `isolation: isolate` (reset.css) nên z-index toast bên trong root
 * không thể vượt modal portal (z-50) cũng gắn lên body.
 */
export const ToastProvider = () =>
  createPortal(
    <Toaster
      position="top-center"
      containerStyle={{ zIndex: 999999, pointerEvents: 'none' }}
      toastOptions={{
        className: 'premium-toast',
        style: {
          zIndex: 999999,
          pointerEvents: 'auto',
          background: 'var(--bg-secondary, #1A1A24)',
          color: 'var(--text-primary, #F0F0F5)',
          border: '1px solid var(--border-custom, #2E2E3A)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          fontSize: '14px',
          fontWeight: 500,
          padding: '16px 20px',
          letterSpacing: '0.2px',
        },
        success: {
          iconTheme: {
            primary: 'var(--success, #10B981)',
            secondary: '#1A1A24',
          },
          style: {
            zIndex: 999999,
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), var(--bg-secondary, #1A1A24))',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--danger, #EF4444)',
            secondary: '#1A1A24',
          },
          style: {
            zIndex: 999999,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), var(--bg-secondary, #1A1A24))',
          },
        },
      }}
    />,
    document.body,
  );
