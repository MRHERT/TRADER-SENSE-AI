import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Video,
  Bot,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";

export const MasterclassSection = () => {
  const { t } = useLanguage();

  const courses = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: t("masterclass_course_1_title"),
      description: t("masterclass_course_1_desc"),
      level: t("masterclass_course_1_level"),
      lessons: t("masterclass_course_1_lessons"),
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t("masterclass_course_2_title"),
      description: t("masterclass_course_2_desc"),
      level: t("masterclass_course_2_level"),
      lessons: t("masterclass_course_2_lessons"),
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: t("masterclass_course_3_title"),
      description: t("masterclass_course_3_desc"),
      level: t("masterclass_course_3_level"),
      lessons: t("masterclass_course_3_lessons"),
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: t("masterclass_course_4_title"),
      description: t("masterclass_course_4_desc"),
      level: t("masterclass_course_4_level"),
      lessons: t("masterclass_course_4_lessons"),
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: t("masterclass_course_5_title"),
      description: t("masterclass_course_5_desc"),
      level: t("masterclass_course_5_level"),
      lessons: t("masterclass_course_5_lessons"),
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: t("masterclass_course_6_title"),
      description: t("masterclass_course_6_desc"),
      level: t("masterclass_course_6_level"),
      lessons: t("masterclass_course_6_lessons"),
    },
  ];

  return (
    <section id="masterclass" className="py-24 px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, hsl(var(--secondary) / 0.1) 50%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
            <GraduationCap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("masterclass_badge")}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">{t("masterclass_title_main")}</span>
            <br />
            <span className="gradient-text-gold">{t("masterclass_title_highlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("masterclass_description")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6 hover-lift group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="text-secondary">{course.icon}</div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  {course.level}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground group-hover:text-secondary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {course.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary font-medium">{course.lessons}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link to="/challenges">
            <Button variant="hero" size="lg" className="group">
              {t("masterclass_cta")}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

