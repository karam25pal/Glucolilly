import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Splash from "./pages/Splash";
import VoiceNavigationTimer from "./pages/VoiceNavigationTimer";
import AccessibilitySelection from "./pages/AccessibilitySelection";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Diet from "./pages/Diet";
import Exercise from "./pages/Exercise";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AccessibilitySettings from "./pages/AccessibilitySettings";
import NotFound from "./pages/NotFound";
import GDPRConsent from "./pages/GDPRConsent";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const queryClient = new QueryClient();

const ConsentGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('gdpr-consent');
        if (consent) {
          const consentData = JSON.parse(consent);
          setHasConsent(consentData.accepted === true);
        } else {
          setHasConsent(false);
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        setHasConsent(false);
      }
    };

    checkConsent();
  }, []);

  useEffect(() => {
    if (hasConsent === false && location.pathname !== '/gdpr-consent') {
      navigate('/gdpr-consent');
    }
  }, [hasConsent, location.pathname, navigate]);

  if (hasConsent === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const noSidebarRoutes = ['/', '/voice-setup', '/accessibility', '/onboarding', '/gdpr-consent'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-phi-4">
            <SidebarTrigger />
          </header>
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AccessibilityProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ConsentGuard>
                <LayoutWithSidebar>
                  <Routes>
                    <Route path="/gdpr-consent" element={<GDPRConsent />} />
                    <Route path="/" element={<Splash />} />
                    <Route path="/voice-setup" element={<VoiceNavigationTimer />} />
                    <Route path="/accessibility" element={<AccessibilitySelection />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/diet" element={<Diet />} />
                    <Route path="/exercise" element={<Exercise />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/accessibility-settings" element={<AccessibilitySettings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </LayoutWithSidebar>
              </ConsentGuard>
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
