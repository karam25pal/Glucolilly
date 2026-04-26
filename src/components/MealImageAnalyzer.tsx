import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle, Info, Apple, TrendingUp, TrendingDown, Activity, Minus, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MealImageAnalyzer = () => {
  const { profile, weeklyStats, addMetric } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [mealData, setMealData] = useState<{
    name: string;
    carbs?: number;
    protein?: number;
    calories?: number;
    fiber?: number;
    impact?: "low" | "moderate" | "high";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const diabetesStats = {
        diabetesType: profile?.diabetesType || "Type 2",
        avgGlucose: weeklyStats.avgGlucose,
        bmi: profile?.bmi,
        improvement: weeklyStats.improvement,
      };

      const { data, error } = await supabase.functions.invoke('analyze-meal-image', {
        body: {
          imageBase64: selectedImage,
          diabetesStats
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        // Clean up markdown formatting
        const cleanedAnalysis = data.analysis
          .replace(/\*\*/g, '') // Remove bold markers
          .replace(/^[\-\*]\s+/gm, '') // Remove leading bullets/dashes
          .replace(/\*/g, ''); // Remove any remaining asterisks
        
        setAnalysis(cleanedAnalysis);
        
        // Extract meal data from analysis
        const carbsMatch = cleanedAnalysis.match(/carb[s]?[:\s]+(\d+)[\s]*g/i);
        const proteinMatch = cleanedAnalysis.match(/protein[:\s]+(\d+)[\s]*g/i);
        const fiberMatch = cleanedAnalysis.match(/fiber[:\s]+(\d+)[\s]*g/i);
        const caloriesMatch = cleanedAnalysis.match(/calor[iy]+[es]*[:\s]+(\d+)/i);
        const mealNameMatch = cleanedAnalysis.match(/^([^.!?\n]+)/);

        const lower = cleanedAnalysis.toLowerCase();
        const impact: "low" | "moderate" | "high" =
          lower.includes("high") && lower.includes("sugar")
            ? "high"
            : lower.includes("low")
              ? "low"
              : "moderate";

        setMealData({
          name: mealNameMatch?.[1]?.trim() || "Analyzed Meal",
          carbs: carbsMatch ? parseInt(carbsMatch[1]) : undefined,
          protein: proteinMatch ? parseInt(proteinMatch[1]) : undefined,
          calories: caloriesMatch ? parseInt(caloriesMatch[1]) : undefined,
          fiber: fiberMatch ? parseInt(fiberMatch[1]) : undefined,
          impact,
        });
        
        toast.success("Meal analyzed successfully!");
      } else {
        throw new Error("No analysis received");
      }
    } catch (error) {
      console.error("Error analyzing meal:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze meal");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToMetrics = useCallback(() => {
    if (!mealData) return;

    addMetric({
      type: "meal",
      value: mealData.calories || 0,
      unit: "kcal",
      mealDetails: {
        name: mealData.name,
        carbs: mealData.carbs,
        calories: mealData.calories,
        protein: mealData.protein,
        fiber: mealData.fiber,
        impact: mealData.impact,
        imageUrl: selectedImage || undefined,
        analysis: analysis || undefined,
      },
      notes: "Logged from AI Meal Analyzer",
    });

    toast.success("Meal saved to your history!");
    handleReset();
  }, [mealData, addMetric, selectedImage, analysis]);

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setMealData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent p-phi-4 md:p-phi-5">
        <CardTitle className="text-xl md:text-2xl">AI Meal Analyzer</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Upload or capture a photo of your meal for personalized diabetes-friendly suggestions
        </CardDescription>
      </CardHeader>

      <CardContent className="p-phi-3 md:p-phi-4 lg:p-phi-5">
        {!selectedImage ? (
          <div className="space-y-phi-3 md:space-y-phi-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-phi-3">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-touch h-24 sm:h-32 flex-col gap-phi-2"
                variant="outline"
              >
                <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-sm sm:text-base">Take Photo</span>
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="min-h-touch h-24 sm:h-32 flex-col gap-phi-2"
                variant="outline"
              >
                <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-sm sm:text-base">Upload Image</span>
              </Button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="bg-muted/30 p-phi-3 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                💡 <strong>Tip:</strong> Take clear photos of your meals for best results. 
                The AI will analyze nutritional content and provide diabetes-friendly recommendations 
                based on your health stats.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-phi-3 md:space-y-phi-4">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={selectedImage}
                alt="Selected meal"
                className="w-full h-auto max-h-64 sm:max-h-80 md:max-h-96 object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-phi-2 right-phi-2 h-8 w-8 sm:h-10 sm:w-10"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!analysis ? (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full min-h-touch text-sm sm:text-base"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-phi-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Meal"
                )}
              </Button>
            ) : (
              <div className="space-y-phi-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-phi-4">
                  {/* Left: Visual Analysis */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-lg overflow-hidden">
                      {/* Header */}
                      <div className="bg-primary/10 px-phi-3 sm:px-phi-4 py-phi-2 sm:py-phi-3 border-b border-primary/20">
                        <div className="flex items-center gap-phi-2">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-primary">
                            Analysis Complete
                          </h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-phi-3 sm:p-phi-4 space-y-phi-4">
                    {/* Extract and visualize key metrics */}
                    {(() => {
                      // Parse nutritional values from analysis
                      const carbsMatch = analysis.match(/carb[s]?[:\s]+(\d+)[\s]*g/i);
                      const proteinMatch = analysis.match(/protein[:\s]+(\d+)[\s]*g/i);
                      const fiberMatch = analysis.match(/fiber[:\s]+(\d+)[\s]*g/i);
                      const caloriesMatch = analysis.match(/calor[iy]+[es]*[:\s]+(\d+)/i);
                      
                      const carbs = carbsMatch ? parseInt(carbsMatch[1]) : null;
                      const protein = proteinMatch ? parseInt(proteinMatch[1]) : null;
                      const fiber = fiberMatch ? parseInt(fiberMatch[1]) : null;
                      const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : null;

                      // Determine impact level
                      const getImpact = () => {
                        if (analysis.toLowerCase().includes('high') && analysis.toLowerCase().includes('sugar')) return 'high';
                        if (analysis.toLowerCase().includes('moderate')) return 'moderate';
                        if (analysis.toLowerCase().includes('low')) return 'low';
                        return 'moderate';
                      };
                      
                      const impact = getImpact();
                      const impactColors = {
                        high: 'text-destructive',
                        moderate: 'text-yellow-600 dark:text-yellow-500',
                        low: 'text-green-600 dark:text-green-500'
                      };
                      
                      const impactIcons = {
                        high: TrendingUp,
                        moderate: Minus,
                        low: TrendingDown
                      };
                      
                      const ImpactIcon = impactIcons[impact];

                      return (
                        <>
                          {/* Impact Badge */}
                          <div className="flex items-center justify-center gap-phi-2">
                            <ImpactIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${impactColors[impact]}`} />
                            <span className={`text-lg sm:text-xl font-bold ${impactColors[impact]}`}>
                              {impact === 'high' ? '⚠️ High Impact' : impact === 'moderate' ? '⚡ Moderate Impact' : '✅ Low Impact'}
                            </span>
                          </div>

                          {/* Nutritional Metrics Grid */}
                          <div className="grid grid-cols-2 gap-phi-3">
                            {calories && (
                              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg p-phi-3 border border-orange-500/20">
                                <div className="flex items-center gap-phi-2 mb-phi-1">
                                  <Activity className="h-4 w-4 text-orange-500" />
                                  <span className="text-xs text-muted-foreground">Calories</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{calories}</p>
                                <p className="text-xs text-muted-foreground">kcal</p>
                              </div>
                            )}
                            
                            {carbs && (
                              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-phi-3 border border-blue-500/20">
                                <div className="flex items-center gap-phi-2 mb-phi-1">
                                  <Apple className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs text-muted-foreground">Carbs</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{carbs}g</p>
                                <Progress value={Math.min((carbs / 60) * 100, 100)} className="h-1.5 mt-phi-2" />
                              </div>
                            )}
                            
                            {protein && (
                              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-phi-3 border border-green-500/20">
                                <div className="flex items-center gap-phi-2 mb-phi-1">
                                  <span className="text-base">💪</span>
                                  <span className="text-xs text-muted-foreground">Protein</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{protein}g</p>
                                <Progress value={Math.min((protein / 30) * 100, 100)} className="h-1.5 mt-phi-2" />
                              </div>
                            )}
                            
                            {fiber && (
                              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-phi-3 border border-purple-500/20">
                                <div className="flex items-center gap-phi-2 mb-phi-1">
                                  <span className="text-base">🌾</span>
                                  <span className="text-xs text-muted-foreground">Fiber</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{fiber}g</p>
                                <Progress value={Math.min((fiber / 10) * 100, 100)} className="h-1.5 mt-phi-2" />
                              </div>
                            )}
                          </div>

                          {/* Key Points as Badges */}
                          <div className="space-y-phi-2">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-phi-2">
                              <Info className="h-4 w-4 text-primary" />
                              Key Points
                            </h4>
                            <div className="flex flex-wrap gap-phi-2">
                              {analysis.toLowerCase().includes('whole grain') && (
                                <Badge variant="secondary" className="text-xs">🌾 Whole Grain</Badge>
                              )}
                              {analysis.toLowerCase().includes('lean protein') && (
                                <Badge variant="secondary" className="text-xs">💪 Lean Protein</Badge>
                              )}
                              {(analysis.toLowerCase().includes('low gi') || analysis.toLowerCase().includes('low glycemic')) && (
                                <Badge variant="secondary" className="text-xs">📉 Low GI</Badge>
                              )}
                              {analysis.toLowerCase().includes('fiber') && (
                                <Badge variant="secondary" className="text-xs">🌾 High Fiber</Badge>
                              )}
                              {analysis.toLowerCase().includes('omega') && (
                                <Badge variant="secondary" className="text-xs">🐟 Omega-3</Badge>
                              )}
                              {analysis.toLowerCase().includes('vegetable') && (
                                <Badge variant="secondary" className="text-xs">🥗 Vegetables</Badge>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                      </div>

                      {/* Footer tip */}
                      <div className="bg-muted/30 px-phi-3 sm:px-phi-4 py-phi-2 sm:py-phi-3 border-t border-border/50">
                        <div className="flex items-start gap-phi-2">
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            These are AI-generated estimates. For precise nutritional information, 
                            consult with your healthcare provider or a registered dietitian.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Simple Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-muted/20 rounded-lg p-phi-4 h-full">
                      <h4 className="text-sm font-semibold text-foreground mb-phi-3">Summary</h4>
                      <div className="space-y-phi-2 text-xs text-muted-foreground/70 leading-relaxed">
                        {analysis.split('\n').filter(line => line.trim().length > 30).slice(0, 5).map((line, idx) => (
                          <p key={idx} className="border-l-2 border-muted-foreground/20 pl-phi-2">
                            {line.trim()}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-phi-3">
                  <Button
                    variant="default"
                    onClick={handleSaveToMetrics}
                    className="flex-1 min-h-touch text-sm sm:text-base"
                    disabled={!mealData}
                  >
                    <Save className="h-4 w-4 mr-phi-2" />
                    Save to Metrics
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 min-h-touch text-sm sm:text-base"
                  >
                    Analyze Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};