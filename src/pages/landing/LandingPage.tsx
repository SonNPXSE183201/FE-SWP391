import { useNavigate } from 'react-router-dom';
import {
  HeroSection,
  FeaturesSection,
  WorkflowSection,
  RolesSection,
  MangaShowcaseSection,
  CTASection,
} from '@/features/landing';

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    const nextSection = document.getElementById('features-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="bg-bg-primary min-h-screen">
      <HeroSection
        onGetStarted={handleGetStarted}
        onLearnMore={handleLearnMore}
      />
      <FeaturesSection />
      <WorkflowSection />
      <RolesSection />
      <MangaShowcaseSection />
      <CTASection onAction={handleGetStarted} />
    </main>
  );
};
