import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2, Clock, Flame, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { recipes } from "@/utils/mockData";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MealImageAnalyzer } from "@/components/MealImageAnalyzer";
import grilledChickenImg from "@/assets/grilled-chicken-salad.jpg";
import yogurtParfaitImg from "@/assets/yogurt-parfait.jpg";
import lentilSoupImg from "@/assets/lentil-soup.jpg";

const recipeImages: Record<string, string> = {
  "grilled-chicken-salad.jpg": grilledChickenImg,
  "yogurt-parfait.jpg": yogurtParfaitImg,
  "lentil-soup.jpg": lentilSoupImg,
};

const Diet = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const handlePlayAudio = (recipeName: string, fullRecipe?: boolean) => {
    if (!('speechSynthesis' in window)) {
      toast.error("Text-to-speech not supported in your browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const recipeData = recipes.find(r => r.name === recipeName);
    if (!recipeData) return;

    let textToSpeak = '';
    
    if (fullRecipe) {
      // Full recipe with ingredients and instructions
      textToSpeak = `${recipeData.name}. `;
      textToSpeak += `This recipe has ${recipeData.calories} calories, ${recipeData.carbs} grams of carbohydrates, and ${recipeData.protein} grams of protein. `;
      textToSpeak += `Ingredients: ${recipeData.ingredients.join(', ')}. `;
      textToSpeak += `Instructions: ${recipeData.instructions.join('. ')}`;
    } else {
      // Short description for recipe cards
      textToSpeak = `${recipeData.name}. ${recipeData.prepTime}. ${recipeData.calories} calories, ${recipeData.carbs} grams of carbs, ${recipeData.protein} grams of protein.`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      toast.success(`Playing audio guide for: ${recipeName}`);
    };

    utterance.onerror = (event) => {
      toast.error("Error playing audio");
      console.error('Speech synthesis error:', event);
    };

    window.speechSynthesis.speak(utterance);
  };

  const recipe = selectedRecipe 
    ? recipes.find(r => r.id === selectedRecipe)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-phi-3 sm:px-phi-4 py-phi-2 sm:py-phi-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-phi-2">
          <div className="flex items-center gap-phi-2 sm:gap-phi-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="min-h-touch min-w-touch flex-shrink-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">Diet Suggestions</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">Healthy recipes for diabetes management</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="min-h-touch min-w-touch flex-shrink-0"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-phi-3 sm:px-phi-4 py-phi-3 sm:py-phi-5">
        {!selectedRecipe ? (
          <>
            {/* Meal Image Analyzer */}
            <div className="mb-phi-3 sm:mb-phi-5">
              <MealImageAnalyzer />
            </div>

            {/* Recipe Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-phi-3 sm:gap-phi-4">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {recipe.image && recipeImages[recipe.image] && (
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img 
                      src={recipeImages[recipe.image]} 
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-phi-2 right-phi-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/80 backdrop-blur min-h-touch min-w-touch"
                        onClick={() => handlePlayAudio(recipe.name, false)}
                        aria-label={`Play audio for ${recipe.name}`}
                      >
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="p-phi-3 sm:p-phi-4">
                  <div className="flex items-start justify-between mb-phi-2 sm:mb-phi-3">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{recipe.name}</h3>
                  </div>

                <div className="flex flex-wrap gap-phi-2 mb-phi-2 sm:mb-phi-3">
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    {recipe.prepTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
                    {recipe.calories} kcal
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Wheat className="h-3 w-3 sm:h-4 sm:w-4" />
                    {recipe.carbs}g carbs
                  </span>
                </div>

                <div className="mb-phi-2 sm:mb-phi-3">
                  <div className="flex justify-between text-xs sm:text-sm mb-phi-1">
                    <span className="text-muted-foreground">Protein: {recipe.protein}g</span>
                    <span className="text-muted-foreground">Fiber: {recipe.fiber}g</span>
                  </div>
                </div>

                <Button
                  className="w-full min-h-touch text-sm sm:text-base"
                  onClick={() => setSelectedRecipe(recipe.id)}
                >
                  View Recipe
                </Button>
                </div>
              </Card>
            ))}
            </div>
          </>
        ) : (
          <Card className="p-phi-3 sm:p-phi-5 max-w-3xl mx-auto">
            {recipe!.image && recipeImages[recipe!.image] && (
              <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden rounded-lg mb-phi-3 sm:mb-phi-4">
                <img 
                  src={recipeImages[recipe!.image]} 
                  alt={recipe!.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-phi-2 sm:gap-phi-3 mb-phi-3 sm:mb-phi-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">{recipe!.name}</h2>
              <Button
                variant="outline"
                size="icon"
                className="min-h-touch min-w-touch flex-shrink-0"
                onClick={() => handlePlayAudio(recipe!.name, true)}
                aria-label={`Play full audio guide for ${recipe!.name}`}
              >
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-phi-2 sm:gap-phi-3 mb-phi-4 sm:mb-phi-5">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{recipe!.calories}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{recipe!.carbs}g</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{recipe!.protein}g</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Protein</p>
              </div>
            </div>

            <div className="space-y-phi-3 sm:space-y-phi-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-phi-2">Ingredients</h3>
                <ul className="space-y-phi-1">
                  {recipe!.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-phi-2">
                      <span className="text-primary mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base text-foreground">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-phi-2">Instructions</h3>
                <ol className="space-y-phi-2">
                  {recipe!.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-phi-2 sm:gap-phi-3">
                      <span className="font-bold text-primary flex-shrink-0">{idx + 1}.</span>
                      <span className="text-sm sm:text-base text-foreground">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-phi-4 sm:mt-phi-5 min-h-touch text-sm sm:text-base"
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
