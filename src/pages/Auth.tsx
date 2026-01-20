import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_BASE } from "@/config";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            fieldErrors[issue.path[0]] = issue.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }
      } else {
        const result = registerSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            fieldErrors[issue.path[0]] = issue.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }
      }

      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          (data && (data.message as string)) || t("auth_error_auth_failed");
        toast({
          title: t("pricing_error_title"),
          description: message,
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      const token = data.token as string | undefined;
      const user = data.user as { name?: string; email?: string } | undefined;

      if (token && user) {
        localStorage.setItem("ts_token", token);
        localStorage.setItem(
          "ts_user",
          JSON.stringify({
            name: user.name || "",
            email: user.email || "",
          })
        );
      }

      toast({
        title: isLogin
          ? t("auth_toast_login_success_title")
          : t("auth_toast_register_success_title"),
        description: isLogin
          ? t("auth_toast_login_success_desc")
          : t("auth_toast_register_success_desc"),
      });

      const redirectTo = searchParams.get("redirect") || "/challenges";
      navigate(redirectTo);
    } catch (error) {
      toast({
        title: t("pricing_error_title"),
        description: t("auth_error_generic"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute inset-0 trading-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth_back_to_home")}
        </Link>

        <Card variant="glass">
          <CardHeader className="text-center">
            <Link to="/" className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold">
                TradeSense AI
              </span>
            </Link>
            <CardTitle className="text-2xl">
              {isLogin ? t("auth_title_login") : t("auth_title_register")}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? t("auth_subtitle_login")
                : t("auth_subtitle_register")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t("auth_label_full_name")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder={t("auth_placeholder_full_name")}
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-loss">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth_label_email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth_placeholder_email")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-loss">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth_label_password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-loss">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("auth_label_confirm_password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-loss">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isLogin
                      ? t("auth_button_signing_in")
                      : t("auth_button_creating_account")}
                  </>
                ) : isLogin ? (
                  t("auth_button_sign_in")
                ) : (
                  t("auth_button_create_account")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {isLogin ? (
                <p className="text-muted-foreground">
                  {t("auth_toggle_no_account_prefix")}{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-primary font-medium hover:underline"
                  >
                    {t("auth_toggle_no_account_action")}
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {t("auth_toggle_have_account_prefix")}{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-primary font-medium hover:underline"
                  >
                    {t("auth_toggle_have_account_action")}
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
