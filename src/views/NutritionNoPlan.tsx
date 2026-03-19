import React, { useState } from 'react';
import { useClient } from '../context/ClientContext';
import { useFoodContext } from '../context/FoodContext';
import { motion } from 'motion/react';
import { fetchWithAuth } from '../api';

interface NutritionNoPlanProps {
  client: any;
  onBack: () => void;
  onStartPlan: (preset?: any, initialPlanData?: any) => void;
}

const PRESETS = [
  {
    id: 'fat-loss-basic',
    calories: 1500,
    title: 'Fat Loss Basic',
    subtitle: 'Conservative cut',
    tag: 'Balanced',
    tagColor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    protein: 32,
    carbs: 38,
    fats: 30,
    weekViewLabel: '3+2',
    structure: '3 Meals + 2 Snacks',
    macroId: 'Balanced (40/30/30)',
    bars: [60, 80, 70, 60, 90, {h: 50, p: true}, {h: 40, p: true}],
    recommendedFor: ['Weight Loss', 'Fat Loss']
  },
  {
    id: 'active-maintain',
    calories: 1800,
    title: 'Active Maintain',
    subtitle: 'Recommended for current goal',
    tag: 'High Carb',
    tagColor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    protein: 25,
    carbs: 50,
    fats: 25,
    weekViewLabel: '4 meals',
    structure: '4 Meals',
    macroId: 'High Carb (25/50/25)',
    bars: [70, 70, 70, 80, 80, {h: 60, p: true}, {h: 60, p: true}],
    recommendedFor: ['Maintenance', 'Not Set']
  },
  {
    id: 'moderate-gain',
    calories: 2000,
    title: 'Moderate Gain',
    subtitle: 'Lean bulk approach',
    tag: 'High Protein',
    tagColor: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    protein: 40,
    carbs: 35,
    fats: 25,
    weekViewLabel: '3+2',
    structure: '3 Meals + 2 Snacks',
    macroId: 'Balanced (40/30/30)',
    bars: [80, 80, 80, 80, 80, {h: 80, p: true}, {h: 80, p: true}],
    recommendedFor: ['Muscle Gain']
  },
  {
    id: 'active-build',
    calories: 2200,
    title: 'Active Build',
    subtitle: 'Standard muscle gain',
    tag: 'Standard',
    tagColor: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    protein: 30,
    carbs: 40,
    fats: 30,
    weekViewLabel: '3+3',
    structure: '3 Meals + 3 Snacks',
    macroId: 'Balanced (40/30/30)',
    bars: [90, 90, 90, 90, 90, 90, {h: 70, p: true}],
    recommendedFor: ['Muscle Gain']
  },
  {
    id: 'athlete-perform',
    calories: 2500,
    title: 'Athlete Perform',
    subtitle: 'Sport performance',
    tag: 'High Energy',
    tagColor: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    protein: 25,
    carbs: 48,
    fats: 27,
    weekViewLabel: '4+2',
    structure: '4 Meals + 2 Snacks',
    macroId: 'Balanced (40/30/30)',
    bars: [100, 100, 100, 100, 100, {h: 100, p: true}, {h: 60, p: true}],
    recommendedFor: ['Performance']
  },
  {
    id: 'mass-builder',
    calories: 2800,
    title: 'Mass Builder',
    subtitle: 'Significant surplus',
    tag: 'High Carb',
    tagColor: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    protein: 25,
    carbs: 55,
    fats: 20,
    weekViewLabel: '5 meals',
    structure: '5 Meals',
    macroId: 'High Carb (25/55/20)',
    bars: [95, 95, 95, 95, 95, {h: 80, p: true}, {h: 80, p: true}],
    recommendedFor: ['Muscle Gain']
  },
  {
    id: 'power-lifting',
    calories: 3100,
    title: 'Power Lifting',
    subtitle: 'Strength focus',
    tag: 'Balanced+',
    tagColor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    protein: 30,
    carbs: 40,
    fats: 30,
    weekViewLabel: '5+1',
    structure: '5 Meals + 1 Snack',
    macroId: 'Balanced (40/30/30)',
    bars: [100, 100, 100, 100, 100, {h: 100, p: true}, {h: 50, p: true}],
    recommendedFor: ['Strength']
  },
  {
    id: 'extreme-bulk',
    calories: 3300,
    title: 'Extreme Bulk',
    subtitle: 'Maximum surplus',
    tag: 'Max Carb',
    tagColor: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    protein: 20,
    carbs: 60,
    fats: 20,
    weekViewLabel: '6 meals',
    structure: '6 Meals',
    macroId: 'High Carb (20/60/20)',
    bars: [100, 100, 100, 100, 100, 100, {h: 100, p: true}],
    recommendedFor: ['Muscle Gain']
  }
];

export default function NutritionNoPlan({ client, onBack, onStartPlan }: NutritionNoPlanProps) {
  const { assignNutritionPlan, reloadClients } = useClient();
  const { foods } = useFoodContext();
  const clientGoal = client?.goal || 'Not Set';
  
  // Find recommended preset
  const recommendedPreset = PRESETS.find(p => p.recommendedFor.includes(clientGoal)) || PRESETS[1];
  
  const [selectedId, setSelectedId] = useState<string>(recommendedPreset.id);
  
  // Interactive Settings State
  const [targetCalories, setTargetCalories] = useState<number>(recommendedPreset.calories);
  const [dailyStructure, setDailyStructure] = useState<string>(recommendedPreset.structure);
  const [macroSplitId, setMacroSplitId] = useState<string>(recommendedPreset.macroId);

  const selectedPreset = PRESETS.find(p => p.id === selectedId) || recommendedPreset;

  // Update settings when a preset is selected
  const handleSelectPreset = (preset: any) => {
    setSelectedId(preset.id);
    setTargetCalories(preset.calories);
    setDailyStructure(preset.structure);
    setMacroSplitId(preset.macroId);
  };

  const solveMacros = (targetP: number, targetC: number, targetF: number, f1: any, f2: any, f3: any) => {
    // 3x3 Determinant calculation
    const det = (
      f1.protein * f2.carbs * f3.fats +
      f2.protein * f3.carbs * f1.fats +
      f3.protein * f1.carbs * f2.fats -
      f1.fats * f2.carbs * f3.protein -
      f2.fats * f3.carbs * f1.protein -
      f3.fats * f1.carbs * f2.protein
    );

    if (Math.abs(det) < 0.01) return null;

    const det1 = (
      targetP * f2.carbs * f3.fats +
      f2.protein * f3.carbs * targetF +
      f3.protein * targetC * f2.fats -
      targetF * f2.carbs * f3.protein -
      f2.fats * f3.carbs * targetP -
      f3.fats * targetC * f2.protein
    );

    const det2 = (
      f1.protein * targetC * f3.fats +
      targetP * f3.carbs * f1.fats +
      f3.protein * f1.carbs * targetF -
      f1.fats * targetC * f3.protein -
      targetP * f3.carbs * f1.protein -
      f3.fats * f1.carbs * targetP
    );

    const det3 = (
      f1.protein * f2.carbs * targetF +
      f2.protein * targetC * f1.fats +
      targetP * f1.carbs * f2.fats -
      targetP * f2.carbs * f3.protein -
      f2.fats * targetC * f1.protein -
      targetF * f1.carbs * f2.protein
    );

    const q1 = det1 / det;
    const q2 = det2 / det;
    const q3 = det3 / det;

    // CATEGORY-SPECIFIC VALIDATION RANGES
    // q1: Protein source (e.g. Chicken): 80-250g
    // q2: Carb source (e.g. Rice): 50-220g
    // q3: Fat source (e.g. Nuts): 10-50g
    if (q1 < 0.8 || q1 > 2.5) return null; 
    if (q2 < 0.5 || q2 > 2.2) return null; 
    if (q3 < 0.1 || q3 > 0.5) return null; 

    return [
      Math.round(q1 * 100) / 100,
      Math.round(q2 * 100) / 100,
      Math.round(q3 * 100) / 100
    ];
  };

  const generatePlanData = () => {
    // 1. Calculate Total Macros (Grams)
    let pPct = 0.3, cPct = 0.4, fPct = 0.3;
    if (macroSplitId.includes("40/30/30")) { pPct = 0.4; cPct = 0.3; fPct = 0.3; }
    else if (macroSplitId.includes("40/20/40")) { pPct = 0.4; cPct = 0.2; fPct = 0.4; } 
    else if (macroSplitId.includes("25/50/25")) { pPct = 0.25; cPct = 0.5; fPct = 0.25; }
    else if (macroSplitId.includes("25/55/20")) { pPct = 0.25; cPct = 0.55; fPct = 0.2; }
    else if (macroSplitId.includes("20/60/20")) { pPct = 0.2; cPct = 0.6; fPct = 0.2; }
    else if (macroSplitId.includes("20/5/75")) { pPct = 0.2; cPct = 0.05; fPct = 0.75; }

    const totalProteinG = (targetCalories * pPct) / 4;
    const totalCarbsG = (targetCalories * cPct) / 4;
    const totalFatsG = (targetCalories * fPct) / 9;

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const weeklyDays: Record<string, any> = {};

    // Prepare food sources with SLIGHTLY broader filters to have more combinations
    const proteinSources = foods.filter(f => (f.protein * 4) / f.calories > 0.40) || [];
    const carbSources = foods.filter(f => (f.carbs * 4) / f.calories > 0.45) || [];
    const fatSources = foods.filter(f => (f.fats * 9) / f.calories > 0.45) || [];

    const fallbackProt = { id: 'fb-p', name: 'Chicken Breast', protein: 31, carbs: 0, fats: 3.6, calories: 165, servingSize: '100g', category: 'Protein' };
    const fallbackCarb = { id: 'fb-c', name: 'Rice', protein: 2.6, carbs: 23, fats: 0.9, calories: 111, servingSize: '100g', category: 'Carbs' };
    const fallbackFat = { id: 'fb-f', name: 'Walnuts', protein: 15, carbs: 14, fats: 65, calories: 654, servingSize: '100g', category: 'Fats' };

    days.forEach((day, dayIdx) => {
      // 2. Define Meal Structure weights
      let mealNames: string[] = [];
      let mealWeights: number[] = [];
      if (dailyStructure === "3 Meals") { mealNames = ["Breakfast", "Lunch", "Dinner"]; mealWeights = [1, 1, 1]; }
      else if (dailyStructure === "3 Meals + 1 Snack") { mealNames = ["Breakfast", "Lunch", "Afternoon Snack", "Dinner"]; mealWeights = [1, 1, 0.5, 1]; }
      else if (dailyStructure === "3 Meals + 2 Snacks") { mealNames = ["Breakfast", "Morning Snack", "Lunch", "Afternoon Snack", "Dinner"]; mealWeights = [1, 0.5, 1, 0.5, 1]; }
      else if (dailyStructure === "3 Meals + 3 Snacks") { mealNames = ["Breakfast", "Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Evening Snack"]; mealWeights = [1, 0.5, 1, 0.5, 1, 0.5]; }
      else if (dailyStructure === "4 Meals") { mealNames = ["Meal 1", "Meal 2", "Meal 3", "Meal 4"]; mealWeights = [1, 1, 1, 1]; }
      else if (dailyStructure === "4 Meals + 2 Snacks") { mealNames = ["Meal 1", "Snack 1", "Meal 2", "Snack 2", "Meal 3", "Meal 4"]; mealWeights = [1, 0.5, 1, 0.5, 1, 1]; }
      else if (dailyStructure === "5 Meals") { mealNames = ["Meal 1", "Meal 2", "Meal 3", "Meal 4", "Meal 5"]; mealWeights = [1, 1, 1, 1, 1]; }
      else if (dailyStructure === "5 Meals + 1 Snack") { mealNames = ["Meal 1", "Meal 2", "Meal 3", "Meal 4", "Meal 5", "Late Snack"]; mealWeights = [1, 1, 1, 1, 1, 0.5]; }
      else if (dailyStructure === "6 Meals") { mealNames = ["Meal 1", "Meal 2", "Meal 3", "Meal 4", "Meal 5", "Meal 6"]; mealWeights = [1, 1, 1, 1, 1, 1]; }

      const totalWeight = mealWeights.reduce((a, b) => a + b, 0);

      // 4. Create Meal Blocks
      const generatedMeals = mealNames.map((name, index) => {
        const weight = mealWeights[index];
        const ratio = weight / totalWeight;
        const targetP = totalProteinG * ratio;
        const targetC = totalCarbsG * ratio;
        const targetF = totalFatsG * ratio;

        // SMART COMBINATOR LOOP
        let bestResult: any = null;
        let attempts = 0;
        const maxAttempts = 15;

        while (attempts < maxAttempts && !bestResult) {
          const pIdx = (dayIdx + index + attempts) % (proteinSources.length || 1);
          const cIdx = (dayIdx + index + attempts + 1) % (carbSources.length || 1);
          const fIdx = (dayIdx + index + attempts + 2) % (fatSources.length || 1);

          const pFood = proteinSources[pIdx] || fallbackProt;
          const cFood = carbSources[cIdx] || fallbackCarb;
          const fFood = fatSources[fIdx] || fallbackFat;

          const solution = solveMacros(targetP, targetC, targetF, pFood, cFood, fFood);
          if (solution) {
            bestResult = { foods: [pFood, cFood, fFood], quantities: solution };
          }
          attempts++;
        }

        // Final fallback if no realistic perfect solution found (PROPORTIONAL SCALING)
        if (!bestResult) {
          const pFood = fallbackProt;
          const cFood = fallbackCarb;
          const fFood = fallbackFat;
          
          // Standard proportions: 150g P-Source, 100g C-Source, 15g F-Source (Nuts/Oil)
          const baseP = 1.5, baseC = 1.0, baseF = 0.15;
          const standardCals = (pFood.calories * baseP) + (cFood.calories * baseC) + (fFood.calories * baseF);
          const scalar = (targetCalories * ratio) / standardCals;
          
          bestResult = { 
            foods: [pFood, cFood, fFood], 
            quantities: [baseP * scalar, baseC * scalar, baseF * scalar].map(q => Math.round(q * 100) / 100) 
          };
        }

        const items = bestResult.foods.map((f: any, i: number) => ({
          ...f,
          quantity: bestResult.quantities[i],
          foodId: f.id,
          id: `${day}-${name}-${i}-${attempts}`
        }));

        return {
          id: Math.random(),
          name,
          iconName: name.includes("Breakfast") ? "Sunrise" : name.includes("Lunch") ? "Sun" : name.includes("Dinner") ? "Moon" : "Cookie",
          time: name.includes("Breakfast") ? "08:00 AM" : name.includes("Snack") ? "11:00 AM" : "01:30 PM",
          items: items,
          categories: [
            { id: 'p', label: 'Protein Source', example: items[0].name, amount: Math.round(targetP), color: 'bg-blue-500' },
            { id: 'c', label: 'Carbohydrates', example: items[1].name, amount: Math.round(targetC), color: 'bg-emerald-500' },
            { id: 'f', label: 'Healthy Fats', example: items[2].name, amount: Math.round(targetF), color: 'bg-amber-500' },
          ]
        };
      });

      // 5. CALORIE BALANCING (Strict Verification)
      let currentDayCals = 0;
      generatedMeals.forEach(m => m.items.forEach(i => {
        currentDayCals += (i.calories || 0) * (i.quantity || 1);
      }));

      // SAFE BALANCING: Adjust quantities slightly to match targetCalories exactly
      let diff = targetCalories - currentDayCals;
      if (Math.abs(diff) > 2) {
        // Try to adjust a portion without making it "ridiculous"
        // Prioritize Carbs, then Protein, AVOID Fat adjustment for stability
        generatedMeals.some(m => {
          return m.items.some(item => {
            const isCarb = item.category === 'Carbs';
            const isProt = item.category === 'Protein';
            const isFat = item.category === 'Fats';
            
            let min = 0.5, max = 2.5; 
            if (isFat) { min = 0.1; max = 0.5; }
            else if (isProt) { min = 0.8; max = 2.5; }
            else if (isCarb) { min = 0.5; max = 2.2; }

            if (isCarb || isProt || (isFat && Math.abs(diff) < 20)) {
              const adjustment = diff / item.calories;
              const newQty = item.quantity + adjustment;
              if (newQty > min && newQty < max) {
                item.quantity = Math.round(newQty * 100) / 100;
                diff = 0; // successfully balanced
                return true;
              }
            }
            return false;
          });
        });
      }

      weeklyDays[day] = { meals: generatedMeals };
    });

    return {
      days: weeklyDays,
      mode: 'example',
      targetCalories,
      macroSplitId,
      type: 'weekly'
    };
  };

  const handleConfirm = async () => {
    const generatedData = generatePlanData();
    
    // Persist immediately to backend
    try {
      await fetchWithAuth(`/manager/clients/${client.id}/nutrition-plan`, {
        method: 'POST',
        body: JSON.stringify({
          name: `Plan Dinámico - ${client.name}`,
          data_json: generatedData
        })
      });
      
      // Update global context state
      await reloadClients();
      
      const initialPlanData = {
        name: `Plan Dinámico - ${client.name}`,
        data_json: generatedData
      };
      
      // Navigate to detail view
      onStartPlan(null, initialPlanData);
    } catch (err) {
      console.error('Error saving generated plan:', err);
      alert('Error al guardar el plan generado');
    }
  };

  const handleCreateNew = () => {
    assignNutritionPlan(client.id);
    onStartPlan(null);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-500 transition-colors">
                Nutrition
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-slate-400 text-lg mx-1">chevron_right</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{client?.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
              style={{ backgroundImage: `url("${client?.avatar || 'https://ui-avatars.com/api/?name=C&background=random'}")` }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{client?.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span>
                Goal: {clientGoal}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">female</span>
                Female, {client?.age || '28'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:block"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">scale</span>
                {client?.weight || '68'}kg
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-2 sm:mt-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              No Plan Yet
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 pt-2 overflow-hidden">
        {/* Left Column: Templates */}
        <div className="flex-1 lg:basis-[70%] flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">grid_view</span>
              Start from a Template
            </h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-10">
            <div className="flex flex-col gap-4">
              
              {/* Scratch / Blank option */}
              <button 
                onClick={handleCreateNew} 
                className="group w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-emerald-500 text-2xl">add</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Create New Plan</h3>
                    <p className="text-sm text-slate-500">Start from scratch with custom macros</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 transition-colors">arrow_forward</span>
              </button>

              {/* Template Cards */}
              {PRESETS.map((preset) => {
                const isSelected = selectedId === preset.id;
                const isRecommended = recommendedPreset.id === preset.id;
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`group w-full text-left rounded-2xl transition-all cursor-pointer relative flex flex-col sm:flex-row items-center gap-6 p-5 ${
                      isSelected 
                        ? 'bg-white dark:bg-slate-800 border-2 border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/10 z-10' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-emerald-500/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-emerald-500">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </div>
                    )}

                    <div className="w-full sm:w-1/4 flex-shrink-0 flex sm:block flex-col items-center text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 pb-4 sm:pb-0 sm:pr-4">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start text-orange-500 font-bold text-xl mb-1">
                        <span className="material-symbols-outlined">local_fire_department</span>
                        {preset.calories.toLocaleString()}
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{preset.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{isRecommended ? 'Recommended for current goal' : preset.subtitle}</p>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`${preset.tagColor} text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide`}>
                          {preset.tag}
                        </span>
                        <div className="flex gap-2 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{preset.protein}% P</span>
                          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>{preset.carbs}% C</span>
                          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>{preset.fats}% F</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                        <div className="bg-blue-500 h-full transition-all" style={{ width: `${preset.protein}%` }}></div>
                        <div className="bg-green-500 h-full transition-all" style={{ width: `${preset.carbs}%` }}></div>
                        <div className="bg-yellow-500 h-full transition-all" style={{ width: `${preset.fats}%` }}></div>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/4 flex-shrink-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-700 pt-4 sm:pt-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Week View</span>
                        <span className="text-[10px] text-slate-400 font-medium">{preset.weekViewLabel}</span>
                      </div>
                      <div className="flex gap-1 h-8 items-end justify-between">
                        {preset.bars.map((bar: any, bi) => {
                          const height = typeof bar === 'number' ? bar : bar.h;
                          const isPrimary = typeof bar === 'object' && bar.p;
                          return (
                            <div 
                              key={bi} 
                              className={`w-1.5 rounded-t-sm transition-all ${isPrimary ? 'bg-emerald-500/60' : 'bg-slate-300 dark:bg-slate-600'}`} 
                              style={{ height: `${height}%` }}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="flex-1 lg:basis-[30%] flex flex-col gap-6 overflow-y-auto pr-1 pb-10">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800">
              <span className="material-symbols-outlined text-3xl text-emerald-500">restaurant</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Selected: {selectedPreset.title}</h3>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Calories</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{targetCalories}</div>
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Meals</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{dailyStructure.split(' ')[0]}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-5 shadow-sm min-h-[400px]">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
              <span className="material-symbols-outlined text-emerald-500">tune</span>
              <h3 className="font-bold text-slate-900 dark:text-white">Plan Settings</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Target Calories</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">local_fire_department</span>
                  <input 
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold" 
                    type="number" 
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(Number(e.target.value))}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">kcal</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Daily Structure</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">restaurant</span>
                  <select 
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none font-semibold cursor-pointer"
                    value={dailyStructure}
                    onChange={(e) => setDailyStructure(e.target.value)}
                  >
                    <option value="3 Meals">3 Meals</option>
                    <option value="3 Meals + 1 Snack">3 Meals + 1 Snack</option>
                    <option value="3 Meals + 2 Snacks">3 Meals + 2 Snacks</option>
                    <option value="3 Meals + 3 Snacks">3 Meals + 3 Snacks</option>
                    <option value="4 Meals">4 Meals</option>
                    <option value="4 Meals + 2 Snacks">4 Meals + 2 Snacks</option>
                    <option value="5 Meals">5 Meals</option>
                    <option value="5 Meals + 1 Snack">5 Meals + 1 Snack</option>
                    <option value="6 Meals">6 Meals</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">expand_more</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Macro Split</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">pie_chart</span>
                  <select 
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none font-semibold cursor-pointer"
                    value={macroSplitId}
                    onChange={(e) => setMacroSplitId(e.target.value)}
                  >
                    <option value="Balanced (40/30/30)">Balanced (40/30/30)</option>
                    <option value="Low Carb (40/40/20)">Low Carb (40/40/20)</option>
                    <option value="High Carb (25/50/25)">High Carb (25/50/25)</option>
                    <option value="High Carb (25/55/20)">High Carb (25/55/20)</option>
                    <option value="High Carb (20/60/20)">High Carb (20/60/20)</option>
                    <option value="Ketogenic (20/5/75)">Ketogenic (20/5/75)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>


            <div className="mt-auto pt-6 flex content-end">
              <button 
                onClick={handleConfirm}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">edit_document</span>
                Create Draft Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
