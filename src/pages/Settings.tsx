import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings as SettingsIcon, Bell, Lock, Database, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    glucoseAlerts: true,
    mealReminders: false,
    exerciseReminders: true,
    dataSharing: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Setting updated");
  };

  const handleClearData = () => {
    localStorage.removeItem('health-metrics');
    localStorage.removeItem('demo-data-loaded');
    toast.success("All health data cleared");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleResetConsent = () => {
    localStorage.removeItem('gdpr-consent');
    toast.success("GDPR consent reset");
    setTimeout(() => window.location.href = '/gdpr-consent', 1000);
  };

  return (
    <div className="min-h-screen bg-background p-phi-3 sm:p-phi-4 lg:p-phi-5">
      <div className="max-w-2xl mx-auto space-y-phi-3 sm:space-y-phi-4">
        <Card>
          <CardHeader className="p-phi-3 sm:p-phi-4 lg:p-phi-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-phi-3">
              <div className="p-phi-2 sm:p-phi-3 bg-primary/10 rounded-full flex-shrink-0">
                <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl truncate">Settings</CardTitle>
                <CardDescription className="text-sm sm:text-base">Manage your app preferences</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-phi-4 sm:space-y-phi-5 p-phi-3 sm:p-phi-4 lg:p-phi-6">
            {/* Notifications */}
            <div>
              <div className="flex items-center gap-phi-2 mb-phi-3">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
              <div className="space-y-phi-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive app notifications</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={() => handleToggle('notifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="glucose-alerts">Glucose Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert for high/low glucose</p>
                  </div>
                  <Switch
                    id="glucose-alerts"
                    checked={settings.glucoseAlerts}
                    onCheckedChange={() => handleToggle('glucoseAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="meal-reminders">Meal Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind to log meals</p>
                  </div>
                  <Switch
                    id="meal-reminders"
                    checked={settings.mealReminders}
                    onCheckedChange={() => handleToggle('mealReminders')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="exercise-reminders">Exercise Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind to exercise</p>
                  </div>
                  <Switch
                    id="exercise-reminders"
                    checked={settings.exerciseReminders}
                    onCheckedChange={() => handleToggle('exerciseReminders')}
                  />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <div className="flex items-center gap-phi-2 mb-phi-3">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Privacy</h3>
              </div>
              <div className="space-y-phi-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing">Anonymous Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Help improve the app</p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={settings.dataSharing}
                    onCheckedChange={() => handleToggle('dataSharing')}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetConsent}
                >
                  Review GDPR Consent
                </Button>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <div className="flex items-center gap-phi-2 mb-phi-3">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Data Management</h3>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-phi-2" />
                    Clear All Health Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your health
                      metrics, meal logs, and exercise data from this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>
                      Yes, clear all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
