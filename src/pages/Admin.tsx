import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

type AdminRow = {
  userId: number;
  name: string;
  email: string;
  balance: number;
  startingBalance: number;
  status: "ACTIVE" | "SUCCESSFUL" | "FAILED";
  dailyPnlPct: number;
  dailyTimer: string;
};

const API_BASE =
  typeof window !== "undefined" && window.location.port === "8080" ? "http://localhost:5000" : "";

const Admin = () => {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Record<number, AdminRow["status"]>>({});
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/admin");
      return;
    }
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/admin/challenges`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          navigate("/auth?redirect=/admin");
          return;
        }
        if (response.status === 403) {
          navigate("/");
          return;
        }
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = (await response.json()) as { rows?: AdminRow[] };
        const safeRows = Array.isArray(data.rows) ? data.rows : [];
        setRows(safeRows);
        const initialStatus: Record<number, AdminRow["status"]> = {};
        safeRows.forEach((row) => {
          initialStatus[row.userId] = row.status;
        });
        setSelectedStatus(initialStatus);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleStatusChange = (userId: number, status: AdminRow["status"]) => {
    setSelectedStatus((prev) => ({ ...prev, [userId]: status }));
  };

  const handleUpdate = async (userId: number) => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/admin");
      return;
    }
    const status = selectedStatus[userId];
    if (!status) return;
    setUpdatingId(userId);
    try {
      const response = await fetch(`${API_BASE}/api/admin/challenges/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, status }),
      });
      if (response.status === 401) {
        navigate("/auth?redirect=/admin");
        return;
      }
      if (response.status === 403) {
        navigate("/");
        return;
      }
      if (!response.ok) {
        return;
      }
      setRows((prev) =>
        prev.map((row) =>
          row.userId === userId
            ? {
                ...row,
                status,
              }
            : row,
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 container mx-auto px-4 pb-8">
        <Card className="p-4 bg-card/80 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">
              {t("admin_title")}
            </h1>
            <div className="text-xs text-muted-foreground">
              {loading ? t("dashboard_loading") : `${rows.length} ${t("admin_users_suffix")}`}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin_col_id")}</TableHead>
                  <TableHead>{t("admin_col_name")}</TableHead>
                  <TableHead>{t("admin_col_email")}</TableHead>
                  <TableHead>{t("admin_col_virtual_balance")}</TableHead>
                  <TableHead>{t("admin_col_starting_balance")}</TableHead>
                  <TableHead>{t("admin_col_daily_pnl")}</TableHead>
                  <TableHead>{t("admin_col_daily_timer")}</TableHead>
                  <TableHead>{t("admin_col_status")}</TableHead>
                  <TableHead>{t("admin_col_override")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.userId}>
                    <TableCell>{row.userId}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>${row.balance.toFixed(2)}</TableCell>
                    <TableCell>${row.startingBalance.toFixed(2)}</TableCell>
                    <TableCell>{row.dailyPnlPct.toFixed(2)}%</TableCell>
                    <TableCell>{row.dailyTimer}</TableCell>
                    <TableCell>
                      <span
                        className={
                          row.status === "ACTIVE"
                            ? "inline-flex rounded-full px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400"
                            : row.status === "SUCCESSFUL"
                            ? "inline-flex rounded-full px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400"
                            : "inline-flex rounded-full px-2 py-0.5 text-xs bg-red-500/20 text-red-400"
                        }
                      >
                        {row.status === "ACTIVE"
                          ? t("admin_status_active")
                          : row.status === "SUCCESSFUL"
                          ? t("admin_status_successful")
                          : t("admin_status_failed")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedStatus[row.userId] ?? row.status}
                          onValueChange={(value) =>
                            handleStatusChange(row.userId, value as AdminRow["status"])
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">{t("admin_status_active")}</SelectItem>
                            <SelectItem value="SUCCESSFUL">
                              {t("admin_status_successful")}
                            </SelectItem>
                            <SelectItem value="FAILED">{t("admin_status_failed")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === row.userId}
                          onClick={() => handleUpdate(row.userId)}
                        >
                          {updatingId === row.userId
                            ? t("admin_button_saving")
                            : t("admin_button_update")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                      {t("admin_no_users")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
