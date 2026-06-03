import { useState } from 'react';
import { RegisterForm, RegisterHeroPanel } from '@/features/auth';

export const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 flex">
      {/* Left Side — Hero Panel with images & testimonials */}
      <RegisterHeroPanel currentStep={currentStep} />

      {/* Right Side — Registration Form */}
      <RegisterForm />
    </div>
  );
};
