import { HealthMetric } from "@/contexts/UserContext";

export const generateMockMetrics = (): HealthMetric[] => {
  const metrics: HealthMetric[] = [];
  const now = new Date();

  // Generate glucose readings (2-3 per day for last 14 days)
  for (let day = 0; day < 14; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Morning reading
    const morningDate = new Date(date);
    morningDate.setHours(7, 30, 0, 0);
    metrics.push({
      id: `glucose-morning-${day}`,
      timestamp: morningDate.toISOString(),
      type: "glucose",
      value: 90 + Math.random() * 40,
      unit: "mg/dL",
    });

    // Afternoon reading
    const afternoonDate = new Date(date);
    afternoonDate.setHours(14, 0, 0, 0);
    metrics.push({
      id: `glucose-afternoon-${day}`,
      timestamp: afternoonDate.toISOString(),
      type: "glucose",
      value: 100 + Math.random() * 50,
      unit: "mg/dL",
    });

    // Evening reading
    const eveningDate = new Date(date);
    eveningDate.setHours(20, 0, 0, 0);
    metrics.push({
      id: `glucose-evening-${day}`,
      timestamp: eveningDate.toISOString(),
      type: "glucose",
      value: 95 + Math.random() * 45,
      unit: "mg/dL",
    });
  }

  // Generate meals (3 per day for last 7 days)
  const meals = [
    "Oatmeal with berries",
    "Grilled chicken salad",
    "Brown rice with vegetables",
    "Greek yogurt with nuts",
    "Salmon with quinoa",
    "Lentil soup",
  ];

  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    [8, 13, 19].forEach((hour, idx) => {
      const mealDate = new Date(date);
      mealDate.setHours(hour, 0, 0, 0);
      metrics.push({
        id: `meal-${day}-${idx}`,
        timestamp: mealDate.toISOString(),
        type: "meal",
        value: 300 + Math.random() * 400,
        unit: "kcal",
        mealDetails: {
          name: meals[Math.floor(Math.random() * meals.length)],
          carbs: 30 + Math.random() * 40,
          calories: 300 + Math.random() * 400,
        },
      });
    });
  }

  // Generate exercise (4-5 times per week)
  const exercises = [
    { activity: "Brisk walking", intensity: "moderate" },
    { activity: "Swimming", intensity: "moderate" },
    { activity: "Cycling", intensity: "moderate" },
    { activity: "Yoga", intensity: "light" },
    { activity: "Strength training", intensity: "moderate" },
  ];

  for (let day = 0; day < 14; day++) {
    if (Math.random() > 0.4) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(17, 0, 0, 0);
      
      const exercise = exercises[Math.floor(Math.random() * exercises.length)];
      const duration = 20 + Math.random() * 40;
      
      metrics.push({
        id: `exercise-${day}`,
        timestamp: date.toISOString(),
        type: "exercise",
        value: duration,
        unit: "minutes",
        exerciseDetails: {
          activity: exercise.activity,
          duration: duration,
          intensity: exercise.intensity,
        },
      });
    }
  }

  // Generate steps (daily for last 7 days)
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(22, 0, 0, 0);
    
    metrics.push({
      id: `steps-${day}`,
      timestamp: date.toISOString(),
      type: "steps",
      value: 5000 + Math.random() * 5000,
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
