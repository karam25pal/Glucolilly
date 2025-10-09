import { HealthMetric, UserProfile } from "@/contexts/UserContext";

export const generatePersonalizedMockMetrics = (
  profile: UserProfile | null,
  existingMetrics: HealthMetric[]
): HealthMetric[] => {
  const metrics: HealthMetric[] = [];
  const now = new Date();

  // Analyze existing user patterns
  const recentGlucose = existingMetrics
    .filter(m => m.type === "glucose")
    .slice(0, 10);
  const avgRecentGlucose = recentGlucose.length > 0
    ? recentGlucose.reduce((sum, m) => sum + m.value, 0) / recentGlucose.length
    : null;

  const userMeals = existingMetrics
    .filter(m => m.type === "meal")
    .map(m => m.mealDetails?.name)
    .filter(Boolean);

  const userExercises = existingMetrics
    .filter(m => m.type === "exercise")
    .map(m => m.exerciseDetails?.activity)
    .filter(Boolean);

  // Determine baseline glucose based on user profile and history
  const getBaselineGlucose = () => {
    if (avgRecentGlucose) return avgRecentGlucose;
    
    // Base on diabetes type if no history
    switch (profile?.diabetesType) {
      case "type1":
        return 140;
      case "type2":
        return 130;
      case "gestational":
        return 115;
      case "prediabetic":
        return 110;
      default:
        return 120;
    }
  };

  const baseGlucose = getBaselineGlucose();

  // Generate glucose readings showing personalized trends
  for (let day = 0; day < 14; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Create improvement trend: older data worse, recent data better
    // If user has been logging data, show positive trend
    const hasUserEngagement = existingMetrics.length > 5;
    const improvementFactor = hasUserEngagement
      ? (day > 7 ? 1.15 : 0.88)  // Show improvement if engaged
      : (day > 7 ? 1.08 : 0.95); // Smaller improvement if not engaged
    
    const dayBaseGlucose = baseGlucose * improvementFactor;
    
    // Add variation based on BMI if available
    const bmiAdjustment = profile?.bmi 
      ? (profile.bmi > 25 ? 5 : profile.bmi < 20 ? -5 : 0)
      : 0;
    
    // Morning reading (fasting)
    const morningDate = new Date(date);
    morningDate.setHours(7, 30, 0, 0);
    metrics.push({
      id: `glucose-morning-${day}-${Date.now()}`,
      timestamp: morningDate.toISOString(),
      type: "glucose",
      value: dayBaseGlucose + bmiAdjustment + (Math.random() * 20 - 10),
      unit: "mg/dL",
    });

    // Afternoon reading (post-lunch, typically higher)
    const afternoonDate = new Date(date);
    afternoonDate.setHours(14, 0, 0, 0);
    metrics.push({
      id: `glucose-afternoon-${day}-${Date.now()}`,
      timestamp: afternoonDate.toISOString(),
      type: "glucose",
      value: (dayBaseGlucose + 25) + bmiAdjustment + (Math.random() * 25 - 12),
      unit: "mg/dL",
    });

    // Evening reading
    const eveningDate = new Date(date);
    eveningDate.setHours(20, 0, 0, 0);
    metrics.push({
      id: `glucose-evening-${day}-${Date.now()}`,
      timestamp: eveningDate.toISOString(),
      type: "glucose",
      value: (dayBaseGlucose + 15) + bmiAdjustment + (Math.random() * 20 - 10),
      unit: "mg/dL",
    });
  }

  // Generate meals based on user's preferred foods or defaults
  const defaultMeals = [
    "Oatmeal with berries",
    "Grilled chicken salad",
    "Brown rice with vegetables",
    "Greek yogurt with nuts",
    "Salmon with quinoa",
    "Lentil soup",
    "Scrambled eggs with spinach",
    "Turkey wrap with vegetables",
    "Stir-fried tofu",
  ];

  const mealPool = userMeals.length > 3 
    ? [...new Set([...userMeals, ...defaultMeals])] as string[]
    : defaultMeals;

  // Calorie baseline based on weight and height
  const baseCalories = profile?.weight && profile?.height
    ? Math.round((profile.weight * 10 + profile.height * 6.25 - profile.age * 5 + 5) / 3)
    : 450;

  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    [8, 13, 19].forEach((hour, idx) => {
      const mealDate = new Date(date);
      mealDate.setHours(hour, 0, 0, 0);
      const mealName = mealPool[Math.floor(Math.random() * mealPool.length)];
      const calories = baseCalories + (Math.random() * 200 - 100);
      
      metrics.push({
        id: `meal-${day}-${idx}-${Date.now()}`,
        timestamp: mealDate.toISOString(),
        type: "meal",
        value: calories,
        unit: "kcal",
        mealDetails: {
          name: mealName,
          carbs: Math.round(calories * 0.15 + Math.random() * 30),
          calories: Math.round(calories),
        },
      });
    });
  }

  // Generate exercise based on user patterns
  const defaultExercises = [
    { activity: "Brisk walking", intensity: "moderate" },
    { activity: "Swimming", intensity: "moderate" },
    { activity: "Cycling", intensity: "moderate" },
    { activity: "Yoga", intensity: "light" },
    { activity: "Strength training", intensity: "moderate" },
    { activity: "Dancing", intensity: "moderate" },
    { activity: "Jogging", intensity: "vigorous" },
  ];

  const exercisePool = userExercises.length > 2
    ? [...new Set([...userExercises.map(e => ({ activity: e, intensity: "moderate" })), ...defaultExercises])]
    : defaultExercises;

  // Exercise frequency based on user engagement
  const exerciseFrequency = existingMetrics.filter(m => m.type === "exercise").length > 3 
    ? 0.5  // More frequent if user exercises
    : 0.35; // Less frequent otherwise

  for (let day = 0; day < 14; day++) {
    if (Math.random() < exerciseFrequency) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(17, 0, 0, 0);
      
      const exercise = exercisePool[Math.floor(Math.random() * exercisePool.length)];
      const duration = 20 + Math.random() * 40;
      
      metrics.push({
        id: `exercise-${day}-${Date.now()}`,
        timestamp: date.toISOString(),
        type: "exercise",
        value: duration,
        unit: "minutes",
        exerciseDetails: {
          activity: typeof exercise === 'string' ? exercise : exercise.activity,
          duration: duration,
          intensity: typeof exercise === 'string' ? "moderate" : exercise.intensity,
        },
      });
    }
  }

  // Generate steps based on activity level
  const baseSteps = existingMetrics.some(m => m.type === "exercise")
    ? 6500 // Higher baseline if user exercises
    : 5000; // Lower baseline otherwise

  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(22, 0, 0, 0);
    
    metrics.push({
      id: `steps-${day}-${Date.now()}`,
      timestamp: date.toISOString(),
      type: "steps",
      value: baseSteps + Math.random() * 4000,
      unit: "steps",
    });
  }

  return metrics.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const recipes = [
  {
    id: "r-1",
    name: "Grilled Chicken with Quinoa",
    category: "lunch",
    carbs: 35,
    calories: 450,
    protein: 38,
    fiber: 6,
    prepTime: "30 min",
    image: "grilled-chicken-salad.jpg",
    ingredients: [
      "150g chicken breast",
      "1/2 cup quinoa",
      "Mixed vegetables",
      "Olive oil, spices",
    ],
    instructions: [
      "Cook quinoa according to package instructions",
      "Season chicken with herbs and grill until cooked through",
      "Steam or roast vegetables",
      "Serve chicken over quinoa with vegetables",
    ],
    audioAvailable: true,
  },
  {
    id: "r-2",
    name: "Greek Yogurt Parfait",
    category: "breakfast",
    carbs: 28,
    calories: 280,
    protein: 20,
    fiber: 5,
    prepTime: "10 min",
    image: "yogurt-parfait.jpg",
    ingredients: [
      "200g Greek yogurt (low-fat)",
      "1/2 cup berries",
      "2 tbsp nuts",
      "1 tsp honey (optional)",
    ],
    instructions: [
      "Layer yogurt in a bowl or glass",
      "Add berries and nuts",
      "Drizzle with honey if desired",
      "Enjoy immediately",
    ],
    audioAvailable: true,
  },
  {
    id: "r-3",
    name: "Lentil Vegetable Soup",
    category: "dinner",
    carbs: 42,
    calories: 320,
    protein: 18,
    fiber: 12,
    prepTime: "45 min",
    image: "lentil-soup.jpg",
    ingredients: [
      "1 cup lentils",
      "Mixed vegetables (carrots, celery, spinach)",
      "Vegetable broth",
      "Spices and herbs",
    ],
    instructions: [
      "Rinse lentils and soak if needed",
      "Sauté vegetables in a pot",
      "Add lentils and broth, simmer for 30 minutes",
      "Season to taste and serve hot",
    ],
    audioAvailable: true,
  },
];

export const exerciseGuides = [
  {
    id: "e-1",
    name: "Brisk Walking",
    type: "cardio",
    duration: "30 min",
    intensity: "moderate",
    caloriesBurned: 150,
    benefits: "Improves cardiovascular health and helps regulate blood sugar",
    instructions: [
      "Wear comfortable walking shoes",
      "Start with a 5-minute warm-up at slower pace",
      "Walk at a pace where you can talk but not sing",
      "Maintain good posture",
      "Cool down for 5 minutes at slower pace",
    ],
    cautions: "Stop if you feel dizzy or experience chest pain",
    audioAvailable: true,
  },
  {
    id: "e-2",
    name: "Resistance Band Training",
    type: "strength",
    duration: "20 min",
    intensity: "moderate",
    caloriesBurned: 120,
    benefits: "Builds muscle mass which helps with glucose metabolism",
    instructions: [
      "Choose appropriate resistance band",
      "Perform 10-12 reps of each exercise",
      "Exercises: bicep curls, shoulder press, squats, rows",
      "Rest 30 seconds between sets",
      "Complete 2-3 rounds",
    ],
    cautions: "Maintain proper form to avoid injury",
    audioAvailable: true,
  },
  {
    id: "e-3",
    name: "Gentle Yoga Flow",
    type: "flexibility",
    duration: "25 min",
    intensity: "light",
    caloriesBurned: 100,
    benefits: "Reduces stress, improves flexibility and balance",
    instructions: [
      "Find a quiet space with a yoga mat",
      "Start with deep breathing exercises",
      "Flow through poses: cat-cow, downward dog, warrior, tree pose",
      "Hold each pose for 5-8 breaths",
      "End with relaxation pose",
    ],
    cautions: "Listen to your body, don't force any positions",
    audioAvailable: true,
  },
];
