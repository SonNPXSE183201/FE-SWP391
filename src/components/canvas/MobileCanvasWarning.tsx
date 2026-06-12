import { useState, useEffect } from 'react';
import { MonitorSmartphone, RotateCcw } from 'lucide-react';

export const MobileCanvasWarning = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center animate-fade-in">
        {/* Icon group */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center">
            <MonitorSmartphone size={40} className="text-brand" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
            <RotateCcw size={16} className="text-warning" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white">
          Canvas không khả dụng trên thiết bị nhỏ
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed">
          Trình chỉnh sửa Canvas yêu cầu màn hình tối thiểu{' '}
          <span className="text-white font-medium">768px</span>. Vui lòng sử dụng
          Desktop hoặc Tablet để có trải nghiệm tốt nhất.
        </p>

        {/* Hints */}
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-3 rounded-xl bg-bg-surface/50 border border-border-custom px-4 py-3">
            <RotateCcw size={18} className="text-info shrink-0" />
            <span className="text-sm text-gray-300 text-left">
              Trên tablet, hãy thử xoay ngang thiết bị
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-bg-surface/50 border border-border-custom px-4 py-3">
            <MonitorSmartphone size={18} className="text-info shrink-0" />
            <span className="text-sm text-gray-300 text-left">
              Trên desktop, đảm bảo cửa sổ trình duyệt đủ rộng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
