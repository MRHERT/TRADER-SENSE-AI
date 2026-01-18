import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Zap, Trophy, Crown, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const API_BASE =
  typeof window !== "undefined" && window.location.port === "8080"
    ? "http://localhost:5000"
    : "";

const plans = [
  {
    name: "Starter",
    price: "200",
    currency: "DH",
    nameKey: "pricing_plan_starter_name",
    descriptionKey: "pricing_plan_starter_desc",
    icon: Zap,
    features: [
      "pricing_feature_starting_balance_5k",
      "pricing_feature_profit_target_10",
      "pricing_feature_daily_loss_5",
      "pricing_feature_total_loss_10",
      "pricing_feature_challenge_period_30",
      "pricing_feature_basic_analytics",
    ] as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "500",
    currency: "DH",
    nameKey: "pricing_plan_pro_name",
    descriptionKey: "pricing_plan_pro_desc",
    icon: Trophy,
    features: [
      "pricing_feature_starting_balance_25k",
      "pricing_feature_profit_target_10",
      "pricing_feature_daily_loss_5",
      "pricing_feature_total_loss_10",
      "pricing_feature_challenge_period_45",
      "pricing_feature_advanced_analytics",
      "pricing_feature_ai_signals",
    ] as const,
    popular: true,
  },
  {
    name: "Elite",
    price: "1000",
    currency: "DH",
    nameKey: "pricing_plan_elite_name",
    descriptionKey: "pricing_plan_elite_desc",
    icon: Crown,
    features: [
      "pricing_feature_starting_balance_50k",
      "pricing_feature_profit_target_10",
      "pricing_feature_daily_loss_5",
      "pricing_feature_total_loss_10",
      "pricing_feature_challenge_period_60",
      "pricing_feature_premium_analytics",
      "pricing_feature_ai_signals",
      "pricing_feature_priority_support",
    ] as const,
    popular: false,
  },
];

export function PricingSection() {
  const navigate = useNavigate();
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<"methods" | "processing" | "success">("methods");
  const { t } = useLanguage();

  const handleStartChallenge = async (planName: string, price: string, method: string) => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    const amount = parseFloat(price);

    if (!token) {
      navigate(`/auth?mode=register&redirect=/challenges`);
      return;
    }

    setProcessingKey(`${planName}-${method}`);

    try {
      const paymentResponse = await fetch(`${API_BASE}/api/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName,
          amount,
          method,
          currency: "DH",
        }),
      });

      if (!paymentResponse.ok) {
        const data = await paymentResponse.json().catch(() => ({}));
        const backendMessage =
          data && typeof (data as any).message === "string"
            ? ((data as any).message as string)
            : "";
        const backendError =
          data && typeof (data as any).error === "string"
            ? ((data as any).error as string)
            : "";
        const combined =
          backendError && backendMessage
            ? `${backendMessage} (${backendError})`
            : backendMessage || t("pricing_error_payment_failed");
        toast({
          title: t("pricing_error_title"),
          description: combined,
          variant: "destructive",
        });
        setDialogStep("methods");
        return;
      }

      const data = await paymentResponse.json().catch(() => null);

      if (method === "PayPal") {
        const approvalUrl =
          data &&
          (data as any).paypal &&
          typeof (data as any).paypal.approvalUrl === "string"
            ? (data as any).paypal.approvalUrl
            : null;

        if (!approvalUrl) {
          toast({
            title: t("pricing_error_title"),
            description: t("pricing_error_payment_failed"),
            variant: "destructive",
          });
          setDialogStep("methods");
          return;
        }

        window.location.href = approvalUrl;
        return;
      }

      toast({
        title: t("pricing_success_title"),
        description: t("pricing_success_description"),
      });

      setDialogStep("success");

      setTimeout(() => {
        setDialogOpen(false);
        navigate("/dashboard");
      }, 1200);
    } catch {
      toast({
        title: t("pricing_error_title"),
        description: t("pricing_error_network"),
        variant: "destructive",
      });
      setDialogStep("methods");
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 trading-grid opacity-30" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("pricing_title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("pricing_subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="pricing"
                className={`relative h-full flex flex-col ${
                  plan.popular ? "border-primary/50 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full">
                      {t("pricing_most_popular")}
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 p-3 rounded-xl bg-primary/10">
                    <plan.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{t(plan.nameKey)}</CardTitle>
                  <CardDescription>{t(plan.descriptionKey)}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-8">
                    <span className="text-5xl font-display font-bold">{plan.price}</span>
                    <span className="text-xl text-muted-foreground ml-1">{plan.currency}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((featureKey) => (
                      <li key={featureKey} className="flex items-center gap-3 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <div className="w-full flex flex-col gap-2">
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      size="lg"
                      className="w-full"
                      disabled={processingKey !== null}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setDialogStep("methods");
                        setDialogOpen(true);
                      }}
                    >
                      {t("pricing_start_button")}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedPlan(null);
              setDialogStep("methods");
              setProcessingKey(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPlan ? t(selectedPlan.nameKey) : ""}
              </DialogTitle>
              <DialogDescription>
                {selectedPlan ? t(selectedPlan.descriptionKey) : ""}
              </DialogDescription>
            </DialogHeader>
            {dialogStep === "methods" && (
              <>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!selectedPlan}
                    onClick={() => {
                      if (!selectedPlan) return;
                      setDialogStep("processing");
                      handleStartChallenge(selectedPlan.name, selectedPlan.price, "CMI");
                    }}
                  >
                    <span className="inline-flex items-center justify-center h-5 px-2 rounded bg-white">
                      <span className="text-[11px] font-semibold text-red-600">CMI</span>
                    </span>
                    <span>{t("pricing_method_cmi")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!selectedPlan}
                    onClick={() => {
                      if (!selectedPlan) return;
                      setDialogStep("processing");
                      handleStartChallenge(selectedPlan.name, selectedPlan.price, "Crypto");
                    }}
                  >
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                      ₿
                    </span>
                    <span>{t("pricing_method_crypto")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!selectedPlan}
                    onClick={() => {
                      if (!selectedPlan) return;
                      setDialogStep("processing");
                      handleStartChallenge(selectedPlan.name, selectedPlan.price, "PayPal");
                    }}
                  >
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gradient-to-br from-blue-700 to-sky-500 text-white text-xs font-bold">
                      P
                    </span>
                    <span>{t("pricing_method_paypal")}</span>
                  </Button>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setDialogOpen(false)}
                  >
                    {t("common_close")}
                  </Button>
                </DialogFooter>
              </>
            )}
            {dialogStep === "processing" && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  {t("pricing_processing_payment")}
                </p>
              </div>
            )}
            {dialogStep === "success" && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <p className="text-sm text-muted-foreground text-center">
                  {t("pricing_success_redirect")}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
