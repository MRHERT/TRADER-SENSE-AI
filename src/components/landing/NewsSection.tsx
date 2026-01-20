import { motion } from "framer-motion";
import { Newspaper, Sparkles, Calendar, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const newsFeatures = [
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: "news_item_financial",
    description: "news_item_financial_desc",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "news_item_ai",
    description: "news_item_ai_desc",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "news_item_events",
    description: "news_item_events_desc",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "news_item_alerts",
    description: "news_item_alerts_desc",
  },
];

const newsItems = [
  { time: "news_sample_1_time", title: "news_sample_1_title", tag: "news_sample_1_tag", tagColor: "bg-secondary/20 text-secondary-foreground" },
  { time: "news_sample_2_time", title: "news_sample_2_title", tag: "news_sample_2_tag", tagColor: "bg-primary/15 text-primary" },
  { time: "news_sample_3_time", title: "news_sample_3_title", tag: "news_sample_3_tag", tagColor: "bg-success/20 text-success" },
];

export const NewsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="news" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
            <Newspaper className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("news_badge")}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-gold">{t("news_title_highlight")}</span>
            <br />
            <span className="text-foreground">{t("news_title_main")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("news_desc")}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 lg:col-span-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase mb-2">
                  {t("news_feed_title")}
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  {t("news_feed_subtitle")}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">{t("news_feed_live_status")}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm text-muted-foreground">
              <div className="space-y-3">
                <p>
                  {t("news_feed_p1")}
                </p>
                <p>
                  {t("news_feed_p2")}
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  {t("news_feed_p3")}
                </p>
                <p>
                  {t("news_feed_p4")}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-sm">
              {newsItems.map((news, index) => (
                <motion.div
                  key={news.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${news.tagColor}`}>
                      {t(news.tag as any)}
                    </span>
                    <span className="text-xs text-muted-foreground">{t(news.time as any)}</span>
                  </div>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                    {t(news.title as any)}
                  </p>
                </motion.div>
              ))}

              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">{t("news_feed_live_label")}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {newsFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-4 flex items-start gap-3 hover-lift"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold mb-1">
                    {t(feature.title as any)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(feature.description as any)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
