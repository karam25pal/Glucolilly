import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Volume2, Accessibility } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);

  useEffect(() => {
    // Show voice prompt after 5 seconds of inactivity
    const timer = setTimeout(() => {
      setShowVoicePrompt(true);
      // Simulate voice prompt
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Would you like to start onboarding?");
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-phi-4">
      {/* Title takes ~61.8% of vertical space (Golden Ratio) */}
      <div className="flex-[0.618] flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-phi-3">GlucoLilly</h1>
        <Accessibility className="h-12 w-12 text-muted-foreground/40 mb-phi-4" aria-hidden="true" />
        <p className="text-2xl md:text-3xl text-foreground font-medium mb-phi-2">Empower Your Wellness</p>
        <p className="text-lg text-muted-foreground max-w-md">
          Your AI-powered accessible companion for diabetes management
        </p>
      </div>

      {/* CTA section takes ~38.2% */}
      <div className="flex-[0.382] flex flex-col items-center justify-start gap-phi-4 w-full max-w-md">
        <Button
          onClick={() => navigate("/accessibility")}
          size="lg"
          className="w-full min-h-touch text-lg font-semibold"
          aria-label="Select accessibility options to begin"
        >
          Select Accessibility Options
        </Button>

        {showVoicePrompt && (
          <div className="flex items-center gap-phi-2 text-muted-foreground animate-slide-up">
            <Volume2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm">Would you like to start onboarding?</span>
          </div>
        )}

        <button
          onClick={() => navigate("/accessibility")}
          className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-phi-2 py-phi-1 min-h-touch flex items-center"
          aria-label="Skip to accessibility selection"
        >
          Continue →
        </button>
      </div>
    </main>
  );
};

export default Splash;
