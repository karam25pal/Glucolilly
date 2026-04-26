import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Splash = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    const consent = localStorage.getItem("gdpr-consent");
    let accepted = false;
    try {
      accepted = consent ? JSON.parse(consent).accepted === true : false;
    } catch {
      accepted = false;
    }
    navigate(accepted ? "/onboarding" : "/gdpr-consent");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-phi-4">
      <div className="flex-[0.618] flex flex-col items-center justify-center text-center animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-phi-3">GlucoLilly</h1>
        <p className="text-2xl md:text-3xl text-foreground font-medium mb-phi-2">Empower Your Wellness</p>
        <p className="text-lg text-muted-foreground max-w-md">
          Your AI-powered companion for diabetes management
        </p>
      </div>

      <div className="flex-[0.382] flex flex-col items-center justify-start gap-phi-4 w-full max-w-md">
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full min-h-touch text-lg font-semibold"
        >
          Start
        </Button>
      </div>
    </main>
  );
};

export default Splash;
