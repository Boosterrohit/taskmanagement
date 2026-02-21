import Feature from "@/components/LandingPage/Feature";
import { HeroSection } from "../components/LandingPage/HeroSection";
import Work from "@/components/LandingPage/Work";
import { Testimonials } from "@/components/LandingPage/Testimonial";
import { CTA } from "@/components/LandingPage/Organized";
import { Footer } from "@/components/LandingPage/Footer";

const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <div>
        <Feature />
        <Work />
        <Testimonials />
        <CTA/>
        <Footer/>
      </div>
    </main>
  );
};

export default LandingPage;
