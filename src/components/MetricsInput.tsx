import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { Activity, Utensils, Dumbbell, Footprints } from "lucide-react";

type MetricType = "glucose" | "meal" | "exercise" | "steps";

export const MetricsInput = () => {
  const { addMetric } = useUser();
  const [activeType, setActiveType] = useState<MetricType | null>(null);
  const [formData, setFormData] = useState({
    glucose: "",
    mealName: "",
    mealCarbs: "",
    mealCalories: "",
    exerciseActivity: "",
    exerciseDuration: "",
    exerciseIntensity: "moderate",
    steps: "",
    notes: "",
  });

  const handleSubmit = () => {
    if (!activeType) return;

    try {
      if (activeType === "glucose") {
        if (!formData.glucose) {
          toast.error("Please enter glucose value");
          return;
        }
        addMetric({
          type: "glucose",
          value: parseFloat(formData.glucose),
          unit: "mg/dL",
          notes: formData.notes,
        });
        toast.success("Glucose reading recorded");
      } else if (activeType === "meal") {
        if (!formData.mealName) {
          toast.error("Please enter meal name");
          return;
        }
        addMetric({
          type: "meal",
          value: parseFloat(formData.mealCalories) || 0,
          unit: "kcal",
          mealDetails: {
            name: formData.mealName,
            carbs: parseFloat(formData.mealCarbs) || undefined,
            calories: parseFloat(formData.mealCalories) || undefined,
          },
          notes: formData.notes,
        });
        toast.success("Meal logged");
      } else if (activeType === "exercise") {
        if (!formData.exerciseActivity || !formData.exerciseDuration) {
          toast.error("Please enter exercise details");
          return;
        }
        addMetric({
          type: "exercise",
          value: parseFloat(formData.exerciseDuration),
          unit: "minutes",
          exerciseDetails: {
            activity: formData.exerciseActivity,
            duration: parseFloat(formData.exerciseDuration),
            intensity: formData.exerciseIntensity,
          },
          notes: formData.notes,
        });
        toast.success("Exercise logged");
      } else if (activeType === "steps") {
        if (!formData.steps) {
          toast.error("Please enter step count");
          return;
        }
        addMetric({
          type: "steps",
          value: parseInt(formData.steps),
          unit: "steps",
          notes: formData.notes,
        });
        toast.success("Steps recorded");
      }

      // Reset form
      setFormData({
        glucose: "",
        mealName: "",
        mealCarbs: "",
        mealCalories: "",
        exerciseActivity: "",
        exerciseDuration: "",
        exerciseIntensity: "moderate",
        steps: "",
        notes: "",
      });
      setActiveType(null);
    } catch (error) {
      toast.error("Failed to record metric");
    }
  };

  return (
    <Card className="p-phi-4">
      <h3 className="text-xl font-bold text-foreground mb-phi-4">Log Your Health Data</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-phi-3 mb-phi-4">
        <Button
          variant={activeType === "glucose" ? "default" : "outline"}
          onClick={() => setActiveType("glucose")}
          className="min-h-touch flex-col h-auto py-phi-3"
        >
          <Activity className="h-6 w-6 mb-phi-1" />
          <span className="text-sm">Glucose</span>
        </Button>
        <Button
          variant={activeType === "meal" ? "default" : "outline"}
          onClick={() => setActiveType("meal")}
          className="min-h-touch flex-col h-auto py-phi-3"
        >
          <Utensils className="h-6 w-6 mb-phi-1" />
          <span className="text-sm">Meal</span>
        </Button>
        <Button
          variant={activeType === "exercise" ? "default" : "outline"}
          onClick={() => setActiveType("exercise")}
          className="min-h-touch flex-col h-auto py-phi-3"
        >
          <Dumbbell className="h-6 w-6 mb-phi-1" />
          <span className="text-sm">Exercise</span>
        </Button>
        <Button
          variant={activeType === "steps" ? "default" : "outline"}
          onClick={() => setActiveType("steps")}
          className="min-h-touch flex-col h-auto py-phi-3"
        >
          <Footprints className="h-6 w-6 mb-phi-1" />
          <span className="text-sm">Steps</span>
        </Button>
      </div>

      {activeType && (
        <div className="space-y-phi-3 animate-fade-in">
          {activeType === "glucose" && (
            <div>
              <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
              <Input
                id="glucose"
                type="number"
                value={formData.glucose}
                onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
                placeholder="e.g., 120"
                className="mt-phi-1 min-h-touch"
              />
            </div>
          )}

          {activeType === "meal" && (
            <>
              <div>
                <Label htmlFor="mealName">Meal Name</Label>
                <Input
                  id="mealName"
                  value={formData.mealName}
                  onChange={(e) => setFormData({ ...formData, mealName: e.target.value })}
                  placeholder="e.g., Grilled chicken salad"
                  className="mt-phi-1 min-h-touch"
                />
              </div>
              <div className="grid grid-cols-2 gap-phi-3">
                <div>
                  <Label htmlFor="mealCarbs">Carbs (g)</Label>
                  <Input
                    id="mealCarbs"
                    type="number"
                    value={formData.mealCarbs}
                    onChange={(e) => setFormData({ ...formData, mealCarbs: e.target.value })}
                    placeholder="Optional"
                    className="mt-phi-1 min-h-touch"
                  />
                </div>
                <div>
                  <Label htmlFor="mealCalories">Calories</Label>
                  <Input
                    id="mealCalories"
                    type="number"
                    value={formData.mealCalories}
                    onChange={(e) => setFormData({ ...formData, mealCalories: e.target.value })}
                    placeholder="Optional"
                    className="mt-phi-1 min-h-touch"
                  />
                </div>
              </div>
            </>
          )}

          {activeType === "exercise" && (
            <>
              <div>
                <Label htmlFor="exerciseActivity">Activity</Label>
                <Input
                  id="exerciseActivity"
                  value={formData.exerciseActivity}
                  onChange={(e) => setFormData({ ...formData, exerciseActivity: e.target.value })}
                  placeholder="e.g., Brisk walking"
                  className="mt-phi-1 min-h-touch"
                />
              </div>
              <div>
                <Label htmlFor="exerciseDuration">Duration (minutes)</Label>
                <Input
                  id="exerciseDuration"
                  type="number"
                  value={formData.exerciseDuration}
                  onChange={(e) => setFormData({ ...formData, exerciseDuration: e.target.value })}
                  placeholder="e.g., 30"
                  className="mt-phi-1 min-h-touch"
                />
              </div>
            </>
          )}

          {activeType === "steps" && (
            <div>
              <Label htmlFor="steps">Step Count</Label>
              <Input
                id="steps"
                type="number"
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                placeholder="e.g., 8000"
                className="mt-phi-1 min-h-touch"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              className="mt-phi-1 min-h-[80px]"
            />
          </div>

          <div className="flex gap-phi-3">
            <Button
              variant="outline"
              onClick={() => setActiveType(null)}
              className="flex-1 min-h-touch"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 min-h-touch">
              Save
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
