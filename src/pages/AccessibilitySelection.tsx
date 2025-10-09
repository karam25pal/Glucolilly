import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Ear, Hand, Brain, Check } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";

type AccessibilityMode = "visual" | "hearing" | "motor" | "cognitive";

interface ModeOption {
  id: AccessibilityMode;
  icon: typeof Eye;
  title: string;
  features: string[];
}

const modeOptions: ModeOption[] = [
  {
    id: "visual",
    icon: Eye,
    title: "Visual",
    features: [
      "High contrast theme",
      "Scalable text (120-160%)",
      "Screen reader optimized",
      "Strong focus indicators"
    ]
  },
  {
    id: "hearing",
    icon: Ear,
    title: "Hearing",
    features: [
      "Visual confirmations",
      "Captions for all audio",
      "Strong contrast alerts",
      "Optional haptics"
    ]
  },
  {
    id: "motor",
    icon: Hand,
    title: "Motor",
    features: [
      "Large touch targets (56px+)",
      "Voice navigation ready",
      "Simple gesture support",
      "Reduced multi-step forms"
    ]
  },
  {
    id: "cognitive",
    icon: Brain,
    title: "Cognitive",
    features: [
      "Simplified layouts",
      "Icon + text labels",
      "Slower transitions",
      "Step-by-step guidance"
    ]
  }
];

const AccessibilitySelection = () => {
  const navigate = useNavigate();
  const { modes, setModes } = useAccessibility();
  const [selectedModes, setSelectedModes] = useState<AccessibilityMode[]>(modes);

  const toggleMode = (modeId: AccessibilityMode) => {
    setSelectedModes(prev => 
      prev.includes(modeId) 
        ? prev.filter(m => m !== modeId)
        : [...prev, modeId]
    );
  };

  const handleContinue = () => {
    setModes(selectedModes);
    navigate('/onboarding');
  };

  return (
    <main className="min-h-screen bg-background px-phi-4 py-phi-5">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-phi-5">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-phi-3">
            Choose Your Experience
          </h1>
          <p className="text-lg text-muted-foreground">
            Select one or more accessibility modes. You can change these anytime.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-phi-4 mb-phi-5">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedModes.includes(option.id);
            
            return (
              <Card
                key={option.id}
                className={`p-phi-4 cursor-pointer transition-all border-2 min-h-touch flex flex-col ${
                  isSelected 
                    ? 'border-primary bg-accent' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleMode(option.id)}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMode(option.id);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-phi-3">
                  <div className="flex items-center gap-phi-3">
                    <div className={`p-phi-2 rounded-lg ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {option.title}
                    </h2>
                  </div>
                  {isSelected && (
                    <Check className="h-6 w-6 text-primary" aria-label="Selected" />
                  )}
                </div>

                <ul className="space-y-phi-2" role="list">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-phi-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-phi-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="min-h-touch"
          >
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedModes.length === 0}
            className="min-h-touch min-w-[200px]"
          >
            Continue to Onboarding
          </Button>
        </div>
      </div>
    </main>
  );
};

export default AccessibilitySelection;
