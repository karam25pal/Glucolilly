import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
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
                  <div className="p-phi-3 sm:p-phi-4">
                    {/* Parse and display structured analysis */}
                    {analysis.split('\n\n').map((section, idx) => {
                      const lines = section.split('\n').filter(line => line.trim());
                      if (lines.length === 0) return null;

                      // Check if this is a numbered/bulleted list section
                      const hasListItems = lines.some(line => 
                        /^[\d]+\./.test(line.trim()) || /^[•\-\*]/.test(line.trim())
                      );

                      if (hasListItems) {
                        // Get section title (first line if it doesn't start with number/bullet)
                        const titleLine = lines[0];
                        const hasSectionTitle = !/^[\d]+\./.test(titleLine) && !/^[•\-\*]/.test(titleLine);
                        const items = hasSectionTitle ? lines.slice(1) : lines;

                        return (
                          <div key={idx} className="mb-phi-3 sm:mb-phi-4 last:mb-0">
                            {hasSectionTitle && (
                              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-phi-2 flex items-center gap-phi-2">
                                <Info className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                <span>{titleLine.replace(/[:#]/g, '').trim()}</span>
                              </h4>
                            )}
                            <div className="space-y-phi-2">
                              {items.map((item, itemIdx) => {
                                const cleanItem = item
                                  .replace(/^[\d]+\.\s*/, '')
                                  .replace(/^[•\-\*]\s*/, '')
                                  .trim();
                                
                                if (!cleanItem) return null;

                                // Check if item contains a label (e.g., "Carbs: 45g")
                                const labelMatch = cleanItem.match(/^([^:]+):\s*(.+)$/);
                                
                                return (
                                  <div 
                                    key={itemIdx}
                                    className="bg-background/60 backdrop-blur-sm rounded-lg px-phi-2 sm:px-phi-3 py-phi-2 border border-border/50"
                                  >
                                    {labelMatch ? (
                                      <div className="flex items-start justify-between gap-phi-2 sm:gap-phi-3">
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                          {labelMatch[1]}
                                        </span>
                                        <span className="text-xs sm:text-sm text-foreground font-semibold text-right">
                                          {labelMatch[2]}
                                        </span>
                                      </div>
                                    ) : (
                                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                                        {cleanItem}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Regular paragraph
                      return (
                        <div key={idx} className="mb-phi-2 sm:mb-phi-3 last:mb-0">
                          {lines.map((line, lineIdx) => {
                            // Check if line is a heading (contains ":" or is short and bold-worthy)
                            const isHeading = line.includes(':') && line.length < 50;
                            const [heading, ...rest] = line.split(':');
                            
                            if (isHeading && rest.length > 0) {
                              return (
                                <div key={lineIdx} className="mb-phi-2">
                                  <p className="text-xs sm:text-sm">
                                    <span className="font-semibold text-primary">
                                      {heading}:
                                    </span>
                                    <span className="text-foreground ml-1">
                                      {rest.join(':').trim()}
                                    </span>
                                  </p>
                                </div>
                              );
                            }
                            
                            return (
                              <p key={lineIdx} className="text-xs sm:text-sm text-foreground leading-relaxed mb-phi-1">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      );
                    })}
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

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full min-h-touch text-sm sm:text-base"
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