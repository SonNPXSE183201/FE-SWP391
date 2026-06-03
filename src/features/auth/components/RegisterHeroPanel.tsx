import { useState, useEffect } from 'react';

const TESTIMONIALS = [
  {
    quote: 'Manga Studio giúp tôi kết nối với các Mangaka hàng đầu và phát triển kỹ năng vượt bậc.',
    author: 'Minh Anh',
    role: 'Background Artist',
    avatar: '🎨',
  },
  {
    quote: 'Hệ thống phân công task rõ ràng, thanh toán nhanh chóng — môi trường làm việc chuyên nghiệp.',
    author: 'Hiro Tanaka',
    role: 'Inking Specialist',
    avatar: '✒️',
  },
  {
    quote: 'Từ freelancer đến assistant chính thức, Manga Studio thay đổi sự nghiệp của tôi hoàn toàn.',
    author: 'Sakura Đào',
    role: 'Colorist & Screentoner',
    avatar: '🌸',
  },
];

const BENEFITS = [
  { icon: '💰', text: 'Nhận nhuận bút (Genkoūryō) minh bạch' },
  { icon: '🎯', text: 'Nhận task phù hợp chuyên môn' },
  { icon: '📈', text: 'Xây dựng hồ sơ chuyên nghiệp' },
  { icon: '🤝', text: 'Cộng tác với Mangaka hàng đầu' },
];

interface RegisterHeroPanelProps {
  currentStep: number;
}

export const RegisterHeroPanel = ({ currentStep }: RegisterHeroPanelProps) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
      {/* Background image layers */}
      <div className="absolute inset-0">
        <img
          src={currentStep === 0 ? '/images/auth/register-hero.png' : '/images/auth/register-tools.png'}
          alt="Manga creation workspace"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/60 to-[#0a0f1e]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0f1e]/40" />
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex flex-col justify-between p-10 w-full">
        {/* Top branding */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <span className="text-white/80 font-semibold text-sm tracking-wider uppercase">Manga Studio</span>
          </div>
        </div>

        {/* Main heading */}
        <div className="space-y-6">
          <div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              Sáng tạo cùng
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                Manga Studio
              </span>
            </h2>
            <p className="text-slate-300/90 text-base mt-4 max-w-sm leading-relaxed">
              Gia nhập đội ngũ Assistant — trở thành cánh tay phải đắc lực cho các Mangaka hàng đầu.
            </p>
          </div>

          {/* Benefits list */}
          <div className="grid grid-cols-2 gap-2.5">
            {BENEFITS.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-white/5"
              >
                <span className="text-lg">{benefit.icon}</span>
                <span className="text-slate-300 text-xs font-medium leading-tight">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial carousel */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{TESTIMONIALS[activeTestimonial].avatar}</span>
              <div className="flex-1">
                <p className="text-slate-200 text-sm italic leading-relaxed mb-3">
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </p>
                <div>
                  <p className="text-white text-sm font-semibold">{TESTIMONIALS[activeTestimonial].author}</p>
                  <p className="text-emerald-400/80 text-xs">{TESTIMONIALS[activeTestimonial].role}</p>
                </div>
              </div>
            </div>
            {/* Dots */}
            <div className="flex gap-1.5 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? 'w-6 bg-emerald-400' : 'w-1.5 bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center gap-6 pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-slate-400 text-xs">Assistants</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">120+</p>
            <p className="text-slate-400 text-xs">Mangaka</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">2K+</p>
            <p className="text-slate-400 text-xs">Tasks hoàn thành</p>
          </div>
        </div>
      </div>
    </div>
  );
};
