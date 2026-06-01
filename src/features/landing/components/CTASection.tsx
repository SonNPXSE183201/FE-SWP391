interface CTASectionProps {
  onAction: () => void;
}

export const CTASection = ({ onAction }: CTASectionProps) => {
  return (
    <section className="py-24 bg-bg-surface relative overflow-hidden border-t border-border-custom">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-brand/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Floating manga book decorations */}
      <div className="absolute top-10 left-[5%] w-[180px] h-[240px] rounded-xl overflow-hidden opacity-[0.08] rotate-[-12deg] pointer-events-none hidden lg:block">
        <img
          src="/images/landing/published-volumes.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="absolute bottom-10 right-[5%] w-[200px] h-[260px] rounded-xl overflow-hidden opacity-[0.08] rotate-[8deg] pointer-events-none hidden lg:block">
        <img
          src="/images/landing/manga-characters.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="absolute top-1/2 left-[12%] -translate-y-1/2 w-[140px] h-[180px] rounded-xl overflow-hidden opacity-[0.06] rotate-[-6deg] pointer-events-none hidden xl:block">
        <img
          src="/images/landing/manga-panels.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="absolute top-1/2 right-[12%] -translate-y-1/2 w-[150px] h-[190px] rounded-xl overflow-hidden opacity-[0.06] rotate-[10deg] pointer-events-none hidden xl:block">
        <img
          src="/images/landing/hero-mangaka.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-[800px] mx-auto px-8 relative z-10 text-center">
        {/* Published volumes image row */}
        <div className="flex justify-center gap-3 mb-10">
          {[
            '/images/landing/manga-panels.png',
            '/images/landing/manga-characters.png',
            '/images/landing/published-volumes.png',
            '/images/landing/collaboration.png',
          ].map((src, i) => (
            <div
              key={src}
              className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-border-custom/60 shadow-md-custom transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:border-brand/50"
              style={{ transform: `rotate(${(i - 1.5) * 5}deg)` }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
          Sẵn sàng cách mạng hóa{' '}
          <span className="bg-gradient-to-r from-brand via-secondary to-[#e84393] bg-clip-text text-transparent">
            quy trình xuất bản?
          </span>
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
