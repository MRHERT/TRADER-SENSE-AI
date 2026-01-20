import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const WhyChooseSection = () => {
  const { t } = useLanguage();

  const benefits = [
    t("why_choose_benefit_1"),
    t("why_choose_benefit_2"),
    t("why_choose_benefit_3"),
    t("why_choose_benefit_4"),
    t("why_choose_benefit_5"),
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("why_choose_badge")}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">{t("why_choose_title_1")}</span>
            <br />
            <span className="gradient-text">{t("why_choose_title_2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("why_choose_description")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 md:p-8"
        >
          <ul className="space-y-4 text-sm md:text-base">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/15 p-1.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

