import { Palette, Clock, Wallet, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: Palette,
    title: 'Chọn task theo chuyên môn',
    desc: 'Inking, Coloring, Background, Screentone',
    color: 'brand',
  },
  {
    icon: Clock,
    title: 'Lịch trình linh hoạt',
    desc: 'Freelancer — tự sắp xếp thời gian',
    color: 'info',
  },
  {
    icon: Wallet,
    title: 'Thanh toán bảo đảm',
    desc: 'Thanh toán tự động khi task được duyệt',
    color: 'success',
  },
  {
    icon: Star,
    title: 'Xây dựng uy tín',
    desc: 'Hồ sơ & đánh giá từ các Mangaka',
    color: 'warning',
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  brand: { bg: 'bg-brand/10', text: 'text-brand', border: 'border-brand/20' },
  info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
  success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
};

interface RegisterHeroPanelProps {
  currentStep: number;
}

export const RegisterHeroPanel = ({ currentStep }: RegisterHeroPanelProps) => {
  return (
    <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden">
      {/* Background image layers */}
      <div className="absolute inset-0">
        <img
          src={currentStep === 0 ? '/images/auth/register-hero.png' : '/images/auth/register-tools.png'}
          alt="Manga creation workspace"
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-bg-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/60 to-transparent" />
        <div className="absolute inset-0 bg-bg-primary/20" />
      </div>

      {/* Animated decorative orbs */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-brand/8 blur-[80px] animate-float" />
      <div className="absolute bottom-40 left-10 w-40 h-40 rounded-full bg-info/8 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-success/5 blur-[60px] animate-float" style={{ animationDelay: '7s' }} />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-brand/30 animate-float-particle"
          style={{
            left: `${15 + i * 18}%`,
            bottom: '10%',
            animationDelay: `${i * 3}s`,
            animationDuration: `${12 + i * 2}s`,
          }}
        />
      ))}

      {/* Content overlay */}
      <div className="relative z-20 flex flex-col justify-between p-10 xl:p-12 w-full h-full">
        {/* Center — Main content */}
        <div className="space-y-7">
          {/* Headline */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="h-px w-12 bg-gradient-to-r from-brand to-transparent animate-glow-line" />
              <span className="text-brand/60 text-[11px] font-medium tracking-[0.25em] uppercase">
                アシスタント登録
              </span>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <h2 className="text-[2.5rem] xl:text-[3rem] font-extrabold text-white leading-[1.1] tracking-tight">
                <span className="text-white/90">Cộng tác</span>
                <br />
                <span className="text-white/60 font-bold">cùng </span>
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-[#9b7dff] to-info animate-gradient-shimmer" style={{ backgroundSize: '200% 200%' }}>
                    Mangaka
                  </span>
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gradient-to-r from-brand/60 via-[#9b7dff]/40 to-info/60 rounded-full animate-glow-line" />
                </span>
              </h2>
            </div>

            <p className="text-white/40 text-[13px] max-w-sm leading-[1.7] font-light animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              Đăng ký tài khoản{' '}
              <span className="text-white/70 font-medium border-b border-white/10 pb-px">Trợ lý vẽ</span>
              {' '}— nhận task vẽ trực tiếp từ các Mangaka, làm việc tự do với lịch trình linh hoạt.
            </p>
          </div>

          {/* Feature highlights — staggered */}
          <div className="grid grid-cols-2 gap-2.5">
            {FEATURES.map((feature, i) => {
              const colors = COLOR_MAP[feature.color];
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group flex flex-col gap-2.5 rounded-xl px-4 py-3.5 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${colors.border} bg-white/[0.02] hover:bg-white/[0.05] animate-blur-in`}
                  style={{ animationDelay: `${0.6 + i * 0.1}s` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${colors.text} opacity-50`}>
                      0{i + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/85 text-[13px] font-semibold leading-tight">{feature.title}</p>
                    <p className="text-white/30 text-[11px] mt-1 leading-snug">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom — Workflow pipeline */}
        <div className="pt-6 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center border border-brand/20">
                <span className="text-lg">🎨</span>
              </div>
              <span className="text-[10px] text-white/40 font-medium">Mangaka</span>
            </div>

            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 h-px bg-gradient-to-r from-brand/50 to-brand/20" />
              <span className="text-[10px] text-brand px-1.5 py-0.5 rounded-full bg-brand/10 font-medium whitespace-nowrap">Tạo task</span>
              <div className="flex-1 h-px bg-gradient-to-r from-brand/20 to-success/50" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center border border-success/20">
                <span className="text-lg">✍️</span>
              </div>
              <span className="text-[10px] text-white/40 font-medium">Trợ lý vẽ</span>
            </div>

            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 h-px bg-gradient-to-r from-success/50 to-success/20" />
              <span className="text-[10px] text-success px-1.5 py-0.5 rounded-full bg-success/10 font-medium whitespace-nowrap">Nộp bài</span>
              <div className="flex-1 h-px bg-gradient-to-r from-success/20 to-warning/50" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center border border-warning/20">
                <span className="text-lg">💰</span>
              </div>
              <span className="text-[10px] text-white/40 font-medium">Nhận tiền</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
