import HeroSection from "./HeroSection";
import PainSection from "./PainSection";
import FeatureSection from "./FeatureSection";
import SocialProofSection from "./SocialProofSection";
import FinalCTASection from "./FinalCTASection";

export interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingView({ onGetStarted }: LandingViewProps) {
  return (
    <div className="w-full flex flex-col">
      <HeroSection onGetStarted={onGetStarted} />
      <PainSection />
      <FeatureSection />
      <SocialProofSection />
      <FinalCTASection onGetStarted={onGetStarted} />
    </div>
  );
}
