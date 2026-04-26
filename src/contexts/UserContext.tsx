import React, { createContext, useContext, useState, useEffect } from "react";

export type DiabetesType = "type1" | "type2" | "gestational" | "prediabetic";

export interface HealthMetric {
  id: string;
  timestamp: string;
  type: "glucose" | "meal" | "exercise" | "steps";
  value: number;
  unit: string;
  notes?: string;
  mealDetails?: {
    name: string;
    carbs?: number;
    calories?: number;
    protein?: number;
    fiber?: number;
    impact?: "low" | "moderate" | "high";
    imageUrl?: string;
    analysis?: string;
  };
  exerciseDetails?: {
    activity: string;
    duration: number;
    intensity: string;
  };
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  diabetesType: DiabetesType;
  bmi?: number;
}

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  metrics: HealthMetric[];
  addMetric: (metric: Omit<HealthMetric, "id" | "timestamp">) => void;
  weeklyStats: {
    avgGlucose: number;
    improvement: number;
    totalSteps: number;
    exerciseSessions: number;
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user-profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [metrics, setMetrics] = useState<HealthMetric[]>(() => {
    const saved = localStorage.getItem('health-metrics');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync profile to localStorage with error handling
  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem('user-profile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Failed to save profile to localStorage:', error);
    }
  }, [profile]);

  // Sync metrics to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('health-metrics', JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to save metrics to localStorage:', error);
    }
  }, [metrics]);

  const setProfile = (newProfile: UserProfile) => {
    const bmi = (newProfile.weight / ((newProfile.height / 100) ** 2));
    setProfileState({ ...newProfile, bmi: parseFloat(bmi.toFixed(1)) });
  };

  const addMetric = (metric: Omit<HealthMetric, "id" | "timestamp">) => {
    try {
      const newMetric: HealthMetric = {
        ...metric,
        id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      setMetrics(prev => {
        const updated = [newMetric, ...prev];
        // Keep only last 1000 metrics to prevent localStorage overflow
        return updated.slice(0, 1000);
      });
    } catch (error) {
      console.error('Failed to add metric:', error);
      throw error;
    }
  };

  // Calculate weekly stats
  const weeklyStats = React.useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekMetrics = metrics.filter(m => new Date(m.timestamp) > weekAgo);
    const glucoseReadings = weekMetrics.filter(m => m.type === "glucose");
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const prevWeekGlucose = metrics.filter(m => 
      m.type === "glucose" && 
      new Date(m.timestamp) > twoWeeksAgo && 
      new Date(m.timestamp) <= weekAgo
    );

    const avgGlucose = glucoseReadings.length > 0
      ? glucoseReadings.reduce((sum, m) => sum + m.value, 0) / glucoseReadings.length
      : 0;
    
    const prevAvg = prevWeekGlucose.length > 0
      ? prevWeekGlucose.reduce((sum, m) => sum + m.value, 0) / prevWeekGlucose.length
      : avgGlucose;

    const improvement = prevAvg > 0 ? ((prevAvg - avgGlucose) / prevAvg) * 100 : 0;

    const totalSteps = weekMetrics
      .filter(m => m.type === "steps")
      .reduce((sum, m) => sum + m.value, 0);

    const exerciseSessions = weekMetrics.filter(m => m.type === "exercise").length;

    return {
      avgGlucose: parseFloat(avgGlucose.toFixed(1)),
      improvement: parseFloat(improvement.toFixed(1)),
      totalSteps,
      exerciseSessions,
    };
  }, [metrics]);

  return (
    <UserContext.Provider value={{ profile, setProfile, metrics, addMetric, weeklyStats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
