import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card px-6 py-12 md:px-10 md:py-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("cta_title_1")}</span>{" "}
            <span className="text-foreground">{t("cta_title_2")}</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t("cta_description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/challenges">
              <Button variant="hero" size="xl" className="group">
                {t("cta_button_start")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero-outline" size="xl">
                {t("cta_button_contact")}
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            {t("cta_footer_text")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
