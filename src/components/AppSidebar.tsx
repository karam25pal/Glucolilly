import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  User,
  PhoneCall,
  Utensils,
  Dumbbell,
  Activity,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { profile } = useUser();
  const [emergencyContact, setEmergencyContact] = useState(() => {
    const saved = localStorage.getItem('emergency-contact');
    return saved ? JSON.parse(saved) : { name: '', phone: '' };
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempContact, setTempContact] = useState(emergencyContact);

  const mainNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Diet", url: "/diet", icon: Utensils },
    { title: "Exercise", url: "/exercise", icon: Dumbbell },
  ];

  const settingsItems = [
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSaveEmergencyContact = () => {
    if (!tempContact.name || !tempContact.phone) {
      toast.error("Please fill in both name and phone number");
      return;
    }
    
    localStorage.setItem('emergency-contact', JSON.stringify(tempContact));
    setEmergencyContact(tempContact);
    setIsEditingContact(false);
    toast.success("Emergency contact saved");
  };

  const handleEmergencyCall = () => {
    if (!emergencyContact.phone) {
      toast.error("No emergency contact set");
      return;
    }
    
    // Open phone dialer
    window.location.href = `tel:${emergencyContact.phone}`;
    toast.info(`Calling ${emergencyContact.name}...`);
  };

  return (
    <Sidebar collapsible="icon" className={`bg-white dark:bg-background ${isCollapsed ? "w-14" : "w-64 lg:w-72"}`}>
      <SidebarHeader className="border-b border-border p-phi-2 sm:p-phi-3">
        {!isCollapsed && (
          <div className="flex items-center gap-phi-2">
            <div className="p-phi-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">GlucoLilly</h2>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.name || "User"}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="p-phi-2 bg-primary/10 rounded-lg mx-auto">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={isActive(item.url)}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={isActive(item.url)}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Privacy */}
        <SidebarGroup>
          <SidebarGroupLabel>Privacy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/gdpr-consent')}
                  tooltip={isCollapsed ? "GDPR" : undefined}
                >
                  <Shield className="h-4 w-4" />
                  {!isCollapsed && <span>GDPR Consent</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-phi-2 sm:p-phi-3">
        {/* Emergency Contact */}
        <div className="space-y-phi-2">
          {!isCollapsed && emergencyContact.name && (
            <div className="bg-destructive/10 rounded-lg p-phi-2 mb-phi-2">
              <div className="flex items-center gap-phi-2 mb-phi-1">
                <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground">Emergency Contact</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{emergencyContact.name}</p>
              <p className="text-xs text-muted-foreground truncate">{emergencyContact.phone}</p>
            </div>
          )}

          <div className="flex gap-phi-2">
            <Button
              variant="destructive"
              size={isCollapsed ? "icon" : "sm"}
              className="flex-1 text-xs sm:text-sm"
              onClick={handleEmergencyCall}
              disabled={!emergencyContact.phone}
            >
              <PhoneCall className="h-3 w-3 sm:h-4 sm:w-4" />
              {!isCollapsed && <span className="ml-phi-2 truncate">Emergency</span>}
            </Button>

            {!isCollapsed && (
              <Dialog open={isEditingContact} onOpenChange={setIsEditingContact}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Emergency Contact</DialogTitle>
                    <DialogDescription>
                      Set up a contact to call in case of emergency
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-phi-4">
                    <div>
                      <Label htmlFor="contact-name">Contact Name</Label>
                      <Input
                        id="contact-name"
                        value={tempContact.name}
                        onChange={(e) => setTempContact({ ...tempContact, name: e.target.value })}
                        placeholder="e.g., Dr. Smith"
                        className="mt-phi-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={tempContact.phone}
                        onChange={(e) => setTempContact({ ...tempContact, phone: e.target.value })}
                        placeholder="e.g., +44 20 1234 5678"
                        className="mt-phi-1"
                      />
                    </div>
                    <Button onClick={handleSaveEmergencyContact} className="w-full">
                      Save Contact
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {isCollapsed && (
            <Dialog open={isEditingContact} onOpenChange={setIsEditingContact}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="w-full">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Emergency Contact</DialogTitle>
                  <DialogDescription>
                    Set up a contact to call in case of emergency
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-phi-4">
                  <div>
                    <Label htmlFor="contact-name">Contact Name</Label>
                    <Input
                      id="contact-name"
                      value={tempContact.name}
                      onChange={(e) => setTempContact({ ...tempContact, name: e.target.value })}
                      placeholder="e.g., Dr. Smith"
                      className="mt-phi-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Phone Number</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={tempContact.phone}
                      onChange={(e) => setTempContact({ ...tempContact, phone: e.target.value })}
                      placeholder="e.g., +44 20 1234 5678"
                      className="mt-phi-1"
                    />
                  </div>
                  <Button onClick={handleSaveEmergencyContact} className="w-full">
                    Save Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
