import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Menu,
  X,
  User,
  ChevronDown,
  LayoutDashboard,
  Shield,
  Crown,
  LogOut,
  Home,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_BASE } from "@/config";

interface NavbarProps {
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storedUser, setStoredUser] = useState<{ name: string; email: string } | null>(null);
  const [hasActiveChallenge, setHasActiveChallenge] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("ts_user") : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.name === "string" && typeof parsed.email === "string") {
        setStoredUser({ name: parsed.name, email: parsed.email });
      }
    } catch {
      setStoredUser(null);
    }
  }, []);

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
        // Allow access to dashboard if challenge exists, regardless of status
        if (data && data.challenge) {
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

  const effectiveUser = user || storedUser;
  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const isSuperAdmin = userRole === "super_admin";

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token =
          typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
        if (!token) {
          setUserRole("user");
          return;
        }
        const response = await fetch(`${API_BASE}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          setUserRole("user");
          return;
        }
        const data = await response.json();
        const role =
          data && data.user && typeof data.user.role === "string" ? data.user.role : "user";
        setUserRole(role);
      } catch {
        setUserRole("user");
      }
    };
    fetchRole();
  }, [API_BASE]);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ts_token");
      window.localStorage.removeItem("ts_user");
      window.location.href = "/";
    }
  };

  const navLinks = [
    { href: "/", labelKey: "nav_home" as const, icon: Home },
    { href: "/challenges", labelKey: "nav_challenges" as const, icon: Target },
    { href: "/leaderboard", labelKey: "nav_leaderboard" as const, icon: Trophy },
    { href: "/community", labelKey: "nav_community" as const, icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(199,89%,48%)] flex items-center justify-center glow-effect group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="gradient-text">Trade</span>
              <span className="text-foreground">Sense</span>
              <span className="gradient-text-gold"> AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-[0.95rem] md:text-base font-medium transition-colors hover:text-primary ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.labelKey === "nav_leaderboard" ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span>{t(link.labelKey)}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {effectiveUser ? (
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
                    >
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{effectiveUser.name}</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    {hasActiveChallenge && (
                      <DropdownMenuItem
                        onSelect={() => {
                          navigate("/dashboard");
                        }}
                      >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{t("nav_dashboard")}</span>
                    </span>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem
                        onSelect={() => {
                          navigate("/admin");
                        }}
                      >
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </span>
                      </DropdownMenuItem>
                    )}
                    {isSuperAdmin && (
                      <DropdownMenuItem
                        onSelect={() => {
                          navigate("/superadmin");
                        }}
                      >
                    <span className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      <span>Super Admin</span>
                    </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleLogoutClick();
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>{t("nav_logout")}</span>
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    {t("nav_login")}
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button variant="hero" size="sm">
                    {t("nav_start_trading")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 glass-card overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-[0.95rem] font-medium transition-colors hover:text-primary ${
                      isActive(link.href)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {link.labelKey === "nav_leaderboard" ? (
                        <Trophy className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      <span>{t(link.labelKey)}</span>
                    </span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {effectiveUser ? (
                  <>
                    {hasActiveChallenge && (
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full">
                          <span className="flex items-center gap-2 justify-center">
                            <LayoutDashboard className="h-4 w-4" />
                            <span>{t("nav_dashboard")}</span>
                          </span>
                        </Button>
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full">
                          <span className="flex items-center gap-2 justify-center">
                            <Shield className="h-4 w-4" />
                            <span>Admin</span>
                          </span>
                        </Button>
                      </Link>
                    )}
                    {isSuperAdmin && (
                      <Link to="/superadmin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full">
                          <span className="flex items-center gap-2 justify-center">
                            <Crown className="h-4 w-4" />
                            <span>Super Admin</span>
                          </span>
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={handleLogoutClick}>
                      <span className="flex items-center gap-2 justify-center">
                        <LogOut className="h-4 w-4" />
                        <span>{t("nav_logout")}</span>
                      </span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        {t("nav_login")}
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="hero" size="sm" className="w-full">
                        {t("nav_start_trading")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
