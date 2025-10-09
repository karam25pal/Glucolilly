import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, DiabetesType } from "@/contexts/UserContext";
import { ArrowRight, ArrowLeft } from "lucide-react";

const diabetesOptions: { value: DiabetesType; label: string; description: string }[] = [
  { value: "type1", label: "Type 1", description: "Body doesn't produce insulin" },
  { value: "type2", label: "Type 2", description: "Body doesn't use insulin properly" },
  { value: "gestational", label: "Gestational", description: "Develops during pregnancy" },
  { value: "prediabetic", label: "Prediabetic", description: "Blood sugar higher than normal" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { setProfile } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    diabetesType: "" as DiabetesType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
        newErrors.age = "Valid age required";
      }
    } else if (step === 2) {
      if (!formData.height || parseInt(formData.height) < 50 || parseInt(formData.height) > 300) {
        newErrors.height = "Valid height required (50-300 cm)";
      }
      if (!formData.weight || parseInt(formData.weight) < 20 || parseInt(formData.weight) > 300) {
        newErrors.weight = "Valid weight required (20-300 kg)";
      }
    } else if (step === 3) {
      if (!formData.diabetesType) newErrors.diabetesType = "Please select your diabetes type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 3) {
        setProfile({
          name: formData.name,
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          weight: parseInt(formData.weight),
          diabetesType: formData.diabetesType,
        });
        navigate('/dashboard');
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <main className="min-h-screen bg-background px-phi-4 py-phi-5 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-phi-5">
        <div className="mb-phi-5">
          <h1 className="text-3xl font-bold text-primary mb-phi-2">
            Welcome to GlucoLilly
          </h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
          <div className="mt-phi-3 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-phi-4">
            <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
            <div className="space-y-phi-3">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="mt-phi-1 min-h-touch"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive mt-phi-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter your age"
                  className="mt-phi-1 min-h-touch"
                  aria-invalid={!!errors.age}
                />
                {errors.age && <p className="text-sm text-destructive mt-phi-1">{errors.age}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-phi-4">
            <h2 className="text-2xl font-bold text-foreground">Your measurements</h2>
            <div className="space-y-phi-3">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="e.g., 175"
                  className="mt-phi-1 min-h-touch"
                  aria-invalid={!!errors.height}
                />
                {errors.height && <p className="text-sm text-destructive mt-phi-1">{errors.height}</p>}
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g., 70"
                  className="mt-phi-1 min-h-touch"
                  aria-invalid={!!errors.weight}
                />
                {errors.weight && <p className="text-sm text-destructive mt-phi-1">{errors.weight}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-phi-4">
            <h2 className="text-2xl font-bold text-foreground">Diabetes Type</h2>
            <p className="text-muted-foreground">Select the type that applies to you</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-phi-3">
              {diabetesOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`p-phi-4 cursor-pointer transition-all border-2 min-h-touch ${
                    formData.diabetesType === option.value
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, diabetesType: option.value })}
                  role="radio"
                  aria-checked={formData.diabetesType === option.value}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setFormData({ ...formData, diabetesType: option.value });
                    }
                  }}
                >
                  <h3 className="font-bold text-lg mb-phi-1">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </Card>
              ))}
            </div>
            {errors.diabetesType && (
              <p className="text-sm text-destructive">{errors.diabetesType}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-phi-5">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="min-h-touch"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} className="min-h-touch">
            {step === 3 ? 'Complete' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </main>
  );
};

export default Onboarding;
