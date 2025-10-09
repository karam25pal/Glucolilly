import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, Calendar } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

type ReportPeriod = "weekly" | "monthly" | "quarterly";

export const DiabetesReportGenerator = () => {
  const { profile, weeklyStats, metrics } = useUser();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("weekly");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    setTimeout(async () => {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Cover Page with Gradient Background
      pdf.setFillColor(214, 40, 40);
      pdf.rect(0, 0, pageWidth, 60, 'F');
      
      pdf.setFontSize(32);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Glucose Lilly", pageWidth / 2, 35, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.text("Professional Diabetes Management Report", pageWidth / 2, 50, { align: "center" });

      // Patient Info Box
      yPos = 75;
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, 'F');
      
      pdf.setFontSize(14);
      pdf.setTextColor(214, 40, 40);
      pdf.text("Patient Information", 20, yPos + 10);
      
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Name: ${profile?.name || "Patient"}`, 25, yPos + 20);
      pdf.text(`Diabetes Type: ${profile?.diabetesType || "Type 2"}`, 25, yPos + 28);
      pdf.text(`BMI: ${profile?.bmi || "N/A"}`, 25, yPos + 36);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 80, yPos + 20);
      pdf.text(`Period: ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}`, pageWidth - 80, yPos + 28);

      // Key Metrics Dashboard
      yPos = 135;
      pdf.setFontSize(16);
      pdf.setTextColor(214, 40, 40);
      pdf.text("Key Health Metrics", 20, yPos);

      // Draw metric cards
      const metrics_data = [
        { label: "Avg Glucose", value: `${weeklyStats.avgGlucose} mg/dL`, color: [214, 40, 40] },
        { label: "Improvement", value: `${weeklyStats.improvement > 0 ? '+' : ''}${weeklyStats.improvement}%`, color: [34, 197, 94] },
        { label: "Total Steps", value: weeklyStats.totalSteps.toLocaleString(), color: [59, 130, 246] },
        { label: "Workouts", value: `${weeklyStats.exerciseSessions}`, color: [168, 85, 247] }
      ];

      let xPos = 20;
      yPos = 145;
      metrics_data.forEach((metric, idx) => {
        if (idx === 2) {
          xPos = 20;
          yPos = 175;
        }
        
        pdf.setFillColor(250, 250, 250);
        pdf.roundedRect(xPos, yPos, 85, 22, 2, 2, 'F');
        
        pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        pdf.circle(xPos + 8, yPos + 11, 3, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(metric.label, xPos + 15, yPos + 9);
        
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(metric.value, xPos + 15, yPos + 17);
        
        xPos += 90;
      });

      // Glucose Trend Chart
      yPos = 210;
      pdf.setFontSize(16);
      pdf.setTextColor(214, 40, 40);
      pdf.text("Glucose Trend Analysis", 20, yPos);

      const glucoseReadings = metrics.filter(m => m.type === "glucose").slice(0, 10).reverse();
      if (glucoseReadings.length > 0) {
        yPos += 10;
        const chartHeight = 50;
        const chartWidth = pageWidth - 40;
        const maxGlucose = Math.max(...glucoseReadings.map(r => r.value));
        const minGlucose = Math.min(...glucoseReadings.map(r => r.value));
        const range = maxGlucose - minGlucose || 50;

        // Draw chart background
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, yPos, chartWidth, chartHeight, 'F');
        
        // Draw grid lines
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.1);
        for (let i = 0; i <= 4; i++) {
          const y = yPos + (chartHeight / 4) * i;
          pdf.line(20, y, 20 + chartWidth, y);
        }

        // Draw glucose line
        pdf.setDrawColor(214, 40, 40);
        pdf.setLineWidth(2);
        glucoseReadings.forEach((reading, idx) => {
          if (idx > 0) {
            const x1 = 20 + ((chartWidth / (glucoseReadings.length - 1)) * (idx - 1));
            const y1 = yPos + chartHeight - ((glucoseReadings[idx - 1].value - minGlucose) / range * chartHeight);
            const x2 = 20 + ((chartWidth / (glucoseReadings.length - 1)) * idx);
            const y2 = yPos + chartHeight - ((reading.value - minGlucose) / range * chartHeight);
            pdf.line(x1, y1, x2, y2);
          }
          
          // Draw data points
          const x = 20 + ((chartWidth / (glucoseReadings.length - 1)) * idx);
          const y = yPos + chartHeight - ((reading.value - minGlucose) / range * chartHeight);
          pdf.setFillColor(214, 40, 40);
          pdf.circle(x, y, 2, 'F');
        });

        // Y-axis labels
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${Math.round(maxGlucose)}`, 15, yPos + 5, { align: "right" });
        pdf.text(`${Math.round(minGlucose)}`, 15, yPos + chartHeight, { align: "right" });
      }

      // New Page for Detailed Data
      pdf.addPage();
      yPos = 20;

      // Glucose Readings Table
      pdf.setFontSize(16);
      pdf.setTextColor(214, 40, 40);
      pdf.text("Detailed Glucose Readings", 20, yPos);
      
      const glucoseTableData = glucoseReadings.slice(0, 15).map(reading => [
        new Date(reading.timestamp).toLocaleDateString(),
        new Date(reading.timestamp).toLocaleTimeString(),
        `${Math.round(reading.value)} mg/dL`,
        reading.notes || "-"
      ]);

      autoTable(pdf, {
        startY: yPos + 5,
        head: [['Date', 'Time', 'Glucose Level', 'Notes']],
        body: glucoseTableData,
        theme: 'grid',
        headStyles: { fillColor: [214, 40, 40], textColor: 255 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 20, right: 20 },
      });

      yPos = (pdf as any).lastAutoTable.finalY + 15;

      // Meals Summary
      const meals = metrics.filter(m => m.type === "meal").slice(0, 10);
      if (meals.length > 0 && yPos < 250) {
        pdf.setFontSize(16);
        pdf.setTextColor(214, 40, 40);
        pdf.text("Recent Meals & Nutrition", 20, yPos);
        
        const mealsTableData = meals.map(meal => [
          new Date(meal.timestamp).toLocaleDateString(),
          meal.mealDetails?.name || "Meal",
          `${meal.mealDetails?.carbs || 0}g`,
          `${meal.mealDetails?.calories || 0}`,
        ]);

        autoTable(pdf, {
          startY: yPos + 5,
          head: [['Date', 'Meal', 'Carbs', 'Calories']],
          body: mealsTableData,
          theme: 'grid',
          headStyles: { fillColor: [214, 40, 40], textColor: 255 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          margin: { left: 20, right: 20 },
        });
      }

      // Footer on all pages
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: "center" });
        pdf.text("Glucose Lilly - Professional Diabetes Management", pageWidth / 2, 290, { align: "center" });
      }

      // Save PDF
      pdf.save(`glucose-lilly-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setIsGenerating(false);
      toast.success(`Professional report generated successfully`);
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