import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { toast } from "sonner";
import { Eye, Mic, Volume2, ZoomIn } from "lucide-react";

const AccessibilitySettings = () => {
  const {
    highContrast,
    voiceControl,
    screenReader,
    fontSize,
    setHighContrast,
    setVoiceControl,
    setScreenReader,
    setFontSize,
  } = useAccessibility();

  const handleToggle = (
    setter: (value: boolean) => void,
    currentValue: boolean,
    name: string
  ) => {
    setter(!currentValue);
    toast.success(`${name} ${!currentValue ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-background p-phi-3 sm:p-phi-4 lg:p-phi-5">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="p-phi-3 sm:p-phi-4 lg:p-phi-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-phi-3">
              <div className="p-phi-2 sm:p-phi-3 bg-primary/10 rounded-full flex-shrink-0">
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl truncate">Accessibility Settings</CardTitle>
                <CardDescription className="text-sm sm:text-base">Customize your experience for better accessibility</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-phi-4 sm:space-y-phi-5 p-phi-3 sm:p-phi-4 lg:p-phi-6">
            {/* Visual */}
            <div>
              <div className="flex items-center gap-phi-2 mb-phi-3">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Visual</h3>
              </div>
              <div className="space-y-phi-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">Increase color contrast for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={highContrast}
                    onCheckedChange={() => handleToggle(setHighContrast, highContrast, 'High contrast mode')}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-phi-2 mb-phi-2">
                    <ZoomIn className="h-4 w-4 text-primary" />
                    <Label>Font Size</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-phi-3">
                    Adjust text size: {fontSize}
                  </p>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => {
                      setFontSize(value[0]);
                      toast.success(`Font size set to ${value[0]}`);
                    }}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-phi-1">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio */}
            <div>
              <div className="flex items-center gap-phi-2 mb-phi-3">
                <Volume2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Audio</h3>
              </div>
              <div className="space-y-phi-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screen-reader">Screen Reader</Label>
                    <p className="text-sm text-muted-foreground">Enable text-to-speech for content</p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={screenReader}
                    onCheckedChange={() => handleToggle(setScreenReader, screenReader, 'Screen reader')}
                  />
                </div>
              </div>
            </div>

            {/* Voice */}
            <div>
              <div className="flex items-center gap-phi-2 mb-phi-3">
                <Mic className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Voice Control</h3>
              </div>
              <div className="space-y-phi-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voice-control">Voice Commands</Label>
                    <p className="text-sm text-muted-foreground">Control app with voice commands</p>
                  </div>
                  <Switch
                    id="voice-control"
                    checked={voiceControl}
                    onCheckedChange={() => handleToggle(setVoiceControl, voiceControl, 'Voice control')}
                  />
                </div>

                {voiceControl && (
                  <div className="bg-muted/30 p-phi-3 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-phi-2">
                      <strong>Available commands:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-phi-1">
                      <li>• "Go to dashboard"</li>
                      <li>• "Log glucose"</li>
                      <li>• "Show diet"</li>
                      <li>• "Open exercise"</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full text-sm sm:text-base min-h-touch">
              Save Accessibility Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
