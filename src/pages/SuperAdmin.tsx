import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Search, MoreVertical, Users, Activity, DollarSign, LineChart } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Line,
  LineChart as ReLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart as ReBarChart,
  Pie,
  PieChart as RePieChart,
  Cell,
} from "recharts";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_BASE } from "@/config";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string | null;
};

type SuperAdminMetrics = {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  activeChallenges: number;
};

type SuperAdminCharts = {
  monthlyRevenue: { label: string; value: number }[];
  userSignups: { label: string; value: number }[];
  challengeStatusDistribution: { status: string; value: number }[];
};

type SuperAdminStats = {
  metrics: SuperAdminMetrics;
  charts: SuperAdminCharts;
};

const SUPER_ADMIN_EMAIL = "yassine.blog1@gmail.com";

const revenueChartConfig: ChartConfig = {
  revenue: {
    label: "Revenus (DH)",
    color: "#10b981",
  },
};

const signupsChartConfig: ChartConfig = {
  value: {
    label: "Inscriptions",
    color: "#3b82f6",
  },
};

const statusChartConfig: ChartConfig = {
  active: {
    label: "Actif",
    color: "#3b82f6",
  },
  passed: {
    label: "Réussi",
    color: "#10b981",
  },
  failed: {
    label: "Échoué",
    color: "#ef4444",
  },
};

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "settings">("stats");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [loadingPaypal, setLoadingPaypal] = useState(false);
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/super-admin");
      return;
    }

    const verifyRole = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          navigate("/auth?redirect=/super-admin");
          return;
        }
        if (!response.ok) {
          navigate("/dashboard");
          return;
        }
        const data = await response.json();
        const user = data?.user as { name?: string; email?: string; role?: string } | undefined;
        if (
          !user ||
          typeof user.name !== "string" ||
          typeof user.email !== "string" ||
          typeof user.role !== "string"
        ) {
          navigate("/dashboard");
          return;
        }
        if (user.role !== "super_admin") {
          navigate("/dashboard");
          return;
        }
        setCurrentUser({ name: user.name, email: user.email });
      } catch {
        navigate("/dashboard");
      }
    };

    void verifyRole();
  }, [navigate]);

  useEffect(() => {
    if (activeTab !== "users") return;

    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/super-admin");
      return;
    }

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(`${API_BASE}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          navigate("/auth?redirect=/super-admin");
          return;
        }
        if (response.status === 403) {
          navigate("/dashboard");
          return;
        }
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { users?: AdminUser[] };
        setUsers(Array.isArray(data.users) ? data.users : []);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [activeTab, navigate]);

  useEffect(() => {
    if (activeTab !== "stats") return;

    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/super-admin");
      return;
    }

    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const response = await fetch(`${API_BASE}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          navigate("/auth?redirect=/super-admin");
          return;
        }
        if (response.status === 403) {
          navigate("/dashboard");
          return;
        }
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as SuperAdminStats;
        setStats(data);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [activeTab, navigate]);

  useEffect(() => {
    if (activeTab !== "settings") return;

    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/super-admin");
      return;
    }

    const loadPaypal = async () => {
      setLoadingPaypal(true);
      try {
        const response = await fetch(`${API_BASE}/api/admin/paypal-config`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          navigate("/auth?redirect=/super-admin");
          return;
        }
        if (response.status === 403) {
          navigate("/dashboard");
          return;
        }
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const config = data?.config;
        if (config) {
          setPaypalClientId(config.clientId || "");
          setPaypalClientSecret("");
        }
      } finally {
        setLoadingPaypal(false);
      }
    };

    loadPaypal();
  }, [activeTab, navigate]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const totalUsers = users.length;

  const renderRoleBadge = (role: string) => {
    const normalized = role.toLowerCase();
    if (normalized === "super_admin") {
      return (
        <div className="inline-flex flex-wrap gap-1">
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-medium text-emerald-300">
            Admin
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-500/20 px-3 py-0.5 text-xs font-medium text-purple-200">
            Super Admin
          </span>
        </div>
      );
    }
    if (normalized === "moderator" || normalized === "mod") {
      return (
        <span className="inline-flex items-center rounded-full bg-sky-500/15 px-3 py-0.5 text-xs font-medium text-sky-300">
          Modérateur
        </span>
      );
    }
    if (normalized === "admin") {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-medium text-emerald-300">
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-slate-500/20 px-3 py-0.5 text-xs font-medium text-slate-200">
        Utilisateur
      </span>
    );
  };

  const handleChangeUserRole = async (userId: number, role: "user" | "admin" | "super_admin") => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/super-admin");
      return;
    }

    setUpdatingRoleId(userId);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          role,
        }),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        navigate("/auth?redirect=/super-admin");
        return;
      }
      if (response.status === 403) {
        navigate("/dashboard");
        return;
      }
      if (!response.ok) {
        const message =
          data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
            ? (data as { message: string }).message
            : "Impossible de mettre à jour le rôle de l'utilisateur.";
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
        return;
      }
      const updated = data && typeof data === "object" && "user" in data ? (data as { user: AdminUser }).user : null;
      if (updated && typeof updated === "object" && "id" in updated && typeof updated.id === "number") {
        setUsers((previous) =>
          previous.map((user) =>
            user.id === updated.id ? { ...user, role: updated.role } : user,
          ),
        );
        toast({
          title: "Rôle mis à jour",
          description: "Le rôle de l'utilisateur a été mis à jour.",
        });
      }
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleConnectPaypal = async () => {
    const trimmedClientId = paypalClientId.trim();
    const trimmedSecret = paypalClientSecret.trim();
    if (!trimmedClientId || !trimmedSecret) {
      toast({
        title: "Erreur",
        description: "Client ID et Client Secret sont requis.",
        variant: "destructive",
      });
      return;
    }

    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/super-admin");
      return;
    }

    setSavingPaypal(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/paypal-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: trimmedClientId,
          clientSecret: trimmedSecret,
          mode: "sandbox",
        }),
      });
      if (response.status === 401) {
        navigate("/auth?redirect=/super-admin");
        return;
      }
      if (response.status === 403) {
        navigate("/dashboard");
        return;
      }
      if (!response.ok) {
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer la configuration PayPal.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "PayPal connecté",
        description: "La configuration PayPal a été enregistrée.",
      });
      setPaypalClientSecret("");
    } finally {
      setSavingPaypal(false);
    }
  };

  const handleOpenPaypalDocs = () => {
    if (typeof window !== "undefined") {
      window.open("https://developer.paypal.com/dashboard/applications", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center mb-10"
          >
            <Badge className="mb-4 bg-amber-500/15 text-amber-200 border border-amber-400/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-300" />
              <span>Super Admin</span>
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-slate-50 mb-3">
              Espace de Super Administration
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Configuration et intégrations de la plateforme
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex justify-start"
          >
            <Tabs
              className="w-full"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "stats" | "users" | "settings")
              }
            >
              <TabsList className="bg-slate-900/80 border border-slate-700/60 rounded-full px-1 py-1 h-auto">
                <TabsTrigger
                  value="stats"
                  className="rounded-full px-5 py-2 text-xs md:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_30px_rgba(16,185,129,0.65)]"
                >
                  Statistiques
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="rounded-full px-5 py-2 text-xs md:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_30px_rgba(16,185,129,0.65)]"
                >
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-full px-5 py-2 text-xs md:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_0_30px_rgba(16,185,129,0.65)]"
                >
                  Paramètres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="mt-8 space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-slate-900 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">
                          Total Utilisateurs
                        </span>
                        <div className="rounded-full bg-emerald-500/20 p-2">
                          <Users className="h-4 w-4 text-emerald-300" />
                        </div>
                      </div>
                      <div className="text-2xl font-mono font-semibold text-emerald-50">
                        {loadingStats || !stats ? "…" : stats.metrics.totalUsers}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/80 border-slate-800/80">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Utilisateurs Actifs
                        </span>
                        <div className="rounded-full bg-emerald-500/15 p-2">
                          <Activity className="h-4 w-4 text-emerald-300" />
                        </div>
                      </div>
                      <div className="text-2xl font-mono font-semibold text-slate-50">
                        {loadingStats || !stats ? "…" : stats.metrics.activeUsers}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-slate-900 border-amber-500/40">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-amber-100/90">
                          Revenu Total
                        </span>
                        <div className="rounded-full bg-amber-500/20 p-2">
                          <DollarSign className="h-4 w-4 text-amber-200" />
                        </div>
                      </div>
                      <div className="text-2xl font-mono font-semibold text-amber-50">
                        {loadingStats || !stats
                          ? "…"
                          : `${stats.metrics.totalRevenue.toFixed(0)} DH`}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/80 border-slate-800/80">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Challenges Actifs
                        </span>
                        <div className="rounded-full bg-cyan-500/15 p-2">
                          <LineChart className="h-4 w-4 text-cyan-300" />
                        </div>
                      </div>
                      <div className="text-2xl font-mono font-semibold text-slate-50">
                        {loadingStats || !stats ? "…" : stats.metrics.activeChallenges}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card variant="glass" className="border-slate-700/60 bg-slate-900/70">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-50">
                        Revenus Mensuels
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Evolution des revenus générés par la plateforme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingStats || !stats ? (
                        <div className="h-52 flex items-center justify-center text-sm text-slate-400">
                          Chargement des statistiques…
                        </div>
                      ) : (
                        <ChartContainer
                          config={revenueChartConfig}
                          className="h-52 w-full"
                        >
                          <ReLineChart data={stats.charts.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                            <XAxis
                              dataKey="label"
                              stroke="#64748b"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#64748b"
                              tickLine={false}
                              axisLine={false}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              cursor={{ stroke: "rgba(148,163,184,0.3)" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="var(--color-revenue)"
                              strokeWidth={2.5}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </ReLineChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card variant="glass" className="border-slate-700/60 bg-slate-900/70">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-50">
                        Inscriptions Utilisateurs
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Nombre de nouveaux comptes créés par mois.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingStats || !stats ? (
                        <div className="h-52 flex items-center justify-center text-sm text-slate-400">
                          Chargement des statistiques…
                        </div>
                      ) : (
                        <ChartContainer
                          config={signupsChartConfig}
                          className="h-52 w-full"
                        >
                          <ReBarChart data={stats.charts.userSignups}>
                            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.15)" />
                            <XAxis
                              dataKey="label"
                              stroke="#64748b"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#64748b"
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                              dataKey="value"
                              fill="var(--color-signups)"
                              radius={[6, 6, 0, 0]}
                            />
                          </ReBarChart>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card variant="glass" className="border-slate-700/60 bg-slate-900/70">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-50">
                      Distribution des Statuts de Challenge
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Répartition globale des challenges actifs, réussis et échoués.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-center gap-6">
                    {loadingStats || !stats ? (
                      <div className="h-48 flex-1 flex items-center justify-center text-sm text-slate-400">
                        Chargement des statistiques…
                      </div>
                    ) : (
                      <>
                        <ChartContainer
                          config={statusChartConfig}
                          className="h-48 w-full md:w-1/2"
                        >
                          <RePieChart>
                            <Pie
                              data={stats.charts.challengeStatusDistribution}
                              dataKey="value"
                              nameKey="status"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={8}
                            >
                              {stats.charts.challengeStatusDistribution.map((entry) => (
                                <Cell
                                  key={entry.status}
                                  fill={`var(--color-${entry.status})`}
                                />
                              ))}
                            </Pie>
                          </RePieChart>
                        </ChartContainer>
                        <div className="flex-1 space-y-2 text-sm">
                          {stats.charts.challengeStatusDistribution.map((entry) => {
                            const total = stats.charts.challengeStatusDistribution.reduce(
                              (sum, item) => sum + item.value,
                              0,
                            );
                            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                            const label =
                              entry.status === "ACTIVE"
                                ? "Actif"
                                : entry.status === "SUCCESS"
                                ? "Réussi"
                                : "Échoué";
                            return (
                              <div
                                key={entry.status}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                      backgroundColor: `var(--color-${entry.status})`,
                                    }}
                                  />
                                  <span className="text-slate-200">{label}</span>
                                </div>
                                <span className="font-mono text-slate-100">
                                  {pct} %
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="mt-8">
                <Card variant="glass" className="border-slate-700/60 bg-slate-900/70">
                  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-lg text-slate-50">
                        Gestion des Utilisateurs
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Supervision globale des comptes et rôles des utilisateurs.
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Total utilisateurs
                      </span>
                      <span className="text-2xl font-mono font-semibold text-emerald-400">
                        {loadingUsers ? "…" : totalUsers}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Rechercher des utilisateurs…"
                        className="pl-9 bg-slate-900/80 border-slate-700 text-sm placeholder:text-slate-500"
                      />
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-800 bg-slate-950/40">
                            <TableHead className="text-xs text-slate-400">Nom</TableHead>
                            <TableHead className="text-xs text-slate-400">Email</TableHead>
                            <TableHead className="text-xs text-slate-400">Rôle</TableHead>
                            <TableHead className="text-xs text-slate-400">
                              Inscrit le
                            </TableHead>
                            <TableHead className="text-xs text-slate-400 text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingUsers && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="py-8 text-center text-sm text-slate-400"
                              >
                                Chargement des utilisateurs…
                              </TableCell>
                            </TableRow>
                          )}
                          {!loadingUsers && filteredUsers.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="py-8 text-center text-sm text-slate-400"
                              >
                                Aucun utilisateur trouvé.
                              </TableCell>
                            </TableRow>
                          )}
                          {!loadingUsers &&
                            filteredUsers.map((user) => (
                              <TableRow
                                key={user.id}
                                className="border-slate-800/80 hover:bg-slate-900/70"
                              >
                                <TableCell className="py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-100">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-slate-100">
                                      {user.name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 text-sm text-slate-300">
                                  {user.email}
                                </TableCell>
                                <TableCell className="py-3">
                                  {renderRoleBadge(user.role)}
                                </TableCell>
                                <TableCell className="py-3 text-sm text-slate-400">
                                  {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                      })
                                    : "-"}
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
                                        disabled={updatingRoleId === user.id}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[190px]">
                                      <DropdownMenuItem
                                        disabled={user.role === "user"}
                                        onClick={() => handleChangeUserRole(user.id, "user")}
                                      >
                                        Rendre Utilisateur
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        disabled={user.role === "admin"}
                                        onClick={() => handleChangeUserRole(user.id, "admin")}
                                      >
                                        Rendre Admin
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        disabled={
                                          user.email.toLowerCase() ===
                                          SUPER_ADMIN_EMAIL.toLowerCase()
                                        }
                                        onClick={() =>
                                          handleChangeUserRole(user.id, "super_admin")
                                        }
                                      >
                                        Rendre Super Admin
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card variant="glass" className="border-slate-700/60 bg-slate-900/70">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-50">
                        Intégration PayPal
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Connectez votre compte PayPal Business pour recevoir les paiements.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          Client ID
                        </label>
                        <Input
                          type="text"
                          placeholder="Entrez votre PayPal Client ID"
                          className="bg-slate-900/80 border-slate-700 text-sm placeholder:text-slate-500"
                          value={paypalClientId}
                          onChange={(event) => setPaypalClientId(event.target.value)}
                          disabled={loadingPaypal || savingPaypal}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          Client Secret
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••••••••••••••"
                          className="bg-slate-900/80 border-slate-700 text-sm tracking-widest"
                          value={paypalClientSecret}
                          onChange={(event) => setPaypalClientSecret(event.target.value)}
                          disabled={loadingPaypal || savingPaypal}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          type="button"
                          variant="success"
                          className="px-5"
                          onClick={handleConnectPaypal}
                          disabled={savingPaypal || loadingPaypal}
                        >
                          Connecter PayPal
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-amber-400/60 text-amber-200 hover:bg-amber-500/10 hover:border-amber-400"
                          onClick={handleOpenPaypalDocs}
                        >
                          Obtenir les identifiants PayPal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="glass" className="border-slate-700/60 bg-slate-900/70">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-50">
                        Paramètres Plateforme
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Configuration générale de la plateforme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 flex items-center justify-center text-sm text-slate-400 text-center">
                        Additional platform settings coming soon…
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperAdmin;
