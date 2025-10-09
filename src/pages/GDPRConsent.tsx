import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const GDPRConsent = () => {
  const navigate = useNavigate();
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleAccept = () => {
    if (!agreedToTerms) {
      toast.error("Please check the box to agree to the terms");
      return;
    }

    // Store consent in localStorage
    localStorage.setItem('gdpr-consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));

    toast.success("Thank you for accepting our terms");
    navigate('/');
  };

  const handleDecline = () => {
    toast.error("You must accept the terms to use this application");
    // Could redirect to an exit page or show a message
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-phi-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-phi-3">
            <div className="p-phi-3 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Privacy & Data Protection</CardTitle>
          <CardDescription className="text-base">
            GDPR Compliance Notice - United Kingdom
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-phi-4">
          <div className="bg-muted/30 p-phi-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-phi-2 flex items-center gap-phi-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Your Data Rights
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under the UK GDPR and Data Protection Act 2018, you have the right to access, 
              rectify, erase, and port your personal data. You also have the right to object 
              to processing and to lodge a complaint with the Information Commissioner's Office (ICO).
            </p>
          </div>

          <ScrollArea className="h-[300px] rounded-lg border border-border p-phi-4 bg-background/50">
            <div className="space-y-phi-3 text-sm text-foreground">
              <section>
                <h4 className="font-semibold text-base mb-phi-2">Data We Collect</h4>
                <p className="text-muted-foreground mb-phi-2">
                  GlucoLilly collects and processes the following personal data:
                </p>
                <ul className="list-disc pl-phi-4 space-y-phi-1 text-muted-foreground">
                  <li>Health metrics (blood glucose levels, exercise data, meal information)</li>
                  <li>Personal profile information (name, age, height, weight, diabetes type)</li>
                  <li>Usage data and application interactions</li>
                  <li>Device information and browser type</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-base mb-phi-2">Purpose of Processing</h4>
                <p className="text-muted-foreground mb-phi-2">
                  Your data is processed for the following purposes:
                </p>
                <ul className="list-disc pl-phi-4 space-y-phi-1 text-muted-foreground">
                  <li>To provide personalized diabetes management recommendations</li>
                  <li>To track and analyze your health metrics over time</li>
                  <li>To generate health reports and insights</li>
                  <li>To improve our AI-powered features and services</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-base mb-phi-2">Legal Basis</h4>
                <p className="text-muted-foreground">
                  We process your data based on your explicit consent (Article 6(1)(a) and 
                  Article 9(2)(a) GDPR for special categories of health data). You may withdraw 
                  your consent at any time by contacting us or deleting your account.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-base mb-phi-2">Data Storage & Security</h4>
                <p className="text-muted-foreground mb-phi-2">
                  Your data is stored securely:
                </p>
                <ul className="list-disc pl-phi-4 space-y-phi-1 text-muted-foreground">
                  <li>Encrypted at rest and in transit using industry-standard protocols</li>
                  <li>Stored on secure servers with regular backups</li>
                  <li>Access limited to authorized personnel only</li>
                  <li>Retained only as long as necessary for the stated purposes</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-base mb-phi-2">Third-Party Sharing</h4>
                <p className="text-muted-foreground">
                  We do not sell your personal data. We may share data with trusted service providers 
                  who assist in operating our application (e.g., cloud hosting, AI services), 
                  all of whom are bound by strict data protection agreements.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-base mb-phi-2">Your Rights</h4>
                <p className="text-muted-foreground mb-phi-2">
                  You have the right to:
                </p>
                <ul className="list-disc pl-phi-4 space-y-phi-1 text-muted-foreground">
                  <li>Access your personal data</li>
                  <li>Rectify inaccurate data</li>
                  <li>Request erasure of your data</li>
                  <li>Restrict or object to processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                  <li>Lodge a complaint with the ICO</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-base mb-phi-2">Contact Information</h4>
                <p className="text-muted-foreground">
                  For any questions about your data or to exercise your rights, please contact 
                  our Data Protection Officer at: privacy@glucolilly.com
                </p>
                <p className="text-muted-foreground mt-phi-2">
                  To lodge a complaint with the ICO, visit: www.ico.org.uk
                </p>
              </section>

              <section className="border-t border-border pt-phi-3 mt-phi-4">
                <p className="text-xs text-muted-foreground italic">
                  Last updated: {new Date().toLocaleDateString('en-GB')}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Version 1.0 - Compliant with UK GDPR and Data Protection Act 2018
                </p>
              </section>
            </div>
          </ScrollArea>

          <div className="space-y-phi-3">
            <div className="flex items-start gap-phi-3 p-phi-3 bg-primary/5 rounded-lg">
              <Checkbox
                id="read-terms"
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label
                htmlFor="read-terms"
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                I have read and understood the data protection information above
              </label>
            </div>

            <div className="flex items-start gap-phi-3 p-phi-3 bg-primary/5 rounded-lg">
              <Checkbox
                id="agree-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={!hasReadTerms}
                className="mt-0.5"
              />
              <label
                htmlFor="agree-terms"
                className={`text-sm leading-relaxed cursor-pointer ${
                  !hasReadTerms ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                I consent to the collection and processing of my personal data, including 
                special category health data, as described above
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-phi-3">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1 min-h-touch"
            >
              <XCircle className="h-4 w-4 mr-phi-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!agreedToTerms}
              className="flex-1 min-h-touch"
            >
              <CheckCircle2 className="h-4 w-4 mr-phi-2" />
              Accept & Continue
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By accepting, you acknowledge that you have read and agree to our data protection practices
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRConsent;
