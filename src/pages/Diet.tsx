import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2, Clock, Flame, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { recipes } from "@/utils/mockData";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Diet = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const handlePlayAudio = (recipeName: string) => {
    toast.success(`Playing audio guide for: ${recipeName}`);
    // In production, this would use text-to-speech or pre-recorded audio
  };

  const recipe = selectedRecipe 
    ? recipes.find(r => r.id === selectedRecipe)
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
              <h1 className="text-2xl font-bold text-primary">Diet Suggestions</h1>
              <p className="text-sm text-muted-foreground">Healthy recipes for diabetes management</p>
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
        {!selectedRecipe ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-phi-4">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="p-phi-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-phi-3">
                  <h3 className="text-xl font-bold text-foreground">{recipe.name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayAudio(recipe.name)}
                    aria-label={`Play audio for ${recipe.name}`}
                  >
                    <Volume2 className="h-5 w-5 text-primary" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-phi-2 mb-phi-3">
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {recipe.prepTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4" />
                    {recipe.calories} kcal
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Wheat className="h-4 w-4" />
                    {recipe.carbs}g carbs
                  </span>
                </div>

                <div className="mb-phi-3">
                  <div className="flex justify-between text-sm mb-phi-1">
                    <span className="text-muted-foreground">Protein: {recipe.protein}g</span>
                    <span className="text-muted-foreground">Fiber: {recipe.fiber}g</span>
                  </div>
                </div>

                <Button
                  className="w-full min-h-touch"
                  onClick={() => setSelectedRecipe(recipe.id)}
                >
                  View Recipe
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-phi-5 max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-phi-4">
              <h2 className="text-3xl font-bold text-primary">{recipe!.name}</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePlayAudio(recipe!.name)}
                aria-label={`Play full audio guide for ${recipe!.name}`}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-phi-3 mb-phi-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{recipe!.calories}</p>
                <p className="text-sm text-muted-foreground">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{recipe!.carbs}g</p>
                <p className="text-sm text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{recipe!.protein}g</p>
                <p className="text-sm text-muted-foreground">Protein</p>
              </div>
            </div>

            <div className="space-y-phi-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-phi-2">Ingredients</h3>
                <ul className="space-y-phi-1">
                  {recipe!.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-phi-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-foreground">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-phi-2">Instructions</h3>
                <ol className="space-y-phi-2">
                  {recipe!.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-phi-3">
                      <span className="font-bold text-primary">{idx + 1}.</span>
                      <span className="text-foreground">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-phi-5 min-h-touch"
              onClick={() => setSelectedRecipe(null)}
            >
              Back to Recipes
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Diet;
