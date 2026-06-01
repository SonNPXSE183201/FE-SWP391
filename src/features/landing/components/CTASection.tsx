interface CTASectionProps {
  onAction: () => void;
}

export const CTASection = ({ onAction }: CTASectionProps) => {
  return (
    <section className="py-24 bg-bg-surface relative overflow-hidden border-t border-border-custom">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-brand/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-[800px] mx-auto px-8 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
          Sẵn sàng cách mạng hóa quy trình xuất bản?
        </h2>
        <p className="text-text-secondary text-lg mb-10 max-w-[600px] mx-auto">
          Tham gia cùng hàng trăm Mangaka và Editor trên nền tảng quản lý chuyên nghiệp nhất.
        </p>
        <button
          onClick={onAction}
          className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-brand to-brand-hover text-white text-[16px] font-semibold border-none rounded-lg-custom cursor-pointer transition-all duration-300 shadow-brand hover:-translate-y-1 hover:shadow-brand-hover"
        >
          Trải nghiệm ngay
          <svg
            className="transition-transform duration-300 group-hover:translate-x-1"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};
