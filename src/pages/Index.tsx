import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { NewsSection } from "@/components/landing/NewsSection";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { MasterclassSection } from "@/components/landing/MasterclassSection";
import { WhyChooseSection } from "@/components/landing/WhyChooseSection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <NewsSection />
        <CommunitySection />
        <MasterclassSection />
        <WhyChooseSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
