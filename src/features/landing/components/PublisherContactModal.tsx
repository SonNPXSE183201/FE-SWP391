import { useEffect, useRef, useCallback } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

interface PublisherContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PUBLISHER_INFO = {
  name: 'Inku Publishing',
  slogan: 'Nền tảng xuất bản manga chuyên nghiệp',
  phone: '+84 (0) 123 456 789',
  phoneRaw: '+84123456789',
  address: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',

  workingHours: 'Thứ 2 – Thứ 6: 09:00 – 18:00',
  weekendHours: 'Thứ 7: 09:00 – 12:00 | Chủ nhật: Nghỉ',
  description:
    'Chúng tôi luôn sẵn sàng hợp tác cùng các Mangaka tài năng. Liên hệ qua hotline hoặc email để được tư vấn chi tiết về quy trình sáng tác và xuất bản.',
};

const CONTACT_ITEMS = [
  {
    icon: Phone,
    label: 'Hotline',
    value: PUBLISHER_INFO.phone,
    href: `tel:${PUBLISHER_INFO.phoneRaw}`,
    copyValue: PUBLISHER_INFO.phone,
    accent: '#6C5CE7',
    actionLabel: 'Gọi ngay',
  },
  {
    icon: MapPin,
    label: 'Địa chỉ',
    value: PUBLISHER_INFO.address,
    href: `https://maps.google.com/?q=${encodeURIComponent(PUBLISHER_INFO.address)}`,
    copyValue: PUBLISHER_INFO.address,
    accent: '#FFAA00',
    actionLabel: 'Xem bản đồ',
    external: true,
  },

];

export const PublisherContactModal = ({
  isOpen,
  onClose,
}: PublisherContactModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopy = useCallback(
    (value: string, index: number) => {
      navigator.clipboard.writeText(value).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      });
    },
    []
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{ animation: 'fade-in 0.2s ease-out both' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-bg-secondary border border-border-custom rounded-2xl shadow-2xl ring-1 ring-white/5 overflow-hidden"
        style={{
          animation: 'modal-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* ═══ TOP GRADIENT ACCENT ═══ */}
        <div className="h-[3px] w-full bg-gradient-to-r from-brand via-secondary to-[#e84393]" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-bg-surface/50 border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface hover:rotate-90 transition-all duration-300 z-20"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ═══ HEADER ═══ */}
        <div className="px-6 pt-6 pb-4 relative">
          {/* Background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] rounded-full blur-[80px] opacity-[0.08] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, #6C5CE7, transparent 70%)',
            }}
          />

          <div className="relative flex items-center gap-3.5 mb-3">
            {/* Publisher icon */}
            <div
              className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center animate-scale-in"
              style={{ animationDelay: '0.15s' }}
            >
              <Building2 className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {PUBLISHER_INFO.name}
              </h3>
              <p className="text-text-muted text-xs">
                {PUBLISHER_INFO.slogan}
              </p>
            </div>
          </div>

          <p className="text-text-secondary text-[13px] leading-relaxed">
            {PUBLISHER_INFO.description}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-custom" />

        {/* ═══ CONTACT INFO CARDS ═══ */}
        <div className="px-6 py-5 space-y-3">
          {CONTACT_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isCopied = copiedIndex === index;

            return (
              <div
                key={item.label}
                className="group relative bg-bg-surface/30 hover:bg-bg-surface/60 border border-border-custom/50 hover:border-border-custom rounded-xl p-3.5 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.15 + index * 0.08}s` }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon container */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${item.accent}15` }}
                  >
                    <Icon
                      className="w-[18px] h-[18px]"
                      style={{ color: item.accent }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-text-muted text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-text-primary text-sm font-medium truncate">
                      {item.value}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(item.copyValue, index)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-200"
                      aria-label={`Sao chép ${item.label}`}
                      title={isCopied ? 'Đã sao chép!' : 'Sao chép'}
                    >
                      {isCopied ? (
                        <CheckCircle2
                          className="w-4 h-4 text-success"
                          style={{
                            animation: 'scale-in 0.3s ease-out both',
                          }}
                        />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Action link */}
                    <a
                      href={item.href}
                      {...(item.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        color: item.accent,
                        backgroundColor: `${item.accent}12`,
                        border: `1px solid ${item.accent}30`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${item.accent}25`;
                        e.currentTarget.style.borderColor = `${item.accent}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${item.accent}12`;
                        e.currentTarget.style.borderColor = `${item.accent}30`;
                      }}
                    >
                      {item.actionLabel}
                      {item.external && (
                        <ExternalLink className="w-3 h-3" />
                      )}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ WORKING HOURS ═══ */}
        <div className="px-6 pb-4">
          <div
            className="bg-brand/5 border border-brand/15 rounded-xl p-4 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Clock className="w-[18px] h-[18px] text-brand" />
              </div>
              <div>
                <p className="text-brand text-sm font-semibold mb-1">
                  Giờ làm việc
                </p>
                <p className="text-text-secondary text-[13px] leading-relaxed">
                  {PUBLISHER_INFO.workingHours}
                </p>
                <p className="text-text-muted text-[12px]">
                  {PUBLISHER_INFO.weekendHours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-custom" />

        {/* ═══ FOOTER ACTIONS ═══ */}
        <div
          className="px-6 py-4 flex gap-3 animate-fade-in-up"
          style={{ animationDelay: '0.55s' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-bg-surface/50 hover:border-text-muted hover:-translate-y-0.5 active:translate-y-0 font-medium text-sm transition-all duration-200"
          >
            Đóng
          </button>
          <a
            href={`tel:${PUBLISHER_INFO.phoneRaw}`}
            className="flex-1 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 text-sm no-underline"
          >
            <Phone className="w-4 h-4" />
            Gọi ngay
          </a>
        </div>

        {/* ═══ BOTTOM GRADIENT ═══ */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
      </div>
    </div>
  );
};
