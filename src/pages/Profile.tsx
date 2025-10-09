import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, DiabetesType } from "@/contexts/UserContext";
import { toast } from "sonner";
import { User, Save } from "lucide-react";

const Profile = () => {
  const { profile, setProfile } = useUser();
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    age: profile?.age || 0,
    height: profile?.height || 0,
    weight: profile?.weight || 0,
    diabetesType: profile?.diabetesType || "type2" as DiabetesType,
  });

  const handleSave = () => {
    if (!formData.name || !formData.age || !formData.height || !formData.weight) {
      toast.error("Please fill in all fields");
      return;
    }

    setProfile(formData);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-background p-phi-3 sm:p-phi-4 lg:p-phi-5">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="p-phi-3 sm:p-phi-4 lg:p-phi-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-phi-3">
              <div className="p-phi-2 sm:p-phi-3 bg-primary/10 rounded-full flex-shrink-0">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl truncate">Profile Settings</CardTitle>
                <CardDescription className="text-sm sm:text-base">Update your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-phi-3 sm:space-y-phi-4 p-phi-3 sm:p-phi-4 lg:p-phi-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="mt-phi-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-phi-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  placeholder="Enter your age"
                  className="mt-phi-1"
                />
              </div>

              <div>
                <Label htmlFor="diabetesType">Diabetes Type</Label>
                <Select
                  value={formData.diabetesType}
                  onValueChange={(value) => setFormData({ ...formData, diabetesType: value as DiabetesType })}
                >
                  <SelectTrigger className="mt-phi-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type1">Type 1</SelectItem>
                    <SelectItem value="type2">Type 2</SelectItem>
                    <SelectItem value="gestational">Gestational</SelectItem>
                    <SelectItem value="prediabetic">Prediabetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-phi-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height || ""}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                  placeholder="Enter your height"
                  className="mt-phi-1"
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight || ""}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                  placeholder="Enter your weight"
                  className="mt-phi-1"
                />
              </div>
            </div>

            {profile?.bmi && (
              <div className="bg-muted/30 p-phi-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Current BMI:</strong> {profile.bmi}
                </p>
              </div>
            )}

            <Button onClick={handleSave} className="w-full text-sm sm:text-base min-h-touch">
              <Save className="h-4 w-4 mr-phi-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
