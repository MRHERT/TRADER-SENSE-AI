import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingSection";

const Challenges = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <PricingSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Challenges;
