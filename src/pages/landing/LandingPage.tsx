import { useNavigate } from 'react-router-dom';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  WorkflowSection,
  RolesSection,
  MangaShowcaseSection,
  CTASection,
  Footer,
  BackToTop,
} from '@/features/landing';
import { SectionDivider } from '@/features/landing/components/SectionDivider';

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
      <Navbar />
      <HeroSection
        onGetStarted={handleGetStarted}
        onLearnMore={handleLearnMore}
      />
      <SectionDivider variant="gradient" color="brand" />
      <FeaturesSection />
      <SectionDivider variant="dots" color="mixed" />
      <WorkflowSection />
      <SectionDivider variant="glow" color="secondary" />
      <RolesSection />
      <SectionDivider variant="gradient" color="mixed" />
      <MangaShowcaseSection />
      <SectionDivider variant="dots" color="brand" />
      <CTASection onAction={handleGetStarted} />
      <Footer />
      <BackToTop />
    </main>
  );
};
