import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, type HealthMetric } from "@/contexts/UserContext";
import { Apple, Activity, Clock, History, ImageOff, TrendingDown, TrendingUp, Minus } from "lucide-react";

const impactStyles: Record<string, { label: string; className: string; Icon: typeof TrendingUp }> = {
  low: { label: "Low Impact", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", Icon: TrendingDown },
  moderate: { label: "Moderate", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", Icon: Minus },
  high: { label: "High Impact", className: "bg-destructive/10 text-destructive border-destructive/20", Icon: TrendingUp },
};

export const MealHistory = () => {
  const { metrics } = useUser();
  const [selected, setSelected] = useState<HealthMetric | null>(null);

  const meals = useMemo(
    () => metrics.filter((m) => m.type === "meal" && !!m.mealDetails?.imageUrl).slice(0, 50),
    [metrics]
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-phi-2">
            <div className="p-phi-2 bg-primary/10 rounded-lg">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Meal History</CardTitle>
              <CardDescription>Tap any meal to see full details</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-phi-5 text-center">
              <div className="p-phi-3 bg-muted rounded-full mb-phi-3">
                <Apple className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No meals recorded yet</p>
              <p className="text-xs text-muted-foreground mt-phi-1">
                Use the Meal Analyzer above to record your first meal
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[420px] pr-phi-2">
              <ul className="space-y-phi-2">
                {meals.map((meal) => {
                  const impact = meal.mealDetails?.impact;
                  const impactCfg = impact ? impactStyles[impact] : null;
                  const date = new Date(meal.timestamp);
                  return (
                    <li key={meal.id}>
                      <button
                        onClick={() => setSelected(meal)}
                        className="w-full text-left flex items-center gap-phi-3 p-phi-2 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/40 transition-colors"
                      >
                        <div className="h-14 w-14 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                          {meal.mealDetails?.imageUrl ? (
                            <img
                              src={meal.mealDetails.imageUrl}
                              alt={meal.mealDetails.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-phi-2">
                            <p className="font-semibold text-foreground truncate">
                              {meal.mealDetails?.name || "Meal"}
                            </p>
                            {impactCfg && (
                              <Badge variant="outline" className={`text-xs ${impactCfg.className}`}>
                                {impactCfg.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-phi-3 mt-phi-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {meal.mealDetails?.calories ?? "—"} kcal
                            </span>
                            <span>{meal.mealDetails?.carbs ?? "—"}g carbs</span>
                            <span className="flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" />
                              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {selected?.mealDetails?.name || "Meal"}
            </DialogTitle>
            <DialogDescription>
              {selected && new Date(selected.timestamp).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-phi-3">
              {selected.mealDetails?.imageUrl && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selected.mealDetails.imageUrl}
                    alt={selected.mealDetails.name}
                    className="w-full h-auto max-h-80 object-contain"
                  />
                </div>
              )}

              {selected.mealDetails?.impact && (() => {
                const cfg = impactStyles[selected.mealDetails.impact];
                const Icon = cfg.Icon;
                return (
                  <div className={`flex items-center justify-center gap-phi-2 p-phi-2 rounded-lg border ${cfg.className}`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{cfg.label}</span>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-phi-2">
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-phi-2 text-center">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="text-xl font-bold">{selected.mealDetails?.calories ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-phi-2 text-center">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-xl font-bold">{selected.mealDetails?.carbs ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">grams</p>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-phi-2 text-center">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-xl font-bold">{selected.mealDetails?.protein ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">grams</p>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-phi-2 text-center">
                  <p className="text-xs text-muted-foreground">Fiber</p>
                  <p className="text-xl font-bold">{selected.mealDetails?.fiber ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">grams</p>
                </div>
              </div>

              {selected.mealDetails?.analysis && (
                <div className="bg-muted/30 rounded-lg p-phi-3">
                  <h4 className="text-sm font-semibold mb-phi-2">Full Analysis</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {selected.mealDetails.analysis}
                  </p>
                </div>
              )}

              {selected.notes && (
                <p className="text-xs text-muted-foreground italic">{selected.notes}</p>
              )}

              <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
