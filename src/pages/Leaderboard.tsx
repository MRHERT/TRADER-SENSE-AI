import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Target, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_BASE } from "@/config";

type LeaderboardRow = {
  rank: number;
  name: string;
  profit: number;
  trades: number;
  winRate: number;
};

type LeaderboardApiRow = {
  rank: number;
  name: string;
  profit: number;
  trades: number;
  winRate: number;
};

const Leaderboard = () => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/leaderboard/monthly`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (data && Array.isArray(data.leaderboard)) {
          const items = data.leaderboard as LeaderboardApiRow[];
          setRows(
            items.map((item) => ({
              rank: item.rank,
              name: item.name,
              profit: item.profit,
              trades: item.trades,
              winRate: item.winRate,
            }))
          );
        }
      } catch {
        toast({
          title: t("pricing_error_title"),
          description: t("leaderboard_error_load"),
          variant: "destructive",
        });
      }
    };

    loadLeaderboard();
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 mb-6">
              <Trophy className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">
                {t("leaderboard_badge_label")}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t("leaderboard_title_prefix")}{" "}
              <span className="text-primary">
                {t("leaderboard_title_highlight")}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("leaderboard_subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t("leaderboard_card_title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground font-medium">
                    <div className="col-span-1">{t("leaderboard_header_rank")}</div>
                    <div className="col-span-4">{t("leaderboard_header_trader")}</div>
                    <div className="col-span-2 text-right">{t("leaderboard_header_profit")}</div>
                    <div className="col-span-2 text-right">{t("leaderboard_header_trades")}</div>
                    <div className="col-span-3 text-right">{t("leaderboard_header_win_rate")}</div>
                  </div>

                  {rows.map((trader, index) => (
                    <motion.div
                      key={trader.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg ${
                        index < 3 ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"
                      }`}
                    >
                      <div className="col-span-1">
                        {index === 0 ? (
                          <span className="text-2xl">🥇</span>
                        ) : index === 1 ? (
                          <span className="text-2xl">🥈</span>
                        ) : index === 2 ? (
                          <span className="text-2xl">🥉</span>
                        ) : (
                          <span className="font-mono font-bold text-muted-foreground">
                            #{trader.rank}
                          </span>
                        )}
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {trader.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{trader.name}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-mono font-bold text-profit">
                          +{trader.profit.toFixed(1)}%
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono">
                        {trader.trades}
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${trader.winRate}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm">{trader.winRate}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
