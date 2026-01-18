import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Users } from "lucide-react";

const API_BASE =
  typeof window !== "undefined" && window.location.port === "8080"
    ? "http://localhost:5000"
    : "";

type ChatMessage = {
  id: number;
  userId: number | null;
  userName: string;
  content: string;
  createdAt: string | null;
};

const Community = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/community");
      return;
    }

    try {
      const raw =
        typeof window !== "undefined" ? window.localStorage.getItem("ts_user") : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string; email?: string };
        if (parsed && typeof parsed.name === "string" && typeof parsed.email === "string") {
          setCurrentUser({ name: parsed.name, email: parsed.email });
        }
      }
    } catch {
      setCurrentUser(null);
    }

    let isMounted = true;

    const loadMessages = async () => {
      const authToken =
        typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
      if (!authToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        navigate("/auth?redirect=/community");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/community/messages`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.status === 401) {
          navigate("/auth?redirect=/community");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await response.json();
        if (isMounted && data && Array.isArray(data.messages)) {
          setMessages(data.messages as ChatMessage[]);
        }
      } catch {
        if (isMounted) {
          toast({
            title: t("pricing_error_title"),
            description: t("community_error_load"),
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();
    const intervalId = window.setInterval(loadMessages, 3000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [navigate, t]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) {
      return;
    }

    const token = typeof window !== "undefined" ? window.localStorage.getItem("ts_token") : null;
    if (!token) {
      navigate("/auth?redirect=/community");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${API_BASE}/api/community/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });

      if (response.status === 401) {
        navigate("/auth?redirect=/community");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      if (data && data.message) {
        setMessages((prev) => [...prev, data.message as ChatMessage]);
      }
      setNewMessage("");
    } catch {
      toast({
        title: t("pricing_error_title"),
        description: t("community_error_send"),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("community_badge_label")}
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              {t("community_title")}{" "}
              <span className="text-primary">{t("community_title_highlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("community_subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Community Chat</span>
                </CardTitle>
                {currentUser && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{currentUser.name}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex flex-col h-[520px] space-y-4">
                <ScrollArea className="flex-1 rounded-xl border border-border/60 bg-background/60 p-4">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      {t("community_loading")}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      {t("community_empty")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isOwn =
                          currentUser && message.userName === currentUser.name;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary/60 text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 mb-1">
                                <span className="font-semibold text-xs opacity-80">
                                  {message.userName || "Trader"}
                                </span>
                                {message.createdAt && (
                                  <span className="text-[10px] opacity-80">
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="flex items-center gap-3 pt-1">
                  <Input
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("community_input_placeholder")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || !newMessage.trim()}
                    className="inline-flex items-center gap-1"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{t("community_send")}</span>
                  </Button>
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

export default Community;

