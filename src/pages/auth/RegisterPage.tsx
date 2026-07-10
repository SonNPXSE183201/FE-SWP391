import { RegisterForm, RegisterHeroPanel } from '@/features/auth';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Left Side — Hero Panel with workflow & testimonials */}
      <RegisterHeroPanel currentStep={0} />

      {/* Right Side — Registration Form */}
      <RegisterForm />
    </div>
  );
};
