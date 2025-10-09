import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, Calendar } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import jsPDF from "jspdf";

type ReportPeriod = "weekly" | "monthly" | "quarterly";

export const DiabetesReportGenerator = () => {
  const { profile, weeklyStats, metrics } = useUser();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("weekly");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      pdf.setFontSize(22);
      pdf.setTextColor(214, 40, 40);
      pdf.text("Professional Diabetes Report", pageWidth / 2, yPos, { align: "center" });
      
      yPos += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" });
      
      // Patient Information
      yPos += 15;
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Patient Information", 20, yPos);
      
      yPos += 8;
      pdf.setFontSize(10);
      pdf.text(`Name: ${profile?.name || "Patient"}`, 20, yPos);
      yPos += 6;
      pdf.text(`Diabetes Type: ${profile?.diabetesType || "Type 2"}`, 20, yPos);
      yPos += 6;
      pdf.text(`BMI: ${profile?.bmi || "N/A"}`, 20, yPos);
      yPos += 6;
      pdf.text(`Report Period: ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}`, 20, yPos);

      // Summary Statistics
      yPos += 15;
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Summary Statistics", 20, yPos);
      
      yPos += 8;
      pdf.setFontSize(10);
      pdf.text(`Average Glucose: ${weeklyStats.avgGlucose} mg/dL`, 20, yPos);
      yPos += 6;
      pdf.text(`Improvement: ${weeklyStats.improvement > 0 ? '+' : ''}${weeklyStats.improvement}%`, 20, yPos);
      yPos += 6;
      pdf.text(`Total Steps: ${weeklyStats.totalSteps.toLocaleString()}`, 20, yPos);
      yPos += 6;
      pdf.text(`Exercise Sessions: ${weeklyStats.exerciseSessions}`, 20, yPos);

      // Glucose Readings
      const glucoseReadings = metrics.filter(m => m.type === "glucose").slice(0, 10);
      if (glucoseReadings.length > 0) {
        yPos += 15;
        pdf.setFontSize(14);
        pdf.text("Recent Glucose Readings", 20, yPos);
        
        yPos += 8;
        pdf.setFontSize(9);
        glucoseReadings.forEach((reading, idx) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          const date = new Date(reading.timestamp).toLocaleDateString();
          const time = new Date(reading.timestamp).toLocaleTimeString();
          pdf.text(`${idx + 1}. ${date} ${time}: ${Math.round(reading.value)} mg/dL`, 25, yPos);
          yPos += 5;
        });
      }

      // Recent Meals
      const meals = metrics.filter(m => m.type === "meal").slice(0, 5);
      if (meals.length > 0) {
        yPos += 10;
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(14);
        pdf.text("Recent Meals", 20, yPos);
        
        yPos += 8;
        pdf.setFontSize(9);
        meals.forEach((meal, idx) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          const date = new Date(meal.timestamp).toLocaleDateString();
          pdf.text(`${idx + 1}. ${date}: ${meal.mealDetails?.name || "Meal"}`, 25, yPos);
          yPos += 5;
          if (meal.mealDetails?.carbs) {
            pdf.text(`   Carbs: ${meal.mealDetails.carbs}g, Calories: ${meal.mealDetails.calories || 0}`, 25, yPos);
            yPos += 5;
          }
        });
      }

      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: "center" });
        pdf.text("GlucoLilly - Professional Diabetes Management", pageWidth / 2, 290, { align: "center" });
      }

      // Save PDF
      pdf.save(`diabetes-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
      
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