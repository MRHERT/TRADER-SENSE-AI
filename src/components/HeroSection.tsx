import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const stats = [
  { value: "$2.5M+", labelKey: "hero_stats_funded" as const },
  { value: "5,000+", labelKey: "hero_stats_traders" as const },
  { value: "89%", labelKey: "hero_stats_passrate" as const },
  { value: "24/7", labelKey: "hero_stats_support" as const },
];

const features = [
  {
    icon: TrendingUp,
    titleKey: "hero_feature_real_data_title" as const,
    descriptionKey: "hero_feature_real_data_desc" as const,
  },
  {
    icon: Shield,
    titleKey: "hero_feature_risk_title" as const,
    descriptionKey: "hero_feature_risk_desc" as const,
  },
  {
    icon: Zap,
    titleKey: "hero_feature_ai_title" as const,
    descriptionKey: "hero_feature_ai_desc" as const,
  },
  {
    icon: BarChart3,
    titleKey: "hero_feature_charts_title" as const,
    descriptionKey: "hero_feature_charts_desc" as const,
  },
];

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute inset-0 trading-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-24 relative">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm md:text-base font-medium text-primary">{t("hero_badge")}</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              {t("hero_title_main")}{" "}
              <span className="text-primary relative">
                {t("hero_title_highlight")}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 150 2 298 6" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{" "}
              {t("hero_title_suffix")}
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t("hero_subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/challenges">
                <Button variant="hero" size="xl">
                  {t("hero_cta_start")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="hero-outline" size="xl">
                  {t("hero_cta_leaderboard")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
          >
            {stats.map((stat) => (
              <div
                key={stat.labelKey}
                className="glass-card rounded-xl p-6 text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-12">
              {t("hero_why_title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="glass-card-hover rounded-xl p-6 text-left"
                >
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-3">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {t(feature.descriptionKey)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
