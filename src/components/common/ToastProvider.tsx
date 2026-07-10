import { createPortal } from 'react-dom';
import { Toaster, ToastBar } from 'react-hot-toast';

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
        duration: 4000,
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
        },
        error: {
          iconTheme: {
            primary: 'var(--danger, #EF4444)',
            secondary: '#1A1A24',
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => {
            const isStringMessage = typeof t.message === 'string';
            
            if (isStringMessage) {
              let title = 'Thông báo';
              if (t.type === 'success') title = 'Thành công';
              else if (t.type === 'error') title = 'Lỗi';

              return (
                <>
                  {icon}
                  <div className="flex flex-col gap-0.5 min-w-0 max-w-[320px] ml-1">
                    <span className="font-semibold text-sm text-text-primary leading-tight">{title}</span>
                    <span className="text-xs text-text-secondary leading-snug break-words">
                      {t.message as string}
                    </span>
                  </div>
                </>
              );
            }

            return (
              <>
                {icon}
                {message}
              </>
            );
          }}
        </ToastBar>
      )}
    </Toaster>,
    document.body,
  );
