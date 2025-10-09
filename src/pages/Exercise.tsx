import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2, Clock, Flame, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exerciseGuides } from "@/utils/mockData";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Exercise = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const handlePlayAudio = (exerciseName: string) => {
    toast.success(`Playing audio guide for: ${exerciseName}`);
    // In production, this would use text-to-speech or pre-recorded audio
  };

  const exercise = selectedExercise 
    ? exerciseGuides.find(e => e.id === selectedExercise)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-phi-4 py-phi-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-phi-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="min-h-touch min-w-touch"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Exercise Guides</h1>
              <p className="text-sm text-muted-foreground">Safe and effective workouts</p>
            </div>
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

      <main className="max-w-7xl mx-auto px-phi-4 py-phi-5">
        {!selectedExercise ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-phi-4">
            {exerciseGuides.map((exercise) => (
              <Card key={exercise.id} className="p-phi-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-phi-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{exercise.name}</h3>
                    <span className="inline-block mt-phi-1 px-phi-2 py-1 bg-primary/10 text-primary text-sm rounded">
                      {exercise.type}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayAudio(exercise.name)}
                    aria-label={`Play audio for ${exercise.name}`}
                  >
                    <Volume2 className="h-5 w-5 text-primary" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-phi-2 mb-phi-3">
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {exercise.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    ~{exercise.caloriesBurned} cal
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-phi-3">
                  {exercise.benefits}
                </p>

                <Button
                  className="w-full min-h-touch"
                  onClick={() => setSelectedExercise(exercise.id)}
                >
                  View Guide
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-phi-5 max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-phi-4">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-phi-2">{exercise!.name}</h2>
                <span className="inline-block px-phi-3 py-phi-1 bg-primary/10 text-primary rounded">
                  {exercise!.type} • {exercise!.intensity}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePlayAudio(exercise!.name)}
                aria-label={`Play full audio guide for ${exercise!.name}`}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-phi-3 mb-phi-5">
              <div>
                <p className="text-sm text-muted-foreground mb-phi-1">Duration</p>
                <p className="text-2xl font-bold text-foreground">{exercise!.duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-phi-1">Calories Burned</p>
                <p className="text-2xl font-bold text-foreground">~{exercise!.caloriesBurned}</p>
              </div>
            </div>

            <div className="space-y-phi-4">
              <div className="p-phi-4 bg-primary/5 rounded-lg">
                <h3 className="font-bold text-foreground mb-phi-2">Benefits</h3>
                <p className="text-foreground">{exercise!.benefits}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-phi-2">Step-by-Step Guide</h3>
                <ol className="space-y-phi-3">
                  {exercise!.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-phi-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-foreground pt-1">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-phi-4 bg-destructive/10 rounded-lg flex gap-phi-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-phi-1">Safety Note</h3>
                  <p className="text-foreground">{exercise!.cautions}</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-phi-5 min-h-touch"
              onClick={() => setSelectedExercise(null)}
            >
              Back to Exercises
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Exercise;
