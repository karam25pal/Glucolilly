import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, MessageCircle, Moon, Sun, TrendingUp, Utensils, Dumbbell, Download, Sparkles, Camera } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import AIAssistant from "@/components/AIAssistant";
import { useUser } from "@/contexts/UserContext";
import { MetricsInput } from "@/components/MetricsInput";
import { MealImageAnalyzer } from "@/components/MealImageAnalyzer";
import { MealHistory } from "@/components/MealHistory";
import { DiabetesReportGenerator } from "@/components/DiabetesReportGenerator";
import { useNavigate } from "react-router-dom";
import { generatePersonalizedMockMetrics } from "@/utils/mockData";
import { toast } from "sonner";

const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  const { profile, weeklyStats, metrics, addMetric } = useUser();
  const [showAssistant, setShowAssistant] = useState(false);
  const navigate = useNavigate();

  // Load / refresh demo data (re-seeds when migrating to vegan meals)
  useEffect(() => {
    const DEMO_VERSION = 'v2-vegan';
    const hasLoadedDemo = localStorage.getItem('demo-data-loaded');

    if (!profile || hasLoadedDemo === DEMO_VERSION) return;

    const stored = localStorage.getItem('health-metrics');
    const existing: typeof metrics = stored ? JSON.parse(stored) : [];
    const nonMealMetrics = existing.filter(m => m.type !== 'meal');

    const isFirstLoad = !hasLoadedDemo;
    if (isFirstLoad) {
      const personalizedMetrics = generatePersonalizedMockMetrics(profile, []);
      const allMetrics = [...personalizedMetrics, ...nonMealMetrics];
      localStorage.setItem('health-metrics', JSON.stringify(allMetrics));
      toast.success("Personalized demo data generated based on your profile");
    } else {
      const personalizedMetrics = generatePersonalizedMockMetrics(profile, nonMealMetrics);
      const veganMeals = personalizedMetrics.filter(m => m.type === 'meal');
      const allMetrics = [...veganMeals, ...nonMealMetrics];
      localStorage.setItem('health-metrics', JSON.stringify(allMetrics));
      toast.success("Past meals updated to vegan with photos");
    }

    localStorage.setItem('demo-data-loaded', DEMO_VERSION);
    setTimeout(() => window.location.reload(), 600);
  }, [profile]);

  const latestGlucose = metrics.find(m => m.type === "glucose");
  const todaySteps = metrics.find(m => m.type === "steps");
  const todayMeals = metrics.filter(m => {
    const today = new Date();
    const metricDate = new Date(m.timestamp);
    return m.type === "meal" &&
           metricDate.toDateString() === today.toDateString();
  });

  const handleExportReport = () => {
    const reportData = {
      patientName: profile?.name || "User",
      reportDate: new Date().toISOString().split('T')[0],
      weeklyStats,
      recentMetrics: metrics.slice(0, 20),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glucolilly-report-${reportData.reportDate}.json`;
    link.click();

    toast.success("Weekly report exported successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-background border-b border-border px-phi-3 sm:px-phi-4 py-phi-2 sm:py-phi-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-phi-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">GlucoLilly</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Welcome back, {profile?.name || "User"}
            </p>
          </div>

          <div className="flex gap-phi-2 flex-shrink-0">
            <Button
              variant="default"
              size="icon"
              onClick={handleExportReport}
              className="min-h-touch min-w-touch bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              aria-label="Export weekly report"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="min-h-touch min-w-touch"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-phi-3 sm:px-phi-4 py-phi-3 sm:py-phi-5 space-y-phi-4 sm:space-y-phi-5">
        {/* HERO: Weekly Progress + Quick Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-phi-3 sm:gap-phi-4">
          {/* Weekly Progress (spans 2) */}
          <Card className="lg:col-span-2 p-phi-3 sm:p-phi-5 bg-gradient-to-br from-primary/5 to-accent">
            <div className="flex items-center gap-phi-2 sm:gap-phi-3 mb-phi-3">
              <div className="p-phi-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-primary truncate">Weekly Progress</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Your improvement this week</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-phi-2 sm:gap-phi-3">
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-phi-1">Avg Glucose</p>
                <p className="text-xl sm:text-2xl font-bold">{weeklyStats.avgGlucose} <span className="text-xs">mg/dL</span></p>
              </div>
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-phi-1">Improvement</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {weeklyStats.improvement > 0 ? '+' : ''}{weeklyStats.improvement}%
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-phi-1">Total Steps</p>
                <p className="text-xl sm:text-2xl font-bold">{weeklyStats.totalSteps.toLocaleString()}</p>
              </div>
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-phi-1">Workouts</p>
                <p className="text-xl sm:text-2xl font-bold">{weeklyStats.exerciseSessions}</p>
              </div>
            </div>

            {/* Bottom action: Record Meal with AI shortcut */}
            <div className="mt-phi-3 pt-phi-3 border-t border-border/50 flex items-center justify-center">
              <Button
                size="lg"
                className="h-12 rounded-full shadow-md pl-phi-3 pr-phi-3 gap-phi-2 bg-primary hover:bg-primary/90"
                onClick={() => {
                  document.getElementById('meal-tracking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                aria-label="Record meal with AI"
              >
                <Camera className="h-5 w-5" />
                <span className="text-sm sm:text-base font-semibold">Record Meal with AI</span>
              </Button>
            </div>
          </Card>

          {/* Today's Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-phi-2 sm:gap-phi-3">
            <Card className="p-phi-3">
              <div className="flex items-center gap-phi-2 mb-phi-2">
                <div className="p-phi-1 bg-primary/10 rounded-lg">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Latest Glucose</h3>
              </div>
              <p className="text-2xl font-bold">
                {latestGlucose ? Math.round(latestGlucose.value) : '--'} <span className="text-xs text-muted-foreground">mg/dL</span>
              </p>
              <p className="text-xs text-muted-foreground mt-phi-1">
                {latestGlucose ? new Date(latestGlucose.timestamp).toLocaleTimeString() : 'No data'}
              </p>
            </Card>

            <Card className="p-phi-3">
              <div className="flex items-center gap-phi-2 mb-phi-2">
                <div className="p-phi-1 bg-primary/10 rounded-lg">
                  <Utensils className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Today's Meals</h3>
              </div>
              <p className="text-2xl font-bold">{todayMeals.length}</p>
              <p className="text-xs text-muted-foreground mt-phi-1">
                {todayMeals.reduce((sum, m) => sum + (m.mealDetails?.calories || 0), 0)} kcal
              </p>
            </Card>

            <Card className="p-phi-3">
              <div className="flex items-center gap-phi-2 mb-phi-2">
                <div className="p-phi-1 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Today's Steps</h3>
              </div>
              <p className="text-2xl font-bold">
                {todaySteps ? Math.round(todaySteps.value).toLocaleString() : '0'}
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-phi-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((todaySteps?.value || 0) / 10000 * 100, 100)}%` }}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* MEAL TRACKING: Analyzer + History side-by-side on desktop */}
        <section id="meal-tracking" className="scroll-mt-20">
          <div className="flex items-center gap-phi-2 mb-phi-3">
            <Utensils className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold">Meal Tracking</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-phi-3 sm:gap-phi-4">
            <div className="lg:col-span-3">
              <MealImageAnalyzer />
            </div>
            <div className="lg:col-span-2">
              <MealHistory />
            </div>
          </div>
        </section>

        {/* METRICS INPUT */}
        <section>
          <MetricsInput />
        </section>

        {/* AI INSIGHTS */}
        <section>
          <Card className="p-phi-3 sm:p-phi-5 bg-gradient-to-br from-primary/5 to-accent">
            <div className="flex items-center gap-phi-2 mb-phi-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-2xl font-bold text-primary">Today's AI Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-phi-3">
              <div className="bg-background/80 backdrop-blur p-phi-3 sm:p-phi-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold mb-phi-2">✨ Easy Win</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Try a 12-minute walk after lunch to help manage post-meal glucose levels
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur p-phi-3 sm:p-phi-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold mb-phi-2">🎯 Level Up</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your glucose levels are {weeklyStats.improvement > 0 ? 'improving' : 'stable'}!
                  Keep logging your meals and exercise for better tracking.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* PROFESSIONAL REPORT */}
        <section>
          <DiabetesReportGenerator />
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-phi-3 sm:gap-phi-4">
          <Card
            className="p-phi-3 sm:p-phi-5 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/diet')}
          >
            <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-phi-2 sm:mb-phi-3" />
            <h3 className="text-lg sm:text-xl font-bold mb-phi-1 sm:mb-phi-2">Diet Suggestions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore healthy recipes with audio guides
            </p>
          </Card>

          <Card
            className="p-phi-3 sm:p-phi-5 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/exercise')}
          >
            <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-phi-2 sm:mb-phi-3" />
            <h3 className="text-lg sm:text-xl font-bold mb-phi-1 sm:mb-phi-2">Exercise Guides</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View personalized workout plans with instructions
            </p>
          </Card>
        </section>
      </main>

      {/* Floating AI Assistant */}
      <Button
        size="icon"
        className="fixed bottom-phi-3 right-phi-3 sm:bottom-phi-4 sm:right-phi-4 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-50"
        onClick={() => setShowAssistant(true)}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {showAssistant && (
        <AIAssistant onClose={() => setShowAssistant(false)} />
      )}
    </div>
  );
};

export default Dashboard;
