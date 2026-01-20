import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  StopCircle,
  FileText,
  AlertTriangle,
  Filter,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const features = [
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "feature_buy_signals",
    description: "feature_buy_desc",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: <TrendingDown className="w-6 h-6" />,
    title: "feature_sell_signals",
    description: "feature_sell_desc",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: <StopCircle className="w-6 h-6" />,
    title: "feature_stop_signals",
    description: "feature_stop_desc",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "feature_plans",
    description: "feature_plans_desc",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "feature_risk",
    description: "feature_risk_desc",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: <Filter className="w-6 h-6" />,
    title: "feature_sort",
    description: "feature_sort_desc",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("features_assist_badge")}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">{t("features_title_main")}</span>
            <br />
            <span className="gradient-text">{t("features_title_highlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("features_desc")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="glass-card p-6 hover-lift"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.bgColor}`}>
                  <span className={feature.color}>{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {t(feature.title as any)}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t(feature.description as any)}</p>
                </div>
              </div>

              {feature.title === "feature_plans" && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="glass-card-hover px-3 py-2">
                    <span className="block font-medium text-foreground mb-1">{t("feature_detail_forex")}</span>
                    <span>EUR/USD, GBP/USD, XAU/USD</span>
                  </div>
                  <div className="glass-card-hover px-3 py-2">
                    <span className="block font-medium text-foreground mb-1">{t("feature_detail_indices")}</span>
                    <span>US30, NAS100, GER40</span>
                  </div>
                </div>
              )}

              {feature.title === "feature_risk" && (
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("feature_detail_alerts")}</span>
                  <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                    {t("feature_detail_realtime")}
                  </span>
                </div>
              )}

              {feature.title === "feature_sort" && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {["Scalping", "Day Trading", "Swing", "Long Terme"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-muted/40 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {feature.title === "feature_buy_signals" && (
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("feature_detail_winrate")}</span>
                  <span className="px-2 py-1 rounded-full bg-success/10 text-success font-semibold">
                    89%
                  </span>
                </div>
              )}

              {feature.title === "feature_sell_signals" && (
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("feature_detail_drawdown")}</span>
                  <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive font-semibold">
                    &lt; 5%
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-6 md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6 mt-2"
          >
            <div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {t("features_bottom_title")}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xl">
                {t("features_bottom_desc")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass-card-hover px-4 py-3">
                <p className="text-muted-foreground">{t("features_stat_time")}</p>
                <p className="font-display text-2xl font-bold gradient-text">+2h</p>
              </div>
              <div className="glass-card-hover px-4 py-3">
                <p className="text-muted-foreground">{t("features_stat_decisions")}</p>
                <p className="font-display text-2xl font-bold gradient-text-gold">x3</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
