import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, MessageCircle, Moon, Sun, TrendingUp, Utensils, Dumbbell, Download } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import AIAssistant from "@/components/AIAssistant";
import { useUser } from "@/contexts/UserContext";
import { MetricsInput } from "@/components/MetricsInput";
import { DiabetesReportGenerator } from "@/components/DiabetesReportGenerator";
import { useNavigate } from "react-router-dom";
import { generateMockMetrics } from "@/utils/mockData";
import { toast } from "sonner";

const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  const { profile, weeklyStats, metrics, addMetric } = useUser();
  const [showAssistant, setShowAssistant] = useState(false);
  const navigate = useNavigate();

  // Load demo data if no metrics exist (only once)
  useEffect(() => {
    const hasLoadedDemo = localStorage.getItem('demo-data-loaded');
    if (metrics.length === 0 && !hasLoadedDemo) {
      const demoMetrics = generateMockMetrics();
      demoMetrics.forEach(metric => {
        addMetric({
          type: metric.type,
          value: metric.value,
          unit: metric.unit,
          notes: metric.notes,
          mealDetails: metric.mealDetails,
          exerciseDetails: metric.exerciseDetails,
        });
      });
      localStorage.setItem('demo-data-loaded', 'true');
      toast.success("Demo data loaded for testing");
    }
  }, []);

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
      <header className="border-b border-border px-phi-4 py-phi-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">GlucoLilly</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.name || "User"}
            </p>
          </div>
          
          <div className="flex gap-phi-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportReport}
              className="min-h-touch min-w-touch"
              aria-label="Export weekly report"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="min-h-touch min-w-touch"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-phi-4 py-phi-5">
        {/* Weekly Progress */}
        <section className="mb-phi-5">
          <Card className="p-phi-5 bg-gradient-to-br from-primary/5 to-accent">
            <div className="flex items-center gap-phi-3 mb-phi-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-primary">Weekly Progress</h2>
                <p className="text-muted-foreground">Your improvement this week</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-phi-4">
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-phi-1">Avg Glucose</p>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.avgGlucose} mg/dL</p>
              </div>
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-phi-1">Improvement</p>
                <p className="text-2xl font-bold text-primary">
                  {weeklyStats.improvement > 0 ? '+' : ''}{weeklyStats.improvement}%
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-phi-1">Total Steps</p>
                <p className="text-2xl font-bold text-foreground">
                  {weeklyStats.totalSteps.toLocaleString()}
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur p-phi-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-phi-1">Workouts</p>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.exerciseSessions}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Professional Report Generator */}
        <section className="mb-phi-5">
          <DiabetesReportGenerator />
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-phi-4 mb-phi-5">
          <Card className="p-phi-4">
            <div className="flex items-center gap-phi-3 mb-phi-2">
              <div className="p-phi-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">Latest Glucose</h2>
            </div>
            <p className="text-3xl font-bold text-foreground mb-phi-1">
              {latestGlucose ? Math.round(latestGlucose.value) : '--'} mg/dL
            </p>
            <p className="text-sm text-muted-foreground">
              {latestGlucose ? new Date(latestGlucose.timestamp).toLocaleTimeString() : 'No data'}
            </p>
          </Card>

          <Card className="p-phi-4">
            <div className="flex items-center gap-phi-3 mb-phi-2">
              <div className="p-phi-2 bg-primary/10 rounded-lg">
                <Utensils className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">Today's Meals</h2>
            </div>
            <p className="text-3xl font-bold text-foreground mb-phi-1">
              {todayMeals.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {todayMeals.reduce((sum, m) => sum + (m.mealDetails?.calories || 0), 0)} total calories
            </p>
          </Card>

          <Card className="p-phi-4">
            <div className="flex items-center gap-phi-3 mb-phi-2">
              <div className="p-phi-2 bg-primary/10 rounded-lg">
                <Dumbbell className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">Today's Steps</h2>
            </div>
            <p className="text-3xl font-bold text-foreground mb-phi-1">
              {todaySteps ? Math.round(todaySteps.value).toLocaleString() : '0'}
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${Math.min((todaySteps?.value || 0) / 10000 * 100, 100)}%` }} 
              />
            </div>
            <p className="text-sm text-muted-foreground mt-phi-1">Goal: 10,000 steps</p>
          </Card>

          <Card className="p-phi-4">
            <div className="flex items-center gap-phi-3 mb-phi-2">
              <div className="p-phi-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">BMI</h2>
            </div>
            <p className="text-3xl font-bold text-foreground mb-phi-1">
              {profile?.bmi || '--'}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile?.bmi && profile.bmi < 25 ? 'Normal range' : 'Monitor closely'}
            </p>
          </Card>
        </section>

        {/* Metrics Input */}
        <section className="mb-phi-5">
          <MetricsInput />
        </section>

        {/* AI Insights */}
        <section className="mb-phi-5">
          <Card className="p-phi-5 bg-gradient-to-br from-primary/5 to-accent">
            <h2 className="text-2xl font-bold text-primary mb-phi-3">
              Today's AI Insights
            </h2>
            <div className="space-y-phi-3">
              <div className="bg-background/80 backdrop-blur p-phi-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-phi-2">
                  ✨ Easy Win
                </h3>
                <p className="text-muted-foreground">
                  Try a 12-minute walk after lunch to help manage post-meal glucose levels
                </p>
              </div>
              
              <div className="bg-background/80 backdrop-blur p-phi-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-phi-2">
                  🎯 Level Up
                </h3>
                <p className="text-muted-foreground">
                  Your glucose levels are {weeklyStats.improvement > 0 ? 'improving' : 'stable'}! 
                  Keep logging your meals and exercise for better tracking.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-phi-4">
          <Card 
            className="p-phi-5 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/diet')}
          >
            <Utensils className="h-8 w-8 text-primary mb-phi-3" />
            <h3 className="text-xl font-bold mb-phi-2">Diet Suggestions</h3>
            <p className="text-muted-foreground">
              Explore healthy recipes with audio guides
            </p>
          </Card>

          <Card 
            className="p-phi-5 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/exercise')}
          >
            <Dumbbell className="h-8 w-8 text-primary mb-phi-3" />
            <h3 className="text-xl font-bold mb-phi-2">Exercise Guides</h3>
            <p className="text-muted-foreground">
              View personalized workout plans with instructions
            </p>
          </Card>
        </section>
      </main>

      {/* Floating AI Assistant */}
      <Button
        size="icon"
        className="fixed bottom-phi-4 right-phi-4 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setShowAssistant(true)}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {showAssistant && (
        <AIAssistant onClose={() => setShowAssistant(false)} />
      )}
    </div>
  );
};

export default Dashboard;
