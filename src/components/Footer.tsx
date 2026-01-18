import { motion } from "framer-motion";
import { TrendingUp, Twitter, MessageCircle, Send, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);

  const API_BASE =
    typeof window !== "undefined" && window.location.port === "8080"
      ? "http://localhost:5000"
      : "";

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token =
          typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
        if (!token) {
          setHasActiveChallenge(false);
          return;
        }
        const response = await fetch(`${API_BASE}/api/challenge/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          setHasActiveChallenge(false);
          return;
        }
        const data = await response.json();
        if (data && data.challenge && data.challenge.status === "ACTIVE") {
          setHasActiveChallenge(true);
        } else {
          setHasActiveChallenge(false);
        }
      } catch {
        setHasActiveChallenge(false);
      }
    };
    fetchChallenge();
  }, [API_BASE]);

  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">
                TradeSense AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer_about_text")}
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer_quick_links_title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/challenges" className="hover:text-primary transition-colors">
                  {t("footer_link_challenges")}
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-primary transition-colors">
                  {t("footer_link_leaderboard")}
                </Link>
              </li>
              <li>
                {hasActiveChallenge && (
                  <Link to="/dashboard" className="hover:text-primary transition-colors">
                    {t("footer_link_dashboard")}
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer_resources_title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("footer_link_rules")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("footer_link_faq")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("footer_link_support")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer_contact_title")}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>support@tradesense.ai</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>{t("footer_bottom_copyright")}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">
                {t("footer_bottom_terms")}
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                {t("footer_bottom_privacy")}
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                {t("footer_bottom_risk")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
