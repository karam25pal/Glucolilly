import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, MessageCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import AIAssistant from "@/components/AIAssistant";

const Dashboard = () => {
  const { theme, setTheme } = useTheme();
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-phi-4 py-phi-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">DiaLife</h1>
            <p className="text-sm text-muted-foreground">Welcome back, User</p>
          </div>
          
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-phi-4 py-phi-5">
        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-phi-4 mb-phi-5">
          <Card className="p-phi-4">
            <div className="flex items-center gap-phi-3 mb-phi-2">
              <div className="p-phi-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">Glucose Level</h2>
            </div>
            <p className="text-3xl font-bold text-foreground mb-phi-1">118 mg/dL</p>
            <p className="text-sm text-muted-foreground">Within target range</p>
          </Card>

          <Card className="p-phi-4">
            <h2 className="text-lg font-semibold mb-phi-3">Today's Steps</h2>
            <p className="text-3xl font-bold text-foreground mb-phi-1">6,847</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }} />
            </div>
            <p className="text-sm text-muted-foreground mt-phi-1">Goal: 10,000 steps</p>
          </Card>

          <Card className="p-phi-4">
            <h2 className="text-lg font-semibold mb-phi-3">BMI</h2>
            <p className="text-3xl font-bold text-foreground mb-phi-1">23.2</p>
            <p className="text-sm text-muted-foreground">Normal range</p>
          </Card>
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
                  Consider swapping refined grains for whole grain alternatives at dinner
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-phi-4">
          <Card className="p-phi-5 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-bold mb-phi-2">🍽️ Log Meal</h3>
            <p className="text-muted-foreground">
              Upload or take a photo of your meal for AI analysis
            </p>
          </Card>

          <Card className="p-phi-5 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-bold mb-phi-2">🏋️ Today's Exercise</h3>
            <p className="text-muted-foreground">
              View your personalized workout plan for today
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
