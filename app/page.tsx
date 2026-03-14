import { NavBar } from "@/components/marketing/nav-bar";
import { HeroSection } from "@/components/marketing/hero-section";
import { ValueSection } from "@/components/marketing/value-section";
import { WorkflowSection } from "@/components/marketing/workflow-section";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { ProductsSection } from "@/components/marketing/products-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { MarketingFooter } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <div className="bg-surface text-ink">
      <NavBar />
      <HeroSection />
      <ValueSection />
      <WorkflowSection />
      <DashboardPreview />
      <ProductsSection />
      <CtaSection />
      <MarketingFooter />
    </div>
  );
}
