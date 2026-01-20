import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Sparkles, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_BASE } from "@/config";

const staticHeroStats = [
  { value: "98%", label: "hero_stat_accuracy" },
  { value: "24/7", label: "hero_stat_live_signals" },
];

export function HeroSection() {
  const { t } = useLanguage();
  const [activeTraders, setActiveTraders] = useState<string>("50K+");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/admin/public-stats`);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { totalUsers?: number; activeUsers?: number };
        if (typeof data.activeUsers === "number" && data.activeUsers >= 0) {
          setActiveTraders(
            new Intl.NumberFormat("fr-FR").format(Math.max(0, Math.floor(data.activeUsers)))
          );
        }
      } catch {
      }
    };

    loadStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0">
        <div className="absolute inset-0 trading-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 animate-glow-pulse"
          style={{ background: "var(--gradient-glow)" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-muted-foreground">
            {t("hero_title_highlight")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="text-foreground">{t("hero_main_text")}</span>
          <br />
          <span className="gradient-text">{t("hero_highlight_text")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {t("hero_description")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link to="/challenges">
            <Button variant="hero" size="xl" className="group">
              {t("pricing_start_button")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="hero-outline" size="xl" className="group">
              <Trophy className="w-5 h-5" />
              {t("hero_cta_leaderboard")}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="glass-card px-6 py-4 hover-lift">
            <div className="font-display text-2xl sm:text-3xl font-bold gradient-text mb-1">
              {activeTraders}
            </div>
            <div className="text-sm text-muted-foreground">{t("hero_stats_traders")}</div>
          </div>
          {staticHeroStats.map((stat) => (
            <div key={stat.label} className="glass-card px-6 py-4 hover-lift">
              <div className="font-display text-2xl sm:text-3xl font-bold gradient-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{t(stat.label as any)}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="hidden lg:block"
        >
          <div className="absolute top-4 left-[-5rem]">
            <div className="glass-card p-4 animate-float">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="absolute top-10 right-[-5rem]">
            <div className="glass-card p-4 animate-float" style={{ animationDelay: "2s" }}>
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <div className="absolute bottom-4 left-[-5rem]">
            <div className="glass-card p-4 animate-float" style={{ animationDelay: "4s" }}>
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
