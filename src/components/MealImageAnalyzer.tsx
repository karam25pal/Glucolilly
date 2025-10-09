import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MealImageAnalyzer = () => {
  const { profile, weeklyStats } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
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
        setAnalysis(data.analysis);
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

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent">
        <CardTitle className="text-2xl">AI Meal Analyzer</CardTitle>
        <CardDescription>
          Upload or capture a photo of your meal for personalized diabetes-friendly suggestions
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-phi-4">
        {!selectedImage ? (
          <div className="space-y-phi-4">
            <div className="grid grid-cols-2 gap-phi-3">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-touch flex-col h-32"
                variant="outline"
              >
                <Camera className="h-8 w-8 mb-phi-2" />
                <span>Take Photo</span>
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="min-h-touch flex-col h-32"
                variant="outline"
              >
                <Upload className="h-8 w-8 mb-phi-2" />
                <span>Upload Image</span>
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
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Take clear photos of your meals for best results. 
                The AI will analyze nutritional content and provide diabetes-friendly recommendations 
                based on your health stats.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-phi-4">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={selectedImage}
                alt="Selected meal"
                className="w-full h-auto max-h-96 object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-phi-2 right-phi-2"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!analysis ? (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full min-h-touch"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-phi-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Meal"
                )}
              </Button>
            ) : (
              <div className="space-y-phi-3">
                <div className="bg-gradient-to-br from-primary/5 to-accent p-phi-4 rounded-lg">
                  <h3 className="text-lg font-bold text-primary mb-phi-2">
                    AI Analysis Results
                  </h3>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {analysis}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full min-h-touch"
                >
                  Analyze Another Meal
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};