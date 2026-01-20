import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Share2, GraduationCap, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const communityFeatures = [
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: "community_landing_feature_1_title",
    description: "community_landing_feature_1_desc",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "community_landing_feature_2_title",
    description: "community_landing_feature_2_desc",
  },
  {
    icon: <Share2 className="w-8 h-8" />,
    title: "community_landing_feature_3_title",
    description: "community_landing_feature_3_desc",
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "community_landing_feature_4_title",
    description: "community_landing_feature_4_desc",
  },
];

export const CommunitySection = () => {
  const { t } = useLanguage();
  const [memberCount, setMemberCount] = useState<string>("50,000+");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/admin/public-stats`);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { totalUsers?: number; activeUsers?: number };
        if (typeof data.totalUsers === "number" && data.totalUsers >= 0) {
          setMemberCount(
            new Intl.NumberFormat("fr-FR").format(Math.max(0, Math.floor(data.totalUsers)))
          );
        }
      } catch {
      }
    };

    loadStats();
  }, []);

  return (
    <section id="community" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("community_landing_badge")}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">{t("community_landing_title_main")}</span>{" "}
            <span className="gradient-text">{t("community_landing_title_highlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("community_landing_description")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {communityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6 text-center hover-lift group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <div className="text-primary">{feature.icon}</div>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                {t(feature.title as any)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(feature.description as any)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-card p-8"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center -space-x-3 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-background bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center"
                  >
                    <Users className="w-5 h-5 text-foreground" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">
                    +
                    {memberCount}
                  </span>
                </div>
              </div>
              <h4 className="font-display text-2xl font-bold gradient-text">{memberCount}</h4>
              <p className="text-muted-foreground">Membres Actifs</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {["Forex", "Crypto", "Actions", "Indices"].map((group) => (
                  <span
                    key={group}
                    className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
              <h4 className="font-display text-2xl font-bold gradient-text-gold">200+</h4>
              <p className="text-muted-foreground">Groupes Thématiques</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <MessageCircle className="w-12 h-12 text-primary" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-success-foreground">99+</span>
                  </div>
                </div>
              </div>
              <h4 className="font-display text-2xl font-bold gradient-text">10K+</h4>
              <p className="text-muted-foreground">Messages par Jour</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
