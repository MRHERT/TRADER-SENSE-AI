import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "fr" | "ar";

type Dictionary = Record<string, { en: string; fr: string; ar: string }>;

const messages: Dictionary = {
  nav_home: {
    en: "Home",
    fr: "Accueil",
    ar: "الرئيسية",
  },
  nav_challenges: {
    en: "Pricing",
    fr: "Pricing",
    ar: "الأسعار",
  },
  nav_leaderboard: {
    en: "Leaderboard",
    fr: "Classement",
    ar: "الترتيب",
  },
  nav_community: {
    en: "Community",
    fr: "Communauté",
    ar: "المجتمع",
  },
  nav_login: {
    en: "Login",
    fr: "Connexion",
    ar: "تسجيل الدخول",
  },
  nav_start_trading: {
    en: "Start Trading",
    fr: "Commencer à trader",
    ar: "ابدأ التداول",
  },
  nav_dashboard: {
    en: "Dashboard",
    fr: "Tableau de bord",
    ar: "لوحة التحكم",
  },
  nav_logout: {
    en: "Logout",
    fr: "Déconnexion",
    ar: "تسجيل الخروج",
  },
  hero_badge: {
    en: "Now accepting new traders",
    fr: "Nous acceptons de nouveaux traders",
    ar: "نستقبل متداولين جدد الآن",
  },
  hero_title_main: {
    en: "Trade Smarter with",
    fr: "Tradez plus intelligemment avec",
    ar: "تداول بذكاء مع",
  },
  hero_title_highlight: {
    en: "AI-Powered",
    fr: "Inteligence artificielle",
    ar: "المدعوم بالذكاء الاصطناعي",
  },
  hero_title_suffix: {
    en: "Insights",
    fr: "Insights",
    ar: "ورؤى ذكية",
  },
  hero_subtitle: {
    en: "Prove your trading skills and get funded up to $50,000. Real market data, professional tools, and AI signals to help you succeed.",
    fr: "Prouvez vos compétences de trading et obtenez un capital jusqu'à 50 000 $. Données de marché en temps réel, outils professionnels et signaux d'IA pour vous aider à réussir.",
    ar: "أثبت مهاراتك في التداول واحصل على تمويل يصل إلى 50,000 دولار. بيانات سوق حقيقية، أدوات احترافية وإشارات ذكاء اصطناعي لمساعدتك على النجاح.",
  },
  hero_cta_start: {
    en: "Start Trading Challenge",
    fr: "Commencer le challenge de trading",
    ar: "ابدأ تحدي التداول",
  },
  hero_cta_leaderboard: {
    en: "View Leaderboard",
    fr: "Voir le classement",
    ar: "عرض قائمة المتصدرين",
  },
  hero_stats_funded: {
    en: "Funded to Traders",
    fr: "Capital versé aux traders",
    ar: "رأس المال الممول للمتداولين",
  },
  hero_stats_traders: {
    en: "Active Traders",
    fr: "Traders actifs",
    ar: "متداولون نشطون",
  },
  hero_stats_passrate: {
    en: "Pass Rate",
    fr: "Taux de réussite",
    ar: "نسبة النجاح",
  },
  hero_stats_support: {
    en: "AI Support",
    fr: "Support IA",
    ar: "دعم بالذكاء الاصطناعي",
  },
  hero_why_title: {
    en: "Why Choose TradeSense AI?",
    fr: "Pourquoi choisir TradeSense AI ?",
    ar: "لماذا تختار TradeSense AI؟",
  },
  hero_feature_real_data_title: {
    en: "Real Market Data",
    fr: "Données de marché réelles",
    ar: "بيانات سوق حقيقية",
  },
  hero_feature_real_data_desc: {
    en: "Trade with live prices from global markets including US stocks, crypto, and more.",
    fr: "Tradez avec des prix en temps réel des marchés mondiaux, y compris actions US, crypto et plus.",
    ar: "تداول بأسعار حية من الأسواق العالمية بما فيها الأسهم الأمريكية والعملات الرقمية وغيرها.",
  },
  hero_feature_risk_title: {
    en: "Risk Management",
    fr: "Gestion du risque",
    ar: "إدارة المخاطر",
  },
  hero_feature_risk_desc: {
    en: "Automated rule checking ensures you stay within safe trading parameters.",
    fr: "Un contrôle automatisé des règles vous garantit de rester dans des paramètres sûrs.",
    ar: "التحقق الآلي من القواعد يضمن بقاءك ضمن حدود تداول آمنة.",
  },
  hero_feature_ai_title: {
    en: "AI Trading Signals",
    fr: "Signaux de trading IA",
    ar: "إشارات تداول بالذكاء الاصطناعي",
  },
  hero_feature_ai_desc: {
    en: "Get intelligent buy/sell recommendations powered by advanced algorithms.",
    fr: "Recevez des recommandations d'achat/vente intelligentes propulsées par des algorithmes avancés.",
    ar: "احصل على توصيات شراء وبيع ذكية مدعومة بخوارزميات متقدمة.",
  },
  hero_feature_charts_title: {
    en: "Professional Charts",
    fr: "Graphiques professionnels",
    ar: "رسوم بيانية احترافية",
  },
  hero_feature_charts_desc: {
    en: "TradingView-powered charts with all the tools professional traders need.",
    fr: "Graphiques propulsés par TradingView avec tous les outils nécessaires aux traders pros.",
    ar: "رسوم بيانية مدعومة بـ TradingView مع كل الأدوات التي يحتاجها المحترفون.",
  },
  challenges_title: {
    en: "Pricing",
    fr: "Pricing",
    ar: "الأسعار",
  },
  challenges_subtitle: {
    en: "Prove your trading skills with our prop trading challenges. Pass the evaluation and get funded to trade with real capital.",
    fr: "Prouvez vos compétences avec nos challenges de prop trading. Réussissez l'évaluation et obtenez un capital réel à trader.",
    ar: "أثبت مهاراتك من خلال تحديات التداول الخاصة بنا. اجتز التقييم واحصل على رأس مال حقيقي للتداول.",
  },
  challenges_rules_title: {
    en: "Challenge Rules",
    fr: "Règles du challenge",
    ar: "قواعد التحدي",
  },
  challenge_rule_profit_title: {
    en: "10% Profit Target",
    fr: "Objectif de profit 10 %",
    ar: "هدف ربح 10٪",
  },
  challenge_rule_profit_desc: {
    en: "Reach 10% profit on your starting balance to pass the challenge and get funded.",
    fr: "Atteignez 10 % de profit sur votre capital de départ pour réussir le challenge et être financé.",
    ar: "حقق ربحًا بنسبة 10٪ من رصيدك الابتدائي لاجتياز التحدي والحصول على التمويل.",
  },
  challenge_rule_daily_title: {
    en: "5% Daily Max Loss",
    fr: "Perte max quotidienne 5 %",
    ar: "حد الخسارة اليومي 5٪",
  },
  challenge_rule_daily_desc: {
    en: "Your daily losses cannot exceed 5% of your starting balance. Calculated at end of day.",
    fr: "Vos pertes quotidiennes ne peuvent pas dépasser 5 % de votre capital initial. Calculé en fin de journée.",
    ar: "لا يمكن أن تتجاوز خسائرك اليومية 5٪ من رصيدك الابتدائي. تُحسب في نهاية اليوم.",
  },
  challenge_rule_total_title: {
    en: "10% Total Max Loss",
    fr: "Perte max totale 10 %",
    ar: "حد الخسارة الكلي 10٪",
  },
  challenge_rule_total_desc: {
    en: "Your account equity cannot drop below 90% of starting balance at any time.",
    fr: "L'équité de votre compte ne peut jamais descendre sous 90 % du capital initial.",
    ar: "لا يجوز لقيمة حسابك أن تنخفض عن 90٪ من الرصيد الابتدائي في أي وقت.",
  },
  challenge_rule_period_title: {
    en: "Challenge Period",
    fr: "Durée du challenge",
    ar: "مدة التحدي",
  },
  challenge_rule_period_desc: {
    en: "Complete your challenge within the time limit based on your plan tier.",
    fr: "Terminez votre challenge dans le délai défini selon votre formule.",
    ar: "أكمل التحدي ضمن المهلة المحددة حسب خطتك.",
  },
  pricing_title: {
    en: "Choose Your Challenge",
    fr: "Choisissez votre challenge",
    ar: "اختر تحديك",
  },
  pricing_subtitle: {
    en: "Select the plan that matches your goals. Higher capital means greater potential earnings.",
    fr: "Sélectionnez la formule qui correspond à vos objectifs. Un capital plus élevé signifie un potentiel de gains plus important.",
    ar: "اختر الخطة التي تتوافق مع أهدافك. رأس مال أكبر يعني إمكانية أرباح أعلى.",
  },
  pricing_most_popular: {
    en: "MOST POPULAR",
    fr: "LE PLUS POPULAIRE",
    ar: "الأكثر شيوعاً",
  },
  pricing_start_button: {
    en: "Start Challenge",
    fr: "Commencer le challenge",
    ar: "ابدأ التحدي",
  },
  pricing_method_cmi: {
    en: "Pay with CMI",
    fr: "Payer avec CMI",
    ar: "الدفع عبر CMI",
  },
  pricing_method_crypto: {
    en: "Pay with Crypto",
    fr: "Payer avec Crypto",
    ar: "الدفع بالعملات الرقمية",
  },
  pricing_method_paypal: {
    en: "Pay with PayPal",
    fr: "Payer avec PayPal",
    ar: "الدفع عبر PayPal",
  },
  pricing_processing_cmi: {
    en: "Processing CMI...",
    fr: "Traitement CMI...",
    ar: "جاري معالجة CMI...",
  },
  pricing_processing_crypto: {
    en: "Processing Crypto...",
    fr: "Traitement Crypto...",
    ar: "جاري معالجة Crypto...",
  },
  pricing_processing_paypal: {
    en: "Processing PayPal...",
    fr: "Traitement PayPal...",
    ar: "جاري معالجة PayPal...",
  },
  pricing_processing_payment: {
    en: "Processing your payment...",
    fr: "Traitement de votre paiement...",
    ar: "جاري معالجة دفعتك...",
  },
  pricing_success_redirect: {
    en: "Payment successful! Redirecting to your dashboard...",
    fr: "Paiement réussi ! Redirection vers votre tableau de bord...",
    ar: "تم الدفع بنجاح! جارٍ تحويلك إلى لوحة التحكم...",
  },
  pricing_plan_starter_name: {
    en: "Starter",
    fr: "Starter",
    ar: "المبتدئ",
  },
  pricing_plan_starter_desc: {
    en: "Perfect for beginners testing their strategies",
    fr: "Parfait pour les débutants qui testent leurs stratégies",
    ar: "مثالي للمبتدئين الذين يختبرون استراتيجياتهم",
  },
  pricing_plan_pro_name: {
    en: "Pro",
    fr: "Pro",
    ar: "المحترف",
  },
  pricing_plan_pro_desc: {
    en: "For serious traders ready to prove themselves",
    fr: "Pour les traders sérieux prêts à faire leurs preuves",
    ar: "للمتداولين الجادين المستعدين لإثبات أنفسهم",
  },
  pricing_plan_elite_name: {
    en: "Elite",
    fr: "Elite",
    ar: "النخبة",
  },
  pricing_plan_elite_desc: {
    en: "Maximum funding for professional traders",
    fr: "Financement maximal pour les traders professionnels",
    ar: "أقصى تمويل للمتداولين المحترفين",
  },
  pricing_feature_starting_balance_5k: {
    en: "All plans: $5,000 virtual starting balance",
    fr: "Tous les plans : solde virtuel de départ de 5 000 $",
    ar: "جميع الخطط: رصيد افتراضي ابتدائي 5,000 دولار",
  },
  pricing_feature_funded_5k: {
    en: "Get funded with $5,000 after passing the challenge",
    fr: "Recevez un financement de 5 000 $ après avoir réussi le challenge",
    ar: "احصل على تمويل بقيمة 5,000 دولار بعد اجتياز التحدي",
  },
  pricing_feature_funded_25k: {
    en: "Get funded with $25,000 after passing the challenge",
    fr: "Recevez un financement de 25 000 $ après avoir réussi le challenge",
    ar: "احصل على تمويل بقيمة 25,000 دولار بعد اجتياز التحدي",
  },
  pricing_feature_funded_100k: {
    en: "Get funded with $100,000 after passing the challenge",
    fr: "Recevez un financement de 100 000 $ après avoir réussi le challenge",
    ar: "احصل على تمويل بقيمة 100,000 دولار بعد اجتياز التحدي",
  },
  pricing_feature_profit_target_10: {
    en: "10% Profit Target",
    fr: "Objectif de profit de 10 %",
    ar: "هدف ربح 10٪",
  },
  pricing_feature_profit_target_8: {
    en: "8% Profit Target",
    fr: "Objectif de profit de 8 %",
    ar: "هدف ربح 8٪",
  },
  pricing_feature_daily_loss_5: {
    en: "5% Daily Max Loss",
    fr: "Perte maximale quotidienne de 5 %",
    ar: "حد الخسارة اليومي 5٪",
  },
  pricing_feature_daily_loss_4: {
    en: "4% Daily Max Loss",
    fr: "Perte maximale quotidienne de 4 %",
    ar: "حد الخسارة اليومي 4٪",
  },
  pricing_feature_total_loss_10: {
    en: "10% Total Max Loss",
    fr: "Perte maximale totale de 10 %",
    ar: "حد الخسارة الكلي 10٪",
  },
  pricing_feature_challenge_period_30: {
    en: "30 Day Challenge Period",
    fr: "Période de challenge de 30 jours",
    ar: "فترة تحدي 30 يوماً",
  },
  pricing_feature_challenge_period_45: {
    en: "45 Day Challenge Period",
    fr: "Période de challenge de 45 jours",
    ar: "فترة تحدي 45 يوماً",
  },
  pricing_feature_challenge_period_60: {
    en: "60 Day Challenge Period",
    fr: "Période de challenge de 60 jours",
    ar: "فترة تحدي 60 يوماً",
  },
  pricing_feature_basic_analytics: {
    en: "Basic Analytics",
    fr: "Analyses basiques",
    ar: "تحليلات أساسية",
  },
  pricing_feature_advanced_analytics: {
    en: "Advanced Analytics",
    fr: "Analyses avancées",
    ar: "تحليلات متقدمة",
  },
  pricing_feature_premium_analytics: {
    en: "Premium Analytics",
    fr: "تحليلات مميزة",
    ar: "تحليلات مميزة",
  },
  pricing_feature_ai_signals: {
    en: "AI Trading Signals",
    fr: "Signaux de trading IA",
    ar: "إشارات تداول بالذكاء الاصطناعي",
  },
  pricing_feature_priority_support: {
    en: "Priority Support",
    fr: "Support prioritaire",
    ar: "دعم أولوية",
  },
  pricing_feature_email_support: {
    en: "Email Support",
    fr: "Support par e-mail",
    ar: "دعم عبر البريد الإلكتروني",
  },
  pricing_feature_priority_support_24_7: {
    en: "24/7 Priority Support",
    fr: "Support prioritaire 24/7",
    ar: "دعم أولوية على مدار الساعة",
  },
  pricing_feature_leaderboard_access: {
    en: "Leaderboard Access",
    fr: "Accès au classement",
    ar: "الوصول إلى لوحة المتصدرين",
  },
  pricing_feature_personal_manager: {
    en: "Personal Manager",
    fr: "Gestionnaire dédié",
    ar: "مدير شخصي",
  },
  pricing_feature_fast_withdrawals: {
    en: "Fast Withdrawals",
    fr: "Retraits rapides",
    ar: "سحوبات سريعة",
  },
  pricing_feature_elite_trader_badge: {
    en: "Elite Trader Badge",
    fr: "Insigne de trader élite",
    ar: "شارة متداول نخبة",
  },
  pricing_capital_label: {
    en: "Funding up to",
    fr: "Financement jusqu’à",
    ar: "تمويل حتى",
  },
  pricing_error_title: {
    en: "Error",
    fr: "Erreur",
    ar: "خطأ",
  },
  pricing_error_payment_failed: {
    en: "Payment failed.",
    fr: "Échec du paiement.",
    ar: "فشل الدفع.",
  },
  pricing_success_title: {
    en: "Payment successful",
    fr: "Paiement réussi",
    ar: "تم الدفع بنجاح",
  },
  pricing_success_description: {
    en: "Your challenge is active. Redirecting you to your dashboard.",
    fr: "Votre challenge est actif. Redirection vers votre tableau de bord.",
    ar: "تحديك نشط. جارٍ تحويلك إلى لوحة التحكم.",
  },
  pricing_error_network: {
    en: "Network error while processing challenge.",
    fr: "Erreur réseau lors du traitement du challenge.",
    ar: "حدث خطأ في الشبكة أثناء معالجة التحدي.",
  },
  challenge_status_title: {
    en: "Challenge Status",
    fr: "Statut du challenge",
    ar: "حالة التحدي",
  },
  challenge_status_passed: {
    en: "PASSED",
    fr: "RÉUSSI",
    ar: "ناجح",
  },
  challenge_status_failed: {
    en: "FAILED",
    fr: "ÉCHOUÉ",
    ar: "فاشل",
  },
  challenge_status_active: {
    en: "ACTIVE",
    fr: "ACTIF",
    ar: "نشط",
  },
  challenge_status_balance: {
    en: "Balance",
    fr: "Solde",
    ar: "الرصيد",
  },
  challenge_status_equity: {
    en: "Equity",
    fr: "Équité",
    ar: "القيمة",
  },
  challenge_status_today_pnl: {
    en: "Today's P&L",
    fr: "P&L du jour",
    ar: "الربح والخسارة اليوم",
  },
  challenge_status_profit_target: {
    en: "Profit Target",
    fr: "Objectif de profit",
    ar: "هدف الربح",
  },
  challenge_status_daily_loss_limit: {
    en: "Daily Loss Limit",
    fr: "Limite de perte quotidienne",
    ar: "حد الخسارة اليومي",
  },
  challenge_status_total_loss_limit: {
    en: "Total Loss Limit",
    fr: "Limite de perte totale",
    ar: "حد الخسارة الكلي",
  },
  ai_signal_strong_buy: {
    en: "Strong Buy Signal",
    fr: "Signal d'achat fort",
    ar: "إشارة شراء قوية",
  },
  ai_signal_sell: {
    en: "Sell Signal",
    fr: "Signal de vente",
    ar: "إشارة بيع",
  },
  ai_signal_hold: {
    en: "Hold Position",
    fr: "Conserver la position",
    ar: "الاحتفاظ بالمركز",
  },
  ai_signal_title: {
    en: "AI Trading Signal",
    fr: "Signal de trading IA",
    ar: "إشارة تداول بالذكاء الاصطناعي",
  },
  ai_signal_confidence: {
    en: "Confidence",
    fr: "Confiance",
    ar: "درجة الثقة",
  },
  ai_signal_analysis: {
    en: "Analysis",
    fr: "Analyse",
    ar: "التحليل",
  },
  ai_signal_disclaimer: {
    en: "AI signals are for reference only. Always perform your own analysis before trading.",
    fr: "Les signaux IA sont à titre indicatif. Effectuez toujours votre propre analyse avant de trader.",
    ar: "إشارات الذكاء الاصطناعي للمرجع فقط. قم دائماً بتحليلك الخاص قبل التداول.",
  },
  positions_title: {
    en: "Current Assets",
    fr: "Actifs actuels",
    ar: "الأصول الحالية",
  },
  positions_empty: {
    en: "No open positions",
    fr: "Aucune position ouverte",
    ar: "لا توجد صفقات مفتوحة",
  },
  ai_reason_not_enough_data: {
    en: "Not enough data for analysis.",
    fr: "Pas assez de données pour l'analyse.",
    ar: "لا توجد بيانات كافية للتحليل.",
  },
  ai_reason_golden_cross: {
    en: "Golden cross detected – bullish momentum building above key moving averages.",
    fr: "Croix dorée détectée – momentum haussier au-dessus des moyennes mobiles clés.",
    ar: "تم رصد تقاطع ذهبي – زخم صعودي فوق المتوسطات المتحركة الرئيسية.",
  },
  ai_reason_death_cross: {
    en: "Death cross detected – bearish momentum forming. Consider reducing exposure.",
    fr: "Croix de la mort détectée – momentum baissier en formation. Envisagez de réduire votre exposition.",
    ar: "تم رصد تقاطع هابط – زخم هبوطي يتكوّن. فكّر في تقليل التعرض.",
  },
  ai_reason_bull_trend: {
    en: "Uptrend in progress – price trades above short and long-term averages.",
    fr: "Tendance haussière en cours – le prix est au-dessus des moyennes court et long terme.",
    ar: "اتجاه صعودي مستمر – السعر يتداول فوق المتوسطات القصيرة والطويلة الأجل.",
  },
  ai_reason_bear_trend: {
    en: "Downtrend in progress – price trades below key averages. Watch for reversals.",
    fr: "Tendance baissière en cours – le prix est sous les moyennes clés. Surveillez les retournements.",
    ar: "اتجاه هبوطي مستمر – السعر يتداول تحت المتوسطات الرئيسية. راقب إشارات الانعكاس.",
  },
  ai_reason_consolidation: {
    en: "Market is consolidating – no clear direction. Wait for a breakout.",
    fr: "Le marché consolide – pas de direction claire. Attendez une cassure.",
    ar: "السوق في حالة تجميع – لا اتجاه واضح. انتظر حدوث اختراق.",
  },
  dashboard_ai_initial_reason: {
    en: "Analyzing market data...",
    fr: "Analyse des données de marché...",
    ar: "جاري تحليل بيانات السوق...",
  },
  ai_signal_rsi_oversold: {
    en: "RSI is in oversold territory (<30), indicating a potential rebound.",
    fr: "Le RSI est en zone de survente (<30), indiquant un rebond potentiel.",
    ar: "مؤشر RSI في منطقة تشبع البيع (<30)، مما يشير إلى ارتداد محتمل."
  },
  ai_signal_rsi_overbought: {
    en: "RSI is in overbought territory (>70), indicating a potential correction.",
    fr: "Le RSI est en zone de surachat (>70), indiquant une correction potentielle.",
    ar: "مؤشر RSI في منطقة تشبع الشراء (>70)، مما يشير إلى تصحيح محتمل."
  },
  ai_signal_rsi_neutral: {
    en: "Market conditions are neutral. No clear trend detected.",
    fr: "Les conditions de marché sont neutres. Aucune tendance claire détectée.",
    ar: "ظروف السوق محايدة. لم يتم الكشف عن اتجاه واضح."
  },
  ai_signal_insufficient_data: {
    en: "Insufficient historical data for analysis.",
    fr: "Données historiques insuffisantes pour l'analyse.",
    ar: "بيانات تاريخية غير كافية للتحليل."
  },
  ai_signal_hold_reason: {
    en: "Consolidating market structure. Wait for breakout.",
    fr: "Structure de marché en consolidation. Attendez la cassure.",
    ar: "هيكل السوق في مرحلة تماسك. انتظر الاختراق."
  },
  ai_signal_error_fallback: {
    en: "AI analysis unavailable. Holding position recommended.",
    fr: "Analyse IA indisponible. Maintien de la position recommandé.",
    ar: "تحليل الذكاء الاصطناعي غير متوفر. يوصى بالاحتفاظ بالمركز."
  },
  trade_title: {
    en: "Trade",
    fr: "Trader",
    ar: "تداول",
  },
  trade_mode_spot: {
    en: "Spot",
    fr: "Spot",
    ar: "فوري",
  },
  trade_type_limit: {
    en: "Limit",
    fr: "Limite",
    ar: "أمر محدد",
  },
  trade_type_market: {
    en: "Market",
    fr: "Marché",
    ar: "أمر سوق",
  },
  trade_type_stop_limit: {
    en: "Stop Limit",
    fr: "Stop limite",
    ar: "إيقاف وحد",
  },
  trade_label_price: {
    en: "Price",
    fr: "Prix",
    ar: "السعر",
  },
  trade_label_amount: {
    en: "Amount",
    fr: "Montant",
    ar: "الكمية",
  },
  trade_label_total: {
    en: "Total",
    fr: "Total",
    ar: "الإجمالي",
  },
  trade_label_minimum: {
    en: "Minimum",
    fr: "Minimum",
    ar: "الحد الأدنى",
  },
  trade_label_available_short: {
    en: "Avail.",
    fr: "Dispo.",
    ar: "متاح",
  },
  trade_label_stop_price: {
    en: "Stop Price",
    fr: "Prix stop",
    ar: "سعر الإيقاف",
  },
  trade_current_price: {
    en: "Current Price",
    fr: "Prix actuel",
    ar: "السعر الحالي",
  },
  trade_quantity: {
    en: "Quantity",
    fr: "Quantité",
    ar: "الكمية",
  },
  trade_total_value: {
    en: "Total Value",
    fr: "Valeur totale",
    ar: "القيمة الإجمالية",
  },
  trade_available: {
    en: "Available",
    fr: "Disponible",
    ar: "المتوفر",
  },
  trade_buy: {
    en: "BUY",
    fr: "ACHAT",
    ar: "شراء",
  },
  trade_sell: {
    en: "SELL",
    fr: "VENTE",
    ar: "بيع",
  },
  trade_error_insufficient_balance: {
    en: "Insufficient balance for this trade",
    fr: "Solde insuffisant pour cette transaction",
    ar: "الرصيد غير كافٍ لهذه الصفقة",
  },
  trade_error_insufficient_quantity: {
    en: "Insufficient asset quantity",
    fr: "Quantité d'actif insuffisante",
    ar: "كمية الأصل غير كافية",
  },
  trade_history_title: {
    en: "Trade History",
    fr: "Historique des trades",
    ar: "سجل التداول",
  },
  trade_history_empty: {
    en: "No trades yet. Your orders will appear here.",
    fr: "Aucune transaction pour le moment. Vos ordres apparaîtront ici.",
    ar: "لا توجد صفقات بعد. ستظهر أوامرك هنا.",
  },
  trade_history_clear: {
    en: "Clear history",
    fr: "Effacer l'historique",
    ar: "مسح السجل",
  },
  dashboard_error_market_data: {
    en: "Unable to load market data.",
    fr: "Impossible de charger les données de marché.",
    ar: "تعذر تحميل بيانات السوق.",
  },
  dashboard_no_active_challenge_title: {
    en: "No active challenge",
    fr: "Aucun challenge actif",
    ar: "لا يوجد تحدٍ نشط",
  },
  dashboard_no_active_challenge_desc: {
    en: "Start a challenge before executing trades.",
    fr: "Commencez un challenge avant d'exécuter des trades.",
    ar: "ابدأ تحدياً قبل تنفيذ الصفقات.",
  },
  dashboard_trade_failed: {
    en: "Trade execution failed.",
    fr: "Échec de l'exécution du trade.",
    ar: "فشل تنفيذ الصفقة.",
  },
  challenge_positions_title: {
    en: "Owned assets",
    fr: "Actifs détenus",
    ar: "الأصول المملوكة",
  },
  challenge_positions_empty: {
    en: "No open positions",
    fr: "Aucune position ouverte",
    ar: "لا توجد مراكز مفتوحة",
  },
  dashboard_error_network_trade: {
    en: "Network error while executing trade.",
    fr: "Erreur réseau lors de l'exécution du trade.",
    ar: "حدث خطأ في الشبكة أثناء تنفيذ الصفقة.",
  },
  dashboard_challenge_failed_title: {
    en: "Challenge Failed",
    fr: "Challenge échoué",
    ar: "فشل التحدي",
  },
  dashboard_challenge_failed_desc: {
    en: "You have exceeded the maximum loss limit.",
    fr: "Vous avez dépassé la limite de perte maximale.",
    ar: "لقد تجاوزت حد الخسارة الأقصى.",
  },
  dashboard_challenge_passed_title: {
    en: "Congratulations!",
    fr: "Félicitations !",
    ar: "تهانينا!",
  },
  dashboard_challenge_passed_desc: {
    en: "You have passed the trading challenge!",
    fr: "Vous avez réussi le challenge de trading !",
    ar: "لقد اجتزت تحدي التداول!",
  },
  dashboard_refresh: {
    en: "Refresh",
    fr: "Rafraîchir",
    ar: "تحديث",
  },
  dashboard_chart_label: {
    en: "Chart",
    fr: "Graphique",
    ar: "الرسم البياني",
  },
  dashboard_order_executed_suffix: {
    en: "Order Executed",
    fr: "ordre exécuté",
    ar: "تم تنفيذ الأمر",
  },
  footer_quick_links_title: {
    en: "Quick Links",
    fr: "Liens rapides",
    ar: "روابط سريعة",
  },
  footer_resources_title: {
    en: "Resources",
    fr: "Ressources",
    ar: "الموارد",
  },
  footer_contact_title: {
    en: "Contact",
    fr: "Contact",
    ar: "تواصل معنا",
  },
  footer_about_text: {
    en: "Professional prop trading challenges powered by AI insights. Trade smarter, earn funded accounts.",
    fr: "Challenges de prop trading professionnels propulsés par l'IA. Tradez plus intelligemment et obtenez des comptes financés.",
    ar: "تحديات تداول احترافية مدعومة برؤى الذكاء الاصطناعي. تداول بذكاء واحصل على حسابات ممولة.",
  },
  footer_link_challenges: {
    en: "Challenges",
    fr: "Challenges",
    ar: "التحديات",
  },
  footer_link_leaderboard: {
    en: "Leaderboard",
    fr: "Classement",
    ar: "الترتيب",
  },
  footer_link_dashboard: {
    en: "Dashboard",
    fr: "Tableau de bord",
    ar: "لوحة التحكم",
  },
  footer_link_rules: {
    en: "Trading Rules",
    fr: "Règles de trading",
    ar: "قواعد التداول",
  },
  footer_link_faq: {
    en: "FAQ",
    fr: "FAQ",
    ar: "الأسئلة الشائعة",
  },
  footer_link_support: {
    en: "Support",
    fr: "Support",
    ar: "الدعم",
  },
  footer_bottom_copyright: {
    en: "© 2025 TradeSense AI. All rights reserved.",
    fr: "© 2025 TradeSense AI. Tous droits réservés.",
    ar: "© 2025 TradeSense AI. جميع الحقوق محفوظة.",
  },
  footer_bottom_terms: {
    en: "Terms of Service",
    fr: "Conditions d’utilisation",
    ar: "شروط الخدمة",
  },
  footer_bottom_privacy: {
    en: "Privacy Policy",
    fr: "Politique de confidentialité",
    ar: "سياسة الخصوصية",
  },
  footer_bottom_risk: {
    en: "Risk Disclosure",
    fr: "Avertissement sur les risques",
    ar: "إخلاء مسؤولية المخاطر",
  },
  leaderboard_badge_label: {
    en: "January 2025",
    fr: "Janvier 2025",
    ar: "يناير 2025",
  },
  leaderboard_title_prefix: {
    en: "Top",
    fr: "Top",
    ar: "أفضل",
  },
  leaderboard_title_highlight: {
    en: "Traders",
    fr: "traders",
    ar: "المتداولين",
  },
  leaderboard_subtitle: {
    en: "The best performing traders this month. Compete, prove your skills, and climb the ranks.",
    fr: "Les meilleurs traders du mois. Rivalisez, prouvez vos compétences et grimpez dans le classement.",
    ar: "أفضل المتداولين أداءً هذا الشهر. نافس، أظهر مهاراتك وتقدم في الترتيب.",
  },
  leaderboard_card_title: {
    en: "Monthly Leaderboard",
    fr: "Classement mensuel",
    ar: "الترتيب الشهري",
  },
  leaderboard_header_rank: {
    en: "Rank",
    fr: "Rang",
    ar: "الترتيب",
  },
  leaderboard_header_trader: {
    en: "Trader",
    fr: "Trader",
    ar: "المتداول",
  },
  leaderboard_header_profit: {
    en: "Profit",
    fr: "Profit",
    ar: "الربح",
  },
  leaderboard_header_trades: {
    en: "Trades",
    fr: "Trades",
    ar: "الصفقات",
  },
  leaderboard_header_win_rate: {
    en: "Win Rate",
    fr: "Taux de réussite",
    ar: "نسبة الفوز",
  },
  leaderboard_error_load: {
    en: "Could not load leaderboard.",
    fr: "Impossible de charger le classement.",
    ar: "تعذر تحميل قائمة المتصدرين.",
  },
  community_badge_label: {
    en: "Live community chat",
    fr: "Chat communautaire en direct",
    ar: "دردشة مجتمعية مباشرة",
  },
  community_title: {
    en: "Connect with other traders",
    fr: "Connectez-vous avec d'autres traders",
    ar: "تواصل مع المتداولين الآخرين",
  },
  community_title_highlight: {
    en: "in real time",
    fr: "en temps réel",
    ar: "بشكل فوري",
  },
  community_subtitle: {
    en: "Share ideas, celebrate wins, and learn from other traders in a single global chat room.",
    fr: "Partagez vos idées, célébrez vos gains et apprenez des autres traders dans un salon de discussion global.",
    ar: "شارك أفكارك، احتفل بالأرباح وتعلّم من المتداولين الآخرين في غرفة دردشة واحدة.",
  },
  community_input_placeholder: {
    en: "Type a message to the community...",
    fr: "Écrivez un message à la communauté...",
    ar: "اكتب رسالة إلى المجتمع...",
  },
  community_empty: {
    en: "No messages yet. Be the first to say hi 👋",
    fr: "Aucun message pour le moment. Soyez le premier à dire bonjour 👋",
    ar: "لا توجد رسائل بعد. كن أول من يحيّي 👋",
  },
  community_loading: {
    en: "Loading chat...",
    fr: "Chargement du chat...",
    ar: "جاري تحميل الدردشة...",
  },
  community_error_load: {
    en: "Could not load community messages.",
    fr: "Impossible de charger les messages de la communauté.",
    ar: "تعذر تحميل رسائل المجتمع.",
  },
  community_error_send: {
    en: "Could not send your message.",
    fr: "Impossible d'envoyer votre message.",
    ar: "تعذر إرسال رسالتك.",
  },
  community_send: {
    en: "Send",
    fr: "Envoyer",
    ar: "إرسال",
  },
  auth_back_to_home: {
    en: "Back to home",
    fr: "Retour à l’accueil",
    ar: "العودة إلى الرئيسية",
  },
  auth_title_login: {
    en: "Welcome Back",
    fr: "Bon retour",
    ar: "مرحباً بعودتك",
  },
  auth_title_register: {
    en: "Create Account",
    fr: "Créer un compte",
    ar: "إنشاء حساب",
  },
  auth_subtitle_login: {
    en: "Enter your credentials to access your dashboard",
    fr: "Entrez vos identifiants pour accéder à votre tableau de bord",
    ar: "أدخل بياناتك للوصول إلى لوحة التحكم",
  },
  auth_subtitle_register: {
    en: "Start your trading journey today",
    fr: "Commencez votre parcours de trading dès aujourd’hui",
    ar: "ابدأ رحلتك في التداول اليوم",
  },
  auth_label_full_name: {
    en: "Full Name",
    fr: "Nom complet",
    ar: "الاسم الكامل",
  },
  auth_label_email: {
    en: "Email",
    fr: "E-mail",
    ar: "البريد الإلكتروني",
  },
  auth_label_password: {
    en: "Password",
    fr: "Mot de passe",
    ar: "كلمة المرور",
  },
  auth_label_confirm_password: {
    en: "Confirm Password",
    fr: "Confirmer le mot de passe",
    ar: "تأكيد كلمة المرور",
  },
  auth_placeholder_full_name: {
    en: "John Doe",
    fr: "Jean Dupont",
    ar: "محمد أحمد",
  },
  auth_placeholder_email: {
    en: "you@example.com",
    fr: "vous@exemple.com",
    ar: "you@example.com",
  },
  auth_button_sign_in: {
    en: "Sign In",
    fr: "Se connecter",
    ar: "تسجيل الدخول",
  },
  auth_button_create_account: {
    en: "Create Account",
    fr: "Créer un compte",
    ar: "إنشاء حساب",
  },
  auth_button_signing_in: {
    en: "Signing in...",
    fr: "Connexion...",
    ar: "جاري تسجيل الدخول...",
  },
  auth_button_creating_account: {
    en: "Creating account...",
    fr: "Création du compte...",
    ar: "جاري إنشاء الحساب...",
  },
  auth_toggle_no_account_prefix: {
    en: "Don't have an account?",
    fr: "Vous n’avez pas de compte ?",
    ar: "ليس لديك حساب؟",
  },
  auth_toggle_no_account_action: {
    en: "Sign up",
    fr: "S’inscrire",
    ar: "إنشاء حساب",
  },
  auth_toggle_have_account_prefix: {
    en: "Already have an account?",
    fr: "Vous avez déjà un compte ?",
    ar: "لديك حساب بالفعل؟",
  },
  auth_toggle_have_account_action: {
    en: "Sign in",
    fr: "Se connecter",
    ar: "تسجيل الدخول",
  },
  auth_toast_login_success_title: {
    en: "Welcome back!",
    fr: "Bon retour !",
    ar: "مرحباً بعودتك!",
  },
  auth_toast_login_success_desc: {
    en: "You have successfully logged in.",
    fr: "Vous vous êtes connecté avec succès.",
    ar: "تم تسجيل دخولك بنجاح.",
  },
  auth_toast_register_success_title: {
    en: "Account created!",
    fr: "Compte créé !",
    ar: "تم إنشاء الحساب!",
  },
  auth_toast_register_success_desc: {
    en: "Your account has been created. Welcome to TradeSense AI!",
    fr: "Votre compte a été créé. Bienvenue sur TradeSense AI !",
    ar: "تم إنشاء حسابك. مرحباً بك في TradeSense AI!",
  },
  auth_error_auth_failed: {
    en: "Authentication failed.",
    fr: "L’authentification a échoué.",
    ar: "فشل التحقق من الهوية.",
  },
  auth_error_generic: {
    en: "Something went wrong. Please try again.",
    fr: "Une erreur s’est produite. Veuillez réessayer.",
    ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },
  notfound_message: {
    en: "Oops! Page not found",
    fr: "Oups ! Page introuvable",
    ar: "عذراً! الصفحة غير موجودة",
  },
  notfound_back_home: {
    en: "Return to Home",
    fr: "Retour à l’accueil",
    ar: "العودة إلى الرئيسية",
  },
  asset_selector_title: {
    en: "Select Asset",
    fr: "Sélectionner un actif",
    ar: "اختر الأصل",
  },
  asset_selector_scope_international: {
    en: "International",
    fr: "International",
    ar: "دولي",
  },
  asset_selector_scope_national: {
    en: "Moroccan",
    fr: "Marocain",
    ar: "محلي",
  },
  common_close: {
    en: "Close",
    fr: "Fermer",
    ar: "إغلاق",
  },
  admin_title: {
    en: "Admin",
    fr: "Admin",
    ar: "المشرف",
  },
  admin_users_suffix: {
    en: "users",
    fr: "utilisateurs",
    ar: "مستخدمين",
  },
  admin_col_id: {
    en: "ID",
    fr: "ID",
    ar: "المعرف",
  },
  admin_col_name: {
    en: "Name",
    fr: "Nom",
    ar: "الاسم",
  },
  admin_col_email: {
    en: "Email",
    fr: "Email",
    ar: "البريد الإلكتروني",
  },
  admin_col_virtual_balance: {
    en: "Virtual Balance",
    fr: "Solde virtuel",
    ar: "الرصيد الافتراضي",
  },
  admin_col_starting_balance: {
    en: "Starting Balance",
    fr: "Solde initial",
    ar: "الرصيد الابتدائي",
  },
  admin_col_daily_pnl: {
    en: "Daily PnL %",
    fr: "PnL quotidien %",
    ar: "الربح/الخسارة اليومي ٪",
  },
  admin_col_daily_timer: {
    en: "Daily Timer",
    fr: "Minuteur quotidien",
    ar: "المؤقت اليومي",
  },
  admin_col_status: {
    en: "Status",
    fr: "Statut",
    ar: "الحالة",
  },
  admin_col_override: {
    en: "Override",
    fr: "Forcer",
    ar: "تعديل",
  },
  admin_status_active: {
    en: "ACTIVE",
    fr: "ACTIF",
    ar: "نشط",
  },
  admin_status_successful: {
    en: "SUCCESSFUL",
    fr: "RÉUSSI",
    ar: "ناجح",
  },
  admin_status_failed: {
    en: "FAILED",
    fr: "ÉCHOUÉ",
    ar: "فاشل",
  },
  admin_button_saving: {
    en: "Saving...",
    fr: "Enregistrement...",
    ar: "جارٍ الحفظ...",
  },
  admin_button_update: {
    en: "Update",
    fr: "Mettre à jour",
    ar: "تحديث",
  },
  admin_no_users: {
    en: "No users found.",
    fr: "Aucun utilisateur trouvé.",
    ar: "لم يتم العثور على مستخدمين.",
  },
  superadmin_badge_label: {
    en: "Super Admin",
    fr: "Super Admin",
    ar: "مشرف عام",
  },
  superadmin_heading: {
    en: "Super Administration Area",
    fr: "Espace de Super Administration",
    ar: "منطقة الإدارة العليا",
  },
  superadmin_subheading: {
    en: "Platform configuration and integrations",
    fr: "Configuration et intégrations de la plateforme",
    ar: "إعدادات المنصة والتكاملات",
  },
  superadmin_tab_stats: {
    en: "Statistics",
    fr: "Statistiques",
    ar: "الإحصائيات",
  },
  superadmin_tab_users: {
    en: "Users",
    fr: "Utilisateurs",
    ar: "المستخدمون",
  },
  superadmin_tab_settings: {
    en: "Settings",
    fr: "Paramètres",
    ar: "الإعدادات",
  },
  superadmin_metric_total_users: {
    en: "Total Users",
    fr: "Total Utilisateurs",
    ar: "إجمالي المستخدمين",
  },
  superadmin_metric_active_users: {
    en: "Active Users",
    fr: "Utilisateurs Actifs",
    ar: "المستخدمون النشطون",
  },
  superadmin_metric_total_revenue: {
    en: "Total Revenue",
    fr: "Revenu Total",
    ar: "إجمالي الإيرادات",
  },
  superadmin_metric_active_challenges: {
    en: "Active Challenges",
    fr: "Challenges Actifs",
    ar: "التحديات النشطة",
  },
  superadmin_chart_revenue_title: {
    en: "Monthly Revenue",
    fr: "Revenus Mensuels",
    ar: "الإيرادات الشهرية",
  },
  superadmin_chart_revenue_desc: {
    en: "Evolution of revenue generated by the platform.",
    fr: "Evolution des revenus générés par la plateforme.",
    ar: "تطور الإيرادات التي تحققها المنصة.",
  },
  superadmin_chart_signups_title: {
    en: "User Signups",
    fr: "Inscriptions Utilisateurs",
    ar: "تسجيلات المستخدمين",
  },
  superadmin_chart_signups_desc: {
    en: "Number of new accounts created per month.",
    fr: "Nombre de nouveaux comptes créés par mois.",
    ar: "عدد الحسابات الجديدة التي يتم إنشاؤها شهرياً.",
  },
  superadmin_chart_challenge_status_title: {
    en: "Challenge Status Distribution",
    fr: "Distribution des Statuts de Challenge",
    ar: "توزيع حالات التحديات",
  },
  superadmin_chart_challenge_status_desc: {
    en: "Overall breakdown of active, passed, and failed challenges.",
    fr: "Répartition globale des challenges actifs, réussis et échoués.",
    ar: "التوزيع العام للتحديات النشطة والناجحة والفاشلة.",
  },
  superadmin_loading_stats: {
    en: "Loading statistics...",
    fr: "Chargement des statistiques…",
    ar: "جارٍ تحميل الإحصائيات...",
  },
  superadmin_users_title: {
    en: "User Management",
    fr: "Gestion des Utilisateurs",
    ar: "إدارة المستخدمين",
  },
  superadmin_users_subtitle: {
    en: "Global supervision of user accounts and roles.",
    fr: "Supervision globale des comptes et rôles des utilisateurs.",
    ar: "إشراف شامل على حسابات المستخدمين وأدوارهم.",
  },
  superadmin_users_total_label: {
    en: "Total users",
    fr: "Total utilisateurs",
    ar: "إجمالي المستخدمين",
  },
  superadmin_users_search_placeholder: {
    en: "Search users...",
    fr: "Rechercher des utilisateurs…",
    ar: "ابحث عن المستخدمين...",
  },
  superadmin_users_loading: {
    en: "Loading users...",
    fr: "Chargement des utilisateurs…",
    ar: "جارٍ تحميل المستخدمين...",
  },
  superadmin_users_empty: {
    en: "No users found.",
    fr: "Aucun utilisateur trouvé.",
    ar: "لم يتم العثور على مستخدمين.",
  },
  superadmin_users_col_name: {
    en: "Name",
    fr: "Nom",
    ar: "الاسم",
  },
  superadmin_users_col_email: {
    en: "Email",
    fr: "Email",
    ar: "البريد الإلكتروني",
  },
  superadmin_users_col_role: {
    en: "Role",
    fr: "Rôle",
    ar: "الدور",
  },
  superadmin_users_col_created_at: {
    en: "Registered on",
    fr: "Inscrit le",
    ar: "تاريخ التسجيل",
  },
  superadmin_users_col_actions: {
    en: "Actions",
    fr: "Actions",
    ar: "إجراءات",
  },
  superadmin_action_make_user: {
    en: "Make User",
    fr: "Rendre Utilisateur",
    ar: "جعله مستخدماً",
  },
  superadmin_action_make_admin: {
    en: "Make Admin",
    fr: "Rendre Admin",
    ar: "جعله مشرفاً",
  },
  superadmin_action_make_superadmin: {
    en: "Make Super Admin",
    fr: "Rendre Super Admin",
    ar: "جعله مشرفاً عاماً",
  },
  superadmin_error_generic_title: {
    en: "Error",
    fr: "Erreur",
    ar: "خطأ",
  },
  superadmin_error_role_update: {
    en: "Unable to update user role.",
    fr: "Impossible de mettre à jour le rôle de l'utilisateur.",
    ar: "تعذر تحديث دور المستخدم.",
  },
  superadmin_success_role_updated_title: {
    en: "Role updated",
    fr: "Rôle mis à jour",
    ar: "تم تحديث الدور",
  },
  superadmin_success_role_updated_desc: {
    en: "The user's role has been updated.",
    fr: "Le rôle de l'utilisateur a été mis à jour.",
    ar: "تم تحديث دور المستخدم.",
  },
  superadmin_error_paypal_fields: {
    en: "Client ID and Client Secret are required.",
    fr: "Client ID et Client Secret sont requis.",
    ar: "معرّف العميل والسر مطلوبان.",
  },
  superadmin_error_paypal_save: {
    en: "Unable to save PayPal configuration.",
    fr: "Impossible d'enregistrer la configuration PayPal.",
    ar: "تعذر حفظ إعدادات PayPal.",
  },
  superadmin_success_paypal_title: {
    en: "PayPal connected",
    fr: "PayPal connecté",
    ar: "تم ربط PayPal",
  },
  superadmin_success_paypal_desc: {
    en: "PayPal configuration has been saved.",
    fr: "La configuration PayPal a été enregistrée.",
    ar: "تم حفظ إعدادات PayPal.",
  },
  superadmin_settings_paypal_title: {
    en: "PayPal Integration",
    fr: "Intégration PayPal",
    ar: "تكامل PayPal",
  },
  superadmin_settings_paypal_desc: {
    en: "Connect your PayPal Business account to receive payments.",
    fr: "Connectez votre compte PayPal Business pour recevoir les paiements.",
    ar: "اربط حساب PayPal Business الخاص بك لاستقبال المدفوعات.",
  },
  superadmin_settings_paypal_client_id_label: {
    en: "Client ID",
    fr: "Client ID",
    ar: "معرّف العميل",
  },
  superadmin_settings_paypal_client_id_placeholder: {
    en: "Enter your PayPal Client ID",
    fr: "Entrez votre PayPal Client ID",
    ar: "أدخل PayPal Client ID الخاص بك",
  },
  superadmin_settings_paypal_client_secret_label: {
    en: "Client Secret",
    fr: "Client Secret",
    ar: "سر العميل",
  },
  superadmin_settings_paypal_connect_button: {
    en: "Connect PayPal",
    fr: "Connecter PayPal",
    ar: "ربط PayPal",
  },
  superadmin_settings_paypal_get_creds_button: {
    en: "Get PayPal credentials",
    fr: "Obtenir les identifiants PayPal",
    ar: "الحصول على بيانات اعتماد PayPal",
  },
  superadmin_settings_platform_title: {
    en: "Platform Settings",
    fr: "Paramètres Plateforme",
    ar: "إعدادات المنصة",
  },
  superadmin_settings_platform_desc: {
    en: "General configuration of the platform.",
    fr: "Configuration générale de la plateforme.",
    ar: "الإعدادات العامة للمنصة.",
  },
  superadmin_settings_platform_coming_soon: {
    en: "Additional platform settings coming soon…",
    fr: "Additional platform settings coming soon…",
    ar: "إعدادات إضافية للمنصة قريباً…",
  },
  hero_main_text: {
    en: "Trade Smarter.",
    fr: "Tradez plus intelligemment.",
    ar: "تداول بذكاء.",
  },
  hero_highlight_text: {
    en: "Get Funded.",
    fr: "Obtenez un financement.",
    ar: "احصل على التمويل.",
  },
  hero_description: {
    en: "Prove your trading skills with our AI-assisted challenge. Hit targets, manage risk, and unlock up to $100,000 in funded capital.",
    fr: "Prouvez vos compétences de trading avec notre challenge assisté par IA. Atteignez les objectifs, gérez le risque et débloquez jusqu'à 100 000 $ de capital financé.",
    ar: "أثبت مهاراتك في التداول من خلال تحدينا المدعوم بالذكاء الاصطناعي. حقق الأهداف، أدر المخاطر، واحصل على تمويل يصل إلى 100,000 دولار.",
  },
  hero_stat_accuracy: {
    en: "AI Accuracy",
    fr: "Précision IA",
    ar: "دقة الذكاء الاصطناعي",
  },
  hero_stat_live_signals: {
    en: "Live Signals",
    fr: "Signaux en Direct",
    ar: "إشارات مباشرة",
  },
  features_assist_badge: {
    en: "Full AI Assistance",
    fr: "Assistance IA Complète",
    ar: "مساعدة ذكاء اصطناعي كاملة",
  },
  features_title_main: {
    en: "All Your Decisions",
    fr: "Toutes vos Décisions",
    ar: "كل قراراتك",
  },
  features_title_highlight: {
    en: "Guided by AI",
    fr: "Guidées par l'IA",
    ar: "موجهة بالذكاء الاصطناعي",
  },
  features_desc: {
    en: "TradeSense AI centralizes signals, trade plans, risk detection, and smart sorting to help you navigate markets with confidence.",
    fr: "TradeSense AI centralise signaux, plans de trade, détection de risques et tri intelligent pour vous aider à naviguer les marchés avec confiance.",
    ar: "TradeSense AI يجمع الإشارات، خطط التداول، كشف المخاطر، والفرز الذكي لمساعدتك على التنقل في الأسواق بثقة.",
  },
  feature_buy_signals: {
    en: "Buy Signals",
    fr: "Signaux Achat",
    ar: "إشارات الشراء",
  },
  feature_buy_desc: {
    en: "Identify best buying opportunities in real-time",
    fr: "Identifiez les meilleures opportunités d'achat en temps réel",
    ar: "حدد أفضل فرص الشراء في الوقت الفعلي",
  },
  feature_sell_signals: {
    en: "Sell Signals",
    fr: "Signaux Vente",
    ar: "إشارات البيع",
  },
  feature_sell_desc: {
    en: "Get alerts to optimize your exits",
    fr: "Recevez des alertes pour optimiser vos sorties de position",
    ar: "احصل على تنبيهات لتحسين نقاط الخروج",
  },
  feature_stop_signals: {
    en: "Stop Signals",
    fr: "Signaux Stop",
    ar: "إشارات الوقف",
  },
  feature_stop_desc: {
    en: "Protect your capital with smart stops",
    fr: "Protégez votre capital avec des stops intelligents",
    ar: "احمِ رأس مالك بإيقافات ذكية",
  },
  feature_plans: {
    en: "AI Trade Plans",
    fr: "Plans de Trade IA",
    ar: "خطط تداول ذكية",
  },
  feature_plans_desc: {
    en: "Custom strategies for every market",
    fr: "Stratégies personnalisées pour chaque marché",
    ar: "استراتيجيات مخصصة لكل سوق",
  },
  feature_risk: {
    en: "Risk Detection",
    fr: "Détection de Risque",
    ar: "كشف المخاطر",
  },
  feature_risk_desc: {
    en: "Instant alerts when danger approaches",
    fr: "Alertes instantanées lorsqu'un danger approche",
    ar: "تنبيهات فورية عند اقتراب الخطر",
  },
  feature_sort: {
    en: "Smart Sorting",
    fr: "Tri Intelligent",
    ar: "فرز ذكي",
  },
  feature_sort_desc: {
    en: "Auto-filter good vs risky trades",
    fr: "Filtrage automatique des bons trades vs risqués",
    ar: "تصفية تلقائية للصفقات الجيدة مقابل الخطرة",
  },
  feature_detail_forex: {
    en: "Forex",
    fr: "Forex",
    ar: "فوركس",
  },
  feature_detail_indices: {
    en: "Indices",
    fr: "Indices",
    ar: "مؤشرات",
  },
  feature_detail_alerts: {
    en: "Multi-timeframe alerts",
    fr: "Alertes multi-timeframes",
    ar: "تنبيهات متعددة الأطر الزمنية",
  },
  feature_detail_realtime: {
    en: "Real-Time",
    fr: "Temps Réel",
    ar: "وقت فعلي",
  },
  feature_detail_winrate: {
    en: "Avg Winrate",
    fr: "Winrate moyen",
    ar: "متوسط معدل الربح",
  },
  feature_detail_drawdown: {
    en: "Avg Drawdown",
    fr: "Drawdown moyen",
    ar: "متوسط التراجع",
  },
  features_bottom_title: {
    en: "One Interface, All Your Trading",
    fr: "Une seule interface, tout votre trading",
    ar: "واجهة واحدة، كل تداولاتك",
  },
  features_bottom_desc: {
    en: "Combine AI signals, news, community, and MasterClass in one integrated hub. Designed for traders who want to see everything at a glance.",
    fr: "Combinez signaux IA, actualités, communauté et MasterClass dans un seul hub intégré. Conçu pour les traders qui veulent tout voir en un coup d'œil.",
    ar: "اجمع بين إشارات الذكاء الاصطناعي، الأخبار، المجتمع، والماستر كلاس في مركز واحد متكامل. مصمم للمتداولين الذين يريدون رؤية كل شيء في لمحة.",
  },
  features_stat_time: {
    en: "Time Saved Daily",
    fr: "Temps gagné par jour",
    ar: "الوقت الموفر يومياً",
  },
  features_stat_decisions: {
    en: "Faster Decisions",
    fr: "Décisions plus rapides",
    ar: "قرارات أسرع",
  },
  news_badge: {
    en: "Stay Informed",
    fr: "Restez Informé",
    ar: "ابق على اطلاع",
  },
  news_title_highlight: {
    en: "News Hub",
    fr: "Hub d'Actualités",
    ar: "مركز الأخبار",
  },
  news_title_main: {
    en: "Live",
    fr: "en Direct",
    ar: "المباشر",
  },
  news_desc: {
    en: "A complete hub of market news, economic events, and AI summaries to help you anticipate key movements.",
    fr: "Un hub complet d'informations de marché, d'événements économiques et de résumés IA pour vous aider à anticiper les mouvements clés.",
    ar: "مركز كامل لأخبار السوق، الأحداث الاقتصادية، وملخصات الذكاء الاصطناعي لمساعدتك على توقع التحركات الرئيسية.",
  },
  news_item_financial: {
    en: "Financial News",
    fr: "Actualités Financières",
    ar: "أخبار مالية",
  },
  news_item_financial_desc: {
    en: "Real-time global market feeds",
    fr: "Flux d'informations en temps réel des marchés mondiaux",
    ar: "تغذية حية للأسواق العالمية",
  },
  news_item_ai: {
    en: "AI Summaries",
    fr: "Résumés IA",
    ar: "ملخصات ذكية",
  },
  news_item_ai_desc: {
    en: "Smart syntheses created by our AI",
    fr: "Synthèses intelligentes créées par notre IA",
    ar: "ملخصات ذكية تم إنشاؤها بواسطة الذكاء الاصطناعي لدينا",
  },
  news_item_events: {
    en: "Economic Events",
    fr: "Événements Économiques",
    ar: "أحداث اقتصادية",
  },
  news_item_events_desc: {
    en: "Full calendar of important announcements",
    fr: "Calendrier complet des annonces importantes",
    ar: "تقويم كامل للإعلانات الهامة",
  },
  news_item_alerts: {
    en: "Custom Alerts",
    fr: "Alertes Personnalisées",
    ar: "تنبيهات مخصصة",
  },
  news_item_alerts_desc: {
    en: "Notifications on your favorite assets",
    fr: "Notifications sur vos actifs favoris",
    ar: "إشعارات حول أصولك المفضلة",
  },
  news_feed_title: {
    en: "Real-Time Feed",
    fr: "Flux en Temps Réel",
    ar: "تغذية في الوقت الفعلي",
  },
  news_feed_subtitle: {
    en: "Market Overview",
    fr: "Vue d'ensemble des marchés",
    ar: "نظرة عامة على السوق",
  },
  news_feed_live: {
    en: "Live",
    fr: "En direct",
    ar: "مباشر",
  },
  news_feed_p1: {
    en: "Indices, currencies, crypto, and stocks: a news feed designed for traders, highlighting essential info.",
    fr: "Indices, devises, crypto et actions : un fil d'actus conçu pour les traders, avec les informations essentielles mises en avant.",
    ar: "المؤشرات، العملات، العملات الرقمية، والأسهم: شريط أخبار مصمم للمتداولين، يبرز المعلومات الأساسية.",
  },
  news_feed_p2: {
    en: "Each news item comes with potential market impact to help you prioritize decisions.",
    fr: "Chaque news est accompagnée d'un impact potentiel sur les marchés pour vous aider à prioriser vos décisions.",
    ar: "يأتي كل خبر مع تأثير محتمل على السوق لمساعدتك في تحديد أولويات القرارات.",
  },
  news_feed_p3: {
    en: "AI summaries synthesize the day's important movements, saving you valuable time.",
    fr: "Les résumés IA synthétisent les mouvements importants de la journée et vous permettent de gagner un temps précieux.",
    ar: "تلخص ملخصات الذكاء الاصطناعي التحركات المهمة لليوم، مما يوفر لك وقتاً ثميناً.",
  },
  news_feed_p4: {
    en: "Access a consolidated view of trends, risks, and opportunities on your favorite assets.",
    fr: "Accédez à une vue consolidée des tendances, des risques et des opportunités sur vos actifs favoris.",
    ar: "احصل على نظرة موحدة للاتجاهات، المخاطر، والفرص المتاحة على أصولك المفضلة.",
  },
  news_feed_live_status: {
    en: "Live",
    fr: "En direct",
    ar: "مباشر",
  },
  news_feed_live_label: {
    en: "Live News",
    fr: "Actualités en direct",
    ar: "أخبار مباشرة",
  },
  news_sample_1_time: {
    en: "3 min ago",
    fr: "Il y a 3 min",
    ar: "منذ 3 دقائق",
  },
  news_sample_1_title: {
    en: "FED leaves rates unchanged, dollar retreats",
    fr: "La FED laisse ses taux inchangés, le dollar recule",
    ar: "الفيدرالي يبقي أسعار الفائدة دون تغيير، والدولار يتراجع",
  },
  news_sample_1_tag: {
    en: "MACRO",
    fr: "MACRO",
    ar: "ماكرو",
  },
  news_sample_2_time: {
    en: "8 min ago",
    fr: "Il y a 8 min",
    ar: "منذ 8 دقائق",
  },
  news_sample_2_title: {
    en: "SP500 tests new key resistance zone",
    fr: "SP500 teste une nouvelle zone de résistance clé",
    ar: "SP500 يختبر منطقة مقاومة رئيسية جديدة",
  },
  news_sample_2_tag: {
    en: "INDICES",
    fr: "INDICES",
    ar: "مؤشرات",
  },
  news_sample_3_time: {
    en: "15 min ago",
    fr: "Il y a 15 min",
    ar: "منذ 15 دقيقة",
  },
  news_sample_3_title: {
    en: "Bitcoin breaks above key $45K resistance",
    fr: "Bitcoin dépasse la résistance clé des $45K",
    ar: "البيتكوين يتجاوز مقاومة 45 ألف دولار الرئيسية",
  },
  news_sample_3_tag: {
    en: "CRYPTO",
    fr: "CRYPTO",
    ar: "عملات رقمية",
  },
  community_landing_badge: {
    en: "Active Community",
    fr: "Communauté Active",
    ar: "مجتمع نشط",
  },
  community_landing_title_main: {
    en: "Community",
    fr: "Zone",
    ar: "منطقة",
  },
  community_landing_title_highlight: {
    en: "Zone",
    fr: "Communautaire",
    ar: "المجتمع",
  },
  community_landing_description: {
    en: "A social space dedicated to traders where you can exchange, learn, and grow together. Build a strong network around your growth.",
    fr: "Un espace social dédié aux traders où vous pouvez échanger, apprendre et grandir ensemble. Construisez un réseau solide autour de votre croissance.",
    ar: "مساحة اجتماعية مخصصة للمتداولين حيث يمكنك التبادل والتعلم والنمو معًا. ابنِ شبكة قوية حول نموك.",
  },
  community_landing_feature_1_title: {
    en: "Chat with Friends",
    fr: "Discutez avec des Amis",
    ar: "دردش مع الأصدقاء",
  },
  community_landing_feature_1_desc: {
    en: "Exchange with other passionate traders",
    fr: "Échangez avec d'autres traders passionnés",
    ar: "تبادل مع متداولين شغوفين آخرين",
  },
  community_landing_feature_2_title: {
    en: "Meet New Traders",
    fr: "Rencontrez de Nouveaux Traders",
    ar: "قابل متداولين جدد",
  },
  community_landing_feature_2_desc: {
    en: "Expand your professional network",
    fr: "Élargissez votre réseau professionnel",
    ar: "وسع شبكتك المهنية",
  },
  community_landing_feature_3_title: {
    en: "Share Strategies",
    fr: "Partagez des Stratégies",
    ar: "شارك الاستراتيجيات",
  },
  community_landing_feature_3_desc: {
    en: "Publish and discover winning techniques",
    fr: "Publiez et découvrez des techniques gagnantes",
    ar: "انشر واكتشف تقنيات رابحة",
  },
  community_landing_feature_4_title: {
    en: "Learn from Experts",
    fr: "Apprenez des Experts",
    ar: "تعلم من الخبراء",
  },
  community_landing_feature_4_desc: {
    en: "Access advice from top traders",
    fr: "Accédez aux conseils des meilleurs traders",
    ar: "احصل على نصائح من أفضل المتداولين",
  },
  why_choose_badge: {
    en: "Why TradeSense AI?",
    fr: "Pourquoi TradeSense AI ?",
    ar: "لماذا TradeSense AI؟",
  },
  why_choose_title_1: {
    en: "A New Way",
    fr: "Une Nouvelle façon",
    ar: "طريقة جديدة",
  },
  why_choose_title_2: {
    en: "to Approach Trading",
    fr: "d'Aborder le Trading",
    ar: "للتعامل مع التداول",
  },
  why_choose_description: {
    en: "By combining AI, news, and community, TradeSense AI becomes your co-pilot for all your market decisions.",
    fr: "En combinant IA, actualités et communauté, TradeSense AI devient votre copilote pour toutes vos décisions de marché.",
    ar: "من خلال الجمع بين الذكاء الاصطناعي والأخبار والمجتمع، يصبح TradeSense AI مساعدك في جميع قرارات السوق.",
  },
  why_choose_benefit_1: {
    en: "A single platform for trading, learning, and community",
    fr: "Une plateforme unique pour le trading, l'apprentissage et la communauté",
    ar: "منصة واحدة للتداول والتعلم والمجتمع",
  },
  why_choose_benefit_2: {
    en: "Real-time AI signals and risk alerts",
    fr: "Signaux IA et alertes de risque en temps réel",
    ar: "إشارات الذكاء الاصطناعي وتنبيهات المخاطر في الوقت الفعلي",
  },
  why_choose_benefit_3: {
    en: "News + Social + MasterClass in one interface",
    fr: "Actus + social + MasterClass dans une seule interface",
    ar: "أخبار + اجتماعي + ماستر كلاس في واجهة واحدة",
  },
  why_choose_benefit_4: {
    en: "Ideal for beginners and experienced traders",
    fr: "Idéal pour les débutants et les traders expérimentés",
    ar: "مثالي للمبتدئين والمتداولين ذوي الخبرة",
  },
  why_choose_benefit_5: {
    en: "Helps you make smarter decisions, faster",
    fr: "Vous aide à prendre des décisions plus intelligentes, plus rapidement",
    ar: "يساعدك على اتخاذ قرارات أذكى، بشكل أسرع",
  },
  cta_title_1: {
    en: "Ready to Trade",
    fr: "Prêt à Trade",
    ar: "مستعد للتداول",
  },
  cta_title_2: {
    en: "Smarter?",
    fr: "plus Intelligemment ?",
    ar: "بذكاء أكبر؟",
  },
  cta_description: {
    en: "Start today with TradeSense AI and discover how artificial intelligence can revolutionize your trading approach.",
    fr: "Commencez dès aujourd'hui avec TradeSense AI et découvrez comment l'intelligence artificielle peut révolutionner votre approche du trading.",
    ar: "ابدأ اليوم مع TradeSense AI واكتشف كيف يمكن للذكاء الاصطناعي إحداث ثورة في نهجك في التداول.",
  },
  cta_button_start: {
    en: "Start Challenge",
    fr: "Commencer le Challenge",
    ar: "ابدأ التحدي",
  },
  cta_button_contact: {
    en: "Contact Team",
    fr: "Contacter l'Équipe",
    ar: "تواصل مع الفريق",
  },
  cta_footer_text: {
    en: "✓ 14-day free trial    ✓ No credit card required    ✓ Cancel anytime",
    fr: "✓ Essai gratuit 14 jours    ✓ Pas de carte bancaire requise    ✓ Annulation à tout moment",
    ar: "✓ تجربة مجانية لمدة 14 يومًا    ✓ لا حاجة لبطاقة ائتمان    ✓ إلغاء في أي وقت",
  },
  masterclass_badge: {
    en: "Complete Academy",
    fr: "Académie Complète",
    ar: "أكاديمية شاملة",
  },
  masterclass_title: {
    en: "Learning Center",
    fr: "Centre d'Apprentissage",
    ar: "مركز التعلم",
  },
  masterclass_subtitle: {
    en: "MasterClass",
    fr: "MasterClass",
    ar: "ماستر كلاس",
  },
  masterclass_description: {
    en: "Whether you are starting from scratch or mastering advanced strategies, the MasterClass center helps you grow with confidence.",
    fr: "Que vous partiez de zéro ou que vous maîtrisiez des stratégies avancées, le centre MasterClass vous aide à grandir avec confiance.",
    ar: "سواء كنت تبدأ من الصفر أو تتقن استراتيجيات متقدمة، يساعدك مركز ماستر كلاس على النمو بثقة.",
  },
  masterclass_course_1_title: {
    en: "Beginner to Advanced Trading",
    fr: "Trading Débutant à Avancé",
    ar: "تداول من المبتدئ إلى المتقدم",
  },
  masterclass_course_1_desc: {
    en: "Complete path to master fundamentals",
    fr: "Parcours complet pour maîtriser les fondamentaux",
    ar: "مسار كامل لإتقان الأساسيات",
  },
  masterclass_course_1_level: {
    en: "All levels",
    fr: "Tous niveaux",
    ar: "جميع المستويات",
  },
  masterclass_course_1_lessons: {
    en: "45 lessons",
    fr: "45 leçons",
    ar: "45 درسًا",
  },
  masterclass_course_2_title: {
    en: "Technical Analysis",
    fr: "Analyse Technique",
    ar: "التحليل الفني",
  },
  masterclass_course_2_desc: {
    en: "Patterns, indicators and advanced strategies",
    fr: "Patterns, indicateurs et stratégies avancées",
    ar: "أنماط، مؤشرات واستراتيجيات متقدمة",
  },
  masterclass_course_2_level: {
    en: "Intermediate",
    fr: "Intermédiaire",
    ar: "متوسط",
  },
  masterclass_course_2_lessons: {
    en: "32 lessons",
    fr: "32 leçons",
    ar: "32 درسًا",
  },
  masterclass_course_3_title: {
    en: "Risk Management",
    fr: "Gestion des Risques",
    ar: "إدارة المخاطر",
  },
  masterclass_course_3_desc: {
    en: "Protect your capital like a pro",
    fr: "Protégez votre capital comme un professionnel",
    ar: "احمِ رأس مالك مثل المحترفين",
  },
  masterclass_course_3_level: {
    en: "Essential",
    fr: "Essentiel",
    ar: "أساسي",
  },
  masterclass_course_3_lessons: {
    en: "18 lessons",
    fr: "18 leçons",
    ar: "18 درسًا",
  },
  masterclass_course_4_title: {
    en: "Live Webinars",
    fr: "Webinaires en Direct",
    ar: "ندوات مباشرة",
  },
  masterclass_course_4_desc: {
    en: "Live sessions with market experts",
    fr: "Sessions live avec des experts du marché",
    ar: "جلسات حية مع خبراء السوق",
  },
  masterclass_course_4_level: {
    en: "Premium",
    fr: "Premium",
    ar: "مميز",
  },
  masterclass_course_4_lessons: {
    en: "Weekly",
    fr: "Hebdomadaire",
    ar: "أسبوعي",
  },
  masterclass_course_5_title: {
    en: "AI Assisted Path",
    fr: "Parcours IA Assisté",
    ar: "مسار مدعوم بالذكاء الاصطناعي",
  },
  masterclass_course_5_desc: {
    en: "Personalized learning by artificial intelligence",
    fr: "Apprentissage personnalisé par intelligence artificielle",
    ar: "تعلم مخصص بواسطة الذكاء الاصطناعي",
  },
  masterclass_course_5_level: {
    en: "Innovative",
    fr: "Innovant",
    ar: "مبتكر",
  },
  masterclass_course_5_lessons: {
    en: "Adaptive",
    fr: "Adaptatif",
    ar: "تكيفي",
  },
  masterclass_course_6_title: {
    en: "Challenges & Quizzes",
    fr: "Défis & Quiz",
    ar: "تحديات واختبارات",
  },
  masterclass_course_6_desc: {
    en: "Test your knowledge and earn rewards",
    fr: "Testez vos connaissances et gagnez des récompenses",
    ar: "اختبر معلوماتك واربح مكافآت",
  },
  masterclass_course_6_level: {
    en: "Practical",
    fr: "Pratique",
    ar: "عملي",
  },
  masterclass_course_6_lessons: {
    en: "100+ challenges",
    fr: "100+ défis",
    ar: "أكثر من 100 تحدي",
  },
  masterclass_button: {
    en: "Explore the Academy",
    fr: "Explorer l'Académie",
    ar: "استكشف الأكاديمية",
  },

  masterclass_badge: {
    en: "Complete Academy",
    fr: "Académie Complète",
    ar: "أكاديمية شاملة",
  },
  masterclass_title_main: {
    en: "Learning Center",
    fr: "Centre d'Apprentissage",
    ar: "مركز التعليم",
  },
  masterclass_title_highlight: {
    en: "MasterClass",
    fr: "MasterClass",
    ar: "ماستر كلاس",
  },
  masterclass_subtitle: {
    en: "Whether you start from scratch or master advanced strategies, the MasterClass center helps you grow with confidence.",
    fr: "Que vous partiez de zéro ou que vous maîtrisiez des stratégies avancées, le centre MasterClass vous aide à grandir avec confiance.",
    ar: "سواء كنت تبدأ من الصفر أو تتقن استراتيجيات متقدمة، مركز الماستر كلاس يساعدك على النمو بثقة.",
  },
  masterclass_course_1_title: {
    en: "Beginner to Advanced Trading",
    fr: "Trading Débutant à Avancé",
    ar: "تداول من المبتدئ إلى المتقدم",
  },
  masterclass_course_1_desc: {
    en: "Complete path to master the fundamentals",
    fr: "Parcours complet pour maîtriser les fondamentaux",
    ar: "مسار كامل لإتقان الأساسيات",
  },
  masterclass_course_2_title: {
    en: "Technical Analysis",
    fr: "Analyse Technique",
    ar: "التحليل الفني",
  },
  masterclass_course_2_desc: {
    en: "Patterns, indicators, and advanced strategies",
    fr: "Patterns, indicateurs et stratégies avancées",
    ar: "الأنماط، المؤشرات والاستراتيجيات المتقدمة",
  },
  masterclass_course_3_title: {
    en: "Risk Management",
    fr: "Gestion des Risques",
    ar: "إدارة المخاطر",
  },
  masterclass_course_3_desc: {
    en: "Protect your capital like a pro",
    fr: "Protégez votre capital comme un professionnel",
    ar: "احمِ رأس مالك مثل المحترفين",
  },
  masterclass_course_4_title: {
    en: "Live Webinars",
    fr: "Webinaires en Direct",
    ar: "ندوات مباشرة",
  },
  masterclass_course_4_desc: {
    en: "Live sessions with market experts",
    fr: "Sessions live avec des experts du marché",
    ar: "جلسات مباشرة مع خبراء السوق",
  },
  masterclass_course_5_title: {
    en: "AI Assisted Path",
    fr: "Parcours IA Assisté",
    ar: "مسار مدعوم بالذكاء الاصطناعي",
  },
  masterclass_course_5_desc: {
    en: "Personalized learning by artificial intelligence",
    fr: "Apprentissage personnalisé par intelligence artificielle",
    ar: "تعلم مخصص بواسطة الذكاء الاصطناعي",
  },
  masterclass_course_6_title: {
    en: "Challenges & Quizzes",
    fr: "Défis & Quiz",
    ar: "تحديات واختبارات",
  },
  masterclass_course_6_desc: {
    en: "Test your knowledge and earn rewards",
    fr: "Testez vos connaissances et gagnez des récompenses",
    ar: "اختبر معلوماتك واربح مكافآت",
  },
  masterclass_level_all: {
    en: "All levels",
    fr: "Tous niveaux",
    ar: "جميع المستويات",
  },
  masterclass_level_inter: {
    en: "Intermediate",
    fr: "Intermédiaire",
    ar: "متوسط",
  },
  masterclass_level_essential: {
    en: "Essential",
    fr: "Essentiel",
    ar: "أساسي",
  },
  masterclass_level_premium: {
    en: "Premium",
    fr: "Premium",
    ar: "مميز",
  },
  masterclass_level_innovative: {
    en: "Innovative",
    fr: "Innovant",
    ar: "مبتكر",
  },
  masterclass_level_practical: {
    en: "Practical",
    fr: "Pratique",
    ar: "عملي",
  },
  masterclass_lessons_45: {
    en: "45 lessons",
    fr: "45 leçons",
    ar: "45 درساً",
  },
  masterclass_lessons_32: {
    en: "32 lessons",
    fr: "32 leçons",
    ar: "32 درساً",
  },
  masterclass_lessons_18: {
    en: "18 lessons",
    fr: "18 leçons",
    ar: "18 درساً",
  },
  masterclass_lessons_weekly: {
    en: "Weekly",
    fr: "Hebdomadaire",
    ar: "أسبوعي",
  },
  masterclass_lessons_adaptive: {
    en: "Adaptive",
    fr: "Adaptatif",
    ar: "تكيفي",
  },
  masterclass_lessons_100: {
    en: "100+ challenges",
    fr: "100+ défis",
    ar: "100+ تحدي",
  },
  masterclass_cta: {
    en: "Explore Academy",
    fr: "Explorer l'Académie",
    ar: "استكشف الأكاديمية",
  },
};

export type LanguageKey = keyof typeof messages;

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: LanguageKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem("ts_lang") : null;
      if (stored === "fr" || stored === "ar" || stored === "en") {
        setLangState(stored);
        if (typeof window !== "undefined") {
          if (stored === "ar") {
            document.documentElement.dir = "rtl";
          } else {
            document.documentElement.dir = "ltr";
          }
        }
      }
    } catch {
      setLangState("en");
    }
  }, []);

  const setLang = (value: Language) => {
    setLangState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ts_lang", value);
      if (value === "ar") {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }
    }
  };

  const t = (key: LanguageKey) => {
    const entry = messages[key];
    if (!entry) return key;
    return entry[lang];
  };

  const value: LanguageContextValue = {
    lang,
    setLang,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
};
