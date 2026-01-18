import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/PricingSection";
import { Shield, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const rules = [
  {
    icon: TrendingUp,
    titleKey: "challenge_rule_profit_title" as const,
    descriptionKey: "challenge_rule_profit_desc" as const,
  },
  {
    icon: AlertTriangle,
    titleKey: "challenge_rule_daily_title" as const,
    descriptionKey: "challenge_rule_daily_desc" as const,
    warning: true,
  },
  {
    icon: Shield,
    titleKey: "challenge_rule_total_title" as const,
    descriptionKey: "challenge_rule_total_desc" as const,
    warning: true,
  },
  {
    icon: Clock,
    titleKey: "challenge_rule_period_title" as const,
    descriptionKey: "challenge_rule_period_desc" as const,
  },
];

const Challenges = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t("challenges_title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("challenges_subtitle")}
            </p>
          </motion.div>

          {/* Trading Rules */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              {t("challenges_rules_title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {rules.map((rule, index) => (
                <motion.div
                  key={rule.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card
                    variant="glass"
                    className={`h-full ${rule.warning ? "border-warning/30" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`p-3 rounded-lg w-fit mb-4 ${
                          rule.warning ? "bg-warning/10" : "bg-primary/10"
                        }`}
                      >
                        <rule.icon
                          className={`h-6 w-6 ${
                            rule.warning ? "text-warning" : "text-primary"
                          }`}
                        />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {t(rule.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(rule.descriptionKey)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <PricingSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Challenges;
