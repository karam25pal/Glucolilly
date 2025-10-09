import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, Calendar } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

type ReportPeriod = "weekly" | "monthly" | "quarterly";

export const DiabetesReportGenerator = () => {
  const { profile, weeklyStats, metrics } = useUser();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("weekly");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const reportData = {
        reportType: "Diabetes Management Report",
        period: reportPeriod,
        generatedDate: new Date().toISOString(),
        patientInfo: {
          name: profile?.name || "Patient",
          diabetesType: profile?.diabetesType || "Type 2",
          bmi: profile?.bmi,
        },
        metrics: {
          weeklyStats,
          glucoseReadings: metrics.filter(m => m.type === "glucose"),
          meals: metrics.filter(m => m.type === "meal"),
          exercise: metrics.filter(m => m.type === "exercise"),
          steps: metrics.filter(m => m.type === "steps"),
        },
        summary: {
          avgGlucose: weeklyStats.avgGlucose,
          improvement: weeklyStats.improvement,
          totalSteps: weeklyStats.totalSteps,
          exerciseSessions: weeklyStats.exerciseSessions,
        },
      };

      // Create and download report
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diabetes-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      setIsGenerating(false);
      toast.success(`${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} report generated successfully`);
    }, 1500);
  };

  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-phi-3">
              <div className="p-phi-2 bg-background rounded-lg shadow-sm">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Professional Diabetes Report</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Generate comprehensive health reports for medical professionals
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </div>

      <CardContent className="pt-phi-4">
        <div className="space-y-phi-4">
          {/* Report Stats Preview */}
          <div className="grid grid-cols-3 gap-phi-3">
            <div className="text-center p-phi-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-phi-1" />
              <p className="text-2xl font-bold text-foreground">{weeklyStats.avgGlucose}</p>
              <p className="text-xs text-muted-foreground">Avg Glucose</p>
            </div>
            <div className="text-center p-phi-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-phi-1" />
              <p className="text-2xl font-bold text-foreground">{metrics.length}</p>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </div>
            <div className="text-center p-phi-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-primary mx-auto mb-phi-1" />
              <p className="text-2xl font-bold text-primary">
                {weeklyStats.improvement > 0 ? '+' : ''}{weeklyStats.improvement}%
              </p>
              <p className="text-xs text-muted-foreground">Improvement</p>
            </div>
          </div>

          {/* Report Period Selection */}
          <div className="space-y-phi-2">
            <label className="text-sm font-medium text-foreground">Report Period</label>
            <Select value={reportPeriod} onValueChange={(value) => setReportPeriod(value as ReportPeriod)}>
              <SelectTrigger className="min-h-touch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly Report (7 days)</SelectItem>
                <SelectItem value="monthly">Monthly Report (30 days)</SelectItem>
                <SelectItem value="quarterly">Quarterly Report (90 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Features */}
          <div className="bg-muted/30 p-phi-3 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-phi-2">Report Includes:</p>
            <ul className="space-y-phi-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-phi-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Complete glucose tracking history
              </li>
              <li className="flex items-center gap-phi-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Meal and nutrition analysis
              </li>
              <li className="flex items-center gap-phi-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Exercise and activity logs
              </li>
              <li className="flex items-center gap-phi-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Trend analysis and insights
              </li>
            </ul>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="w-full min-h-touch"
            size="lg"
          >
            {isGenerating ? (
              <>Generating Report...</>
            ) : (
              <>
                <Download className="h-5 w-5 mr-phi-2" />
                Generate Professional Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};