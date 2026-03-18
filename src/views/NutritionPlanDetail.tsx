import React, { useState, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Printer, 
  Share2, 
  Edit3, 
  Plus, 
  MoreVertical, 
  Flame, 
  Clock, 
  Sunrise, 
  Sun, 
  Moon, 
  Cookie,
  Trash2,
  PieChart,
  Droplets,
  BookOpen,
  Search,
  Filter,
  ChevronRight,
  AlertTriangle,
  Grid,
  X,
  GripVertical,
  Check
} from 'lucide-react';
import { useFoodContext, FoodItem } from '../context/FoodContext';
import { fetchWithAuth } from '../api';
import { useClient } from '../context/ClientContext';

interface NutritionPlanDetailProps {
  client: any;
  isNewPlan?: boolean;
  initialPlanData?: any;
  onBack: () => void;
  selectedDay?: string | null;
}

interface PlannedFoodItem {
  id: string;           // unique id for this meal entry
  foodId: string;       // reference to the food library item
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  quantity: number;     // multiplier over base servingSize
}

interface MacroCategory {
  id: string;
  label: string;
  example: string;
  amount: number;    // grams target
  color: string;     // left-border color class
}

interface MealBlock {
  id: number;
  name: string;
  time: string;
  icon: React.ElementType;
  iconColor: string;
  items: PlannedFoodItem[];     // used in example mode
  categories: MacroCategory[];  // used in general mode
}

const MACRO_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];

const defaultCategories = (): MacroCategory[] => [
  { id: 'p', label: 'Lean Protein Source', example: 'e.g., Egg whites, Greek Yogurt, Whey', amount: 30, color: 'bg-blue-500' },
  { id: 'c', label: 'Complex Carbohydrates', example: 'e.g., Oats, Whole grain toast, Berries', amount: 45, color: 'bg-emerald-500' },
  { id: 'f', label: 'Healthy Fats', example: 'e.g., Almond butter, Chia seeds', amount: 15, color: 'bg-amber-500' },
];

const DEFAULT_MEALS: MealBlock[] = [
  { id: 1, name: 'Breakfast', time: '08:00 AM', icon: Sunrise, iconColor: 'bg-orange-100 text-orange-600', items: [], categories: defaultCategories() },
  { id: 2, name: 'Lunch', time: '12:30 PM', icon: Sun, iconColor: 'bg-yellow-100 text-yellow-600', items: [], categories: defaultCategories() },
  { id: 3, name: 'Dinner', time: '07:30 PM', icon: Moon, iconColor: 'bg-blue-100 text-blue-600', items: [], categories: defaultCategories() }
];

// ─── Static generic items for General Mode library ────────────────────────────

interface GeneralItem {
  id: string;
  label: string;
  description: string;
  color: string;   // bar color class
  bgColor: string; // background badge color
  defaultAmount: number;
}

const GENERAL_MACRO_ITEMS: GeneralItem[] = [
  { id: 'lean-protein',   label: 'Lean Protein Source',     description: 'Chicken, turkey, eggs, Greek yogurt, whey',  color: 'bg-blue-500',    bgColor: 'bg-blue-50 text-blue-600',    defaultAmount: 30 },
  { id: 'complex-carbs',  label: 'Complex Carbohydrates',   description: 'Oats, sweet potato, brown rice, berries',     color: 'bg-emerald-500', bgColor: 'bg-emerald-50 text-emerald-600', defaultAmount: 45 },
  { id: 'healthy-fats',   label: 'Healthy Fats',            description: 'Avocado, olive oil, nuts, chia seeds',        color: 'bg-amber-500',   bgColor: 'bg-amber-50 text-amber-600',   defaultAmount: 15 },
  { id: 'fibrous-veg',    label: 'Fibrous Vegetables',      description: 'Broccoli, spinach, peppers, zucchini',        color: 'bg-green-500',   bgColor: 'bg-green-50 text-green-600',   defaultAmount: 200 },
  { id: 'starchy-carbs',  label: 'Starchy Carbohydrates',   description: 'Quinoa, whole grain pasta, lentils',           color: 'bg-purple-500',  bgColor: 'bg-purple-50 text-purple-600', defaultAmount: 60 },
  { id: 'dairy-protein',  label: 'Dairy / Protein Shake',   description: 'Milk, cottage cheese, protein powder',        color: 'bg-sky-500',     bgColor: 'bg-sky-50 text-sky-600',       defaultAmount: 250 },
  { id: 'fruit',          label: 'Fruit',                   description: 'Berries, banana, apple, melon',               color: 'bg-pink-500',    bgColor: 'bg-pink-50 text-pink-600',     defaultAmount: 100 },
];

export default function NutritionPlanDetail({ client, isNewPlan, initialPlanData, onBack, selectedDay }: NutritionPlanDetailProps) {
  const { foods } = useFoodContext();
  const { reloadClients } = useClient();
  const [meals, setMeals] = useState<MealBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');

  // Load existing plan on mount
  React.useEffect(() => {
    const fetchPlan = async () => {
      // If we already have initialPlanData, use it and skip fetch
      if (initialPlanData && initialPlanData.data_json?.meals) {
        const icons: Record<string, React.ElementType> = { Sunrise, Sun, Moon, Cookie };
        const loadedMeals = initialPlanData.data_json.meals.map((m: any) => ({
          ...m,
          icon: icons[m.iconName] || Sunrise
        }));
        setMeals(loadedMeals);
        if (initialPlanData.data_json.mode) setMode(initialPlanData.data_json.mode);
        return;
      }

      if (!client?.id) return;
      setIsLoading(true);
      try {
        const data = await fetchWithAuth(`/manager/clients/${client.id}/nutrition-plan`);
        if (data && data.data_json && data.data_json.meals) {
          // Reconstruct icon functions from components
          const icons: Record<string, React.ElementType> = { Sunrise, Sun, Moon, Cookie };
          const loadedMeals = data.data_json.meals.map((m: any) => ({
            ...m,
            icon: icons[m.iconName] || Sunrise
          }));
          setMeals(loadedMeals);
          if (data.data_json.mode) setMode(data.data_json.mode);
        } else {
          // If no plan, set defaults
          setMeals(DEFAULT_MEALS);
        }
      } catch (err) {
        console.error('Error fetching nutrition plan:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [client?.id, initialPlanData]);

  const savePlan = async () => {
    if (!client?.id) return;
    setIsSaving(true);
    try {
      // Stringify meals but keep icon name for reconstruction
      const mealsToSave = meals.map(m => ({
        ...m,
        icon: undefined, // cannot stringify components
        iconName: m.name.includes('Breakfast') ? 'Sunrise' : m.name.includes('Lunch') ? 'Sun' : m.name.includes('Dinner') ? 'Moon' : 'Cookie'
      }));

      await fetchWithAuth(`/manager/clients/${client.id}/nutrition-plan`, {
        method: 'POST',
        body: JSON.stringify({
          name: `Plan de Nutrición - ${client.name}`,
          data_json: { meals: mealsToSave, mode }
        })
      });
      
      // Trigger a reload of clients to update assignment status in dashboard
      await reloadClients();
      
      alert('Plan guardado correctamente');
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('Error al guardar el plan');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Food drop state ──────────────────────────────────────────────────────
  const [dragOverMealId, setDragOverMealId] = useState<number | null>(null);
  const dragFoodRef = useRef<FoodItem | null>(null);
  const dragGeneralRef = useRef<GeneralItem | null>(null); // for General Mode drag

  // ─── Quantity edit state ───────────────────────────────────────────────────
  const [editingItem, setEditingItem] = useState<{ mealId: number; itemId: string } | null>(null);
  const [editingQty, setEditingQty] = useState<string>('1');

  // ─── Block drag-reorder state ─────────────────────────────────────────────
  const dragBlockRef = useRef<number | null>(null);  // meal.id being dragged
  const [dragOverBlockId, setDragOverBlockId] = useState<number | null>(null);

  // ─── Block inline edit state ──────────────────────────────────────────────
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [editingBlockName, setEditingBlockName] = useState('');
  const [editingBlockTime, setEditingBlockTime] = useState('');

  // ─── New block modal state ────────────────────────────────────────────────
  const [showNewBlockModal, setShowNewBlockModal] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockTime, setNewBlockTime] = useState('12:00 PM');

  const [isDrafting] = useState(isNewPlan || true);
  const [mode, setMode] = useState<'general' | 'example'>('general');
  const filteredLibraryFoods = foods.filter(f =>
    !librarySearch || f.name.toLowerCase().includes(librarySearch.toLowerCase())
  );

  // ─── General mode: update category amount ─────────────────────────────────
  const updateCategoryAmount = (mealId: number, catId: string, amount: number) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId
        ? { ...m, categories: m.categories.map(c => c.id === catId ? { ...c, amount } : c) }
        : m
    ));
  };

  const addCategory = (mealId: number) => {
    const colors = MACRO_COLORS;
    setMeals(prev => prev.map(m => {
      if (m.id !== mealId) return m;
      const newCat: MacroCategory = {
        id: `${Date.now()}`,
        label: 'New Macro Category',
        example: 'e.g., description',
        amount: 0,
        color: colors[m.categories.length % colors.length]
      };
      return { ...m, categories: [...m.categories, newCat] };
    }));
  };

  const removeCategory = (mealId: number, catId: string) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId ? { ...m, categories: m.categories.filter(c => c.id !== catId) } : m
    ));
  };

  // ─── Drag from library (foods) ─────────────────────────────────────────────
  const handleDragStart = (food: FoodItem) => {
    dragFoodRef.current = food;
    dragGeneralRef.current = null;
    dragBlockRef.current = null; // clear block drag
  };

  // ─── Drag from General Mode library ───────────────────────────────────────
  const handleGeneralDragStart = (item: GeneralItem) => {
    dragGeneralRef.current = item;
    dragFoodRef.current = null;
    dragBlockRef.current = null;
  };

  const handleDragOver = useCallback((e: React.DragEvent, mealId: number) => {
    e.preventDefault();
    // Only set drop target if dragging a food or general item (not a block)
    if (dragFoodRef.current !== null || dragGeneralRef.current !== null) setDragOverMealId(mealId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverMealId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, mealId: number) => {
    e.preventDefault();
    setDragOverMealId(null);

    // ─ General Mode: drop a macro category ─
    if (dragGeneralRef.current) {
      const g = dragGeneralRef.current;
      const newCat: MacroCategory = {
        id: `${g.id}-${Date.now()}`,
        label: g.label,
        example: g.description,
        amount: g.defaultAmount,
        color: g.color
      };
      setMeals(prev => prev.map(m =>
        m.id === mealId ? { ...m, categories: [...m.categories, newCat] } : m
      ));
      dragGeneralRef.current = null;
      return;
    }

    // ─ Example Mode: drop a food item ─
    if (!dragFoodRef.current) return;
    const food = dragFoodRef.current;
    const newItem: PlannedFoodItem = {
      id: `${Date.now()}-${Math.random()}`,
      foodId: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      servingSize: food.servingSize,
      quantity: 1
    };
    setMeals(prev => prev.map(m =>
      m.id === mealId ? { ...m, items: [...m.items, newItem] } : m
    ));
    dragFoodRef.current = null;
  }, []);

  // ─── Block drag-to-reorder ────────────────────────────────────────────────
  const handleBlockDragStart = (e: React.DragEvent, mealId: number) => {
    dragFoodRef.current = null;  // clear food drag
    dragBlockRef.current = mealId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDragOver = (e: React.DragEvent, mealId: number) => {
    e.preventDefault();
    if (dragBlockRef.current === null || dragBlockRef.current === mealId) return;
    setDragOverBlockId(mealId);
  };

  const handleBlockDrop = (e: React.DragEvent, targetMealId: number) => {
    e.preventDefault();
    setDragOverBlockId(null);
    const fromId = dragBlockRef.current;
    dragBlockRef.current = null;
    if (fromId === null || fromId === targetMealId) return;
    setMeals(prev => {
      const fromIdx = prev.findIndex(m => m.id === fromId);
      const toIdx = prev.findIndex(m => m.id === targetMealId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [removed] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, removed);
      return next;
    });
  };

  const handleBlockDragEnd = () => {
    dragBlockRef.current = null;
    setDragOverBlockId(null);
  };

  // ─── Block inline edit ────────────────────────────────────────────────────
  const startEditBlock = (meal: MealBlock) => {
    setEditingBlockId(meal.id);
    setEditingBlockName(meal.name);
    setEditingBlockTime(meal.time);
  };

  const commitEditBlock = () => {
    if (editingBlockId === null) return;
    setMeals(prev => prev.map(m =>
      m.id === editingBlockId
        ? { ...m, name: editingBlockName.trim() || m.name, time: editingBlockTime.trim() || m.time }
        : m
    ));
    setEditingBlockId(null);
  };

  // ─── Remove food item from meal ────────────────────────────────────────────
  const removeItem = (mealId: number, itemId: string) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId ? { ...m, items: m.items.filter(i => i.id !== itemId) } : m
    ));
  };

  // ─── Quantity editing ──────────────────────────────────────────────────────
  const startEditQty = (mealId: number, item: PlannedFoodItem) => {
    setEditingItem({ mealId, itemId: item.id });
    setEditingQty(String(item.quantity));
  };

  const commitEditQty = () => {
    if (!editingItem) return;
    const qty = parseFloat(editingQty);
    if (!isNaN(qty) && qty > 0) {
      setMeals(prev => prev.map(m =>
        m.id === editingItem.mealId
          ? {
              ...m,
              items: m.items.map(i =>
                i.id === editingItem.itemId ? { ...i, quantity: qty } : i
              )
            }
          : m
      ));
    }
    setEditingItem(null);
  };

  // ─── Meal block management ─────────────────────────────────────────────────
  const addMealBlock = () => {
    setNewBlockName('');
    setNewBlockTime('12:00 PM');
    setShowNewBlockModal(true);
  };

  const confirmAddMealBlock = () => {
    const icons = [Sunrise, Sun, Moon, Cookie];
    const colors = [
      'bg-orange-100 text-orange-600',
      'bg-yellow-100 text-yellow-600',
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600'
    ];
    const id = Date.now();
    setMeals(prev => [
      ...prev,
      {
        id,
        name: newBlockName.trim() || 'New Meal',
        time: newBlockTime.trim() || '12:00 PM',
        icon: icons[prev.length % icons.length],
        iconColor: colors[prev.length % colors.length],
        items: [],
        categories: defaultCategories()
      }
    ]);
    setShowNewBlockModal(false);
  };

  const updateMealName = (mealId: number, name: string) => {
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, name } : m));
  };

  const removeMealBlock = (mealId: number) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
  };

  // ─── Totals ────────────────────────────────────────────────────────────────
  const totalCalories = meals.reduce((acc, m) =>
    acc + m.items.reduce((a, i) => a + i.calories * i.quantity, 0), 0
  );
  const totalProtein = meals.reduce((acc, m) =>
    acc + m.items.reduce((a, i) => a + i.protein * i.quantity, 0), 0
  );
  const totalCarbs = meals.reduce((acc, m) =>
    acc + m.items.reduce((a, i) => a + i.carbs * i.quantity, 0), 0
  );
  const totalFats = meals.reduce((acc, m) =>
    acc + m.items.reduce((a, i) => a + i.fats * i.quantity, 0), 0
  );

  const totalItems = meals.reduce((a, m) => a + m.items.length, 0);

  // ─── Macro ring ────────────────────────────────────────────────────────────
  const circumference = 2 * Math.PI * 40; // r=40
  const proteinDash = totalCalories > 0 ? (totalProtein * 4 / totalCalories) * circumference : 0;
  const carbsDash = totalCalories > 0 ? (totalCarbs * 4 / totalCalories) * circumference : 0;
  const fatsDash = totalCalories > 0 ? (totalFats * 9 / totalCalories) * circumference : 0;

  return (
    <>
    <div className="w-full p-6 md:p-8 lg:p-10 flex flex-col">
      {/* Breadcrumb & Client Header */}
      <div className="mb-6">
        <nav className="flex text-sm text-slate-500 mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onBack} className="inline-flex items-center text-slate-500 hover:text-emerald-600 transition-colors">
                Nutrition
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />
                <span className="text-slate-800 font-medium">{client?.name || 'Sarah Jenkins'}</span>
              </div>
            </li>
            {selectedDay && (
              <li>
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />
                  <span className="text-emerald-600 font-bold capitalize">{selectedDay}</span>
                </div>
              </li>
            )}
          </ol>
        </nav>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            <div 
              className="w-16 h-16 rounded-2xl bg-cover bg-center shadow-sm" 
              style={{ backgroundImage: `url("${client?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'}")` }} 
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900">{client?.name || 'Sarah Jenkins'}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                Goal: Fat Loss
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">Female, 28</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">68kg</span>
            </div>
          </div>
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 text-center">Status</div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <span className={`w-2 h-2 rounded-full ${totalItems === 0 ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
              {totalItems === 0 ? 'Empty Plan' : 'Drafting'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Plan Content */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Actions Header: Mode toggle + Print/Share */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200 flex items-center justify-between shadow-sm">
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 pl-1 bg-slate-50 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => setMode('general')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  mode === 'general'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                General Mode
              </button>
              <button
                onClick={() => setMode('example')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  mode === 'example'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Example Mode
              </button>
            </div>
            <div className="flex gap-2 pr-2">
              <button 
                onClick={savePlan}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  isSaving ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                }`}
              >
                {isSaving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar Plan</>}
              </button>
              <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Print Plan">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Plan List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {mode === 'general' ? 'Daily Structure' : 'Daily Meal Plan'}
                </h2>
                <p className="text-sm text-slate-500">
                  {mode === 'general'
                    ? `${meals.length} meals · ${Math.round(totalCalories)} kcal target`
                    : `${meals.length} meals · ${Math.round(totalCalories)} kcal planned · Drag foods from the library →`
                  }
                </p>
              </div>
              <button 
                onClick={addMealBlock}
                className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Meal Block
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Cargando plan...</p>
                </div>
              ) : meals.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <BookOpen className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium">No hay comidas en este plan</p>
                </div>
              ) : (
                meals.map((meal) => {
                const mealCals = meal.items.reduce((a, i) => a + i.calories * i.quantity, 0);
                const isDropTarget = dragOverMealId === meal.id;

                return (
                  <div
                    key={meal.id}
                    draggable
                    onDragStart={(e) => handleBlockDragStart(e, meal.id)}
                    onDragOver={(e) => handleBlockDragOver(e, meal.id)}
                    onDrop={(e) => handleBlockDrop(e, meal.id)}
                    onDragEnd={handleBlockDragEnd}
                    className={`border rounded-xl p-5 transition-all bg-white shadow-sm ${
                      dragOverBlockId === meal.id
                        ? 'border-emerald-400 border-2 shadow-emerald-100 shadow-md'
                        : isDropTarget
                        ? 'border-emerald-400 bg-emerald-50/40 shadow-emerald-200 shadow-md'
                        : 'border-slate-200 hover:border-emerald-500/50'
                    }`}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Drag handle for block reorder */}
                        <GripVertical className="w-5 h-5 text-slate-300 cursor-grab shrink-0" />
                        <div className={`${meal.iconColor} p-3 rounded-xl shrink-0`}>
                          <meal.icon className="w-6 h-6" />
                        </div>
                        <div>
                          {editingBlockId === meal.id ? (
                            <div className="flex flex-col gap-1.5">
                              <input
                                autoFocus
                                value={editingBlockName}
                                onChange={e => setEditingBlockName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitEditBlock(); if (e.key === 'Escape') setEditingBlockId(null); }}
                                className="text-lg font-bold text-slate-900 border-b-2 border-emerald-400 bg-transparent outline-none w-40"
                                placeholder="Meal name"
                              />
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <input
                                  value={editingBlockTime}
                                  onChange={e => setEditingBlockTime(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') commitEditBlock(); }}
                                  className="text-sm font-medium text-slate-500 border-b border-slate-300 bg-transparent outline-none w-28"
                                  placeholder="e.g. 08:00 AM"
                                />
                                <button onClick={commitEditBlock} className="p-1 bg-emerald-500 text-white rounded-md">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingBlockId(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-bold text-slate-900 text-lg">{meal.name}</h3>
                              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {meal.time}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="font-bold text-slate-700">{Math.round(mealCals)} kcal</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-1 uppercase tracking-widest">
                          <Flame className="w-3.5 h-3.5 text-orange-500" /> 
                          Macros
                        </button>
                        <button
                          onClick={() => startEditBlock(meal)}
                          title="Edit block name & time"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeMealBlock(meal.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* ── General Mode: macro categories ── */}
                    {mode === 'general' && (
                      <div className="pl-[68px] space-y-2 mt-1">
                        {meal.categories.map((cat) => (
                          <div key={cat.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group/cat hover:border-slate-200 transition-all">
                            <div className={`w-1 h-10 rounded-full shrink-0 ${cat.color}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800">{cat.label}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate">{cat.example}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="number"
                                min="0"
                                value={cat.amount}
                                onChange={e => updateCategoryAmount(meal.id, cat.id, parseFloat(e.target.value) || 0)}
                                className="w-14 px-2 py-1 text-sm font-bold text-right border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                              />
                              <span className="text-xs font-bold text-slate-500">g</span>
                              <button
                                onClick={() => removeCategory(meal.id, cat.id)}
                                className="p-1 opacity-0 group-hover/cat:opacity-100 text-slate-300 hover:text-red-500 transition-all rounded-md hover:bg-red-50"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => addCategory(meal.id)}
                          className="w-full p-2.5 border border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add Macro Category
                        </button>
                      </div>
                    )}

                    {/* ── Example Mode: drag-and-drop food items ── */}
                    {mode === 'example' && (
                      <div
                        className="pl-[68px] space-y-2"
                        onDragOver={(e) => handleDragOver(e, meal.id)}
                        onDrop={(e) => handleDrop(e, meal.id)}
                      >
                      {meal.items.length === 0 && (
                        <div className={`p-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all ${
                          isDropTarget ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-400'
                        }`}>
                          <Grid className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {isDropTarget ? 'Drop here to add food' : 'Drag foods from the library into this block'}
                          </span>
                        </div>
                      )}

                      {meal.items.map((item) => {
                        const isEditing = editingItem?.mealId === meal.id && editingItem?.itemId === item.id;
                        const effectiveCals = Math.round(item.calories * item.quantity);
                        const effectiveProtein = Math.round(item.protein * item.quantity * 10) / 10;
                        const effectiveCarbs = Math.round(item.carbs * item.quantity * 10) / 10;
                        const effectiveFats = Math.round(item.fats * item.quantity * 10) / 10;

                        return (
                          <div key={item.id} className="p-3 pr-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3 hover:shadow-md transition-shadow group/item">
                            <GripVertical className="w-4 h-4 text-slate-300 shrink-0 cursor-grab" />
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                              <span className="text-lg">🥗</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                <span className="text-orange-500">{effectiveCals} kcal</span>
                                <span>·</span>
                                <span className="text-blue-500">{effectiveProtein}g P</span>
                                <span>·</span>
                                <span className="text-emerald-500">{effectiveCarbs}g C</span>
                                <span>·</span>
                                <span className="text-amber-500">{effectiveFats}g F</span>
                              </div>
                            </div>

                            {/* Quantity editor */}
                            <div className="flex items-center gap-2 shrink-0">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    autoFocus
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={editingQty}
                                    onChange={e => setEditingQty(e.target.value)}
                                    onBlur={commitEditQty}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEditQty(); }}
                                    className="w-16 px-2 py-1 text-sm font-bold text-center border border-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                  />
                                  <span className="text-xs text-slate-500">×</span>
                                  <button onClick={commitEditQty} className="p-1 bg-emerald-500 text-white rounded-md">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditQty(meal.id, item)}
                                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                                >
                                  ×{item.quantity} <span className="text-[10px] text-slate-400">{item.servingSize}</span>
                                </button>
                              )}
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                              <button 
                                onClick={() => startEditQty(meal.id, item)}
                                className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md hover:bg-blue-50"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => removeItem(meal.id, item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    )}

                  </div>
                );
              })
            )}
            { !isLoading && meals.length > 0 && (
              <div className="pt-4 flex justify-center">
                <button 
                  onClick={addMealBlock}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-200"
                >
                  <Plus className="w-5 h-5" /> Adicionar Bloque de Comida
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Right Column: Stats & Library */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 sticky top-6">
          {/* Live Macro Totals Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Daily Macro Totals</h3>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase tracking-widest">
                {totalItems === 0 ? 'Empty Plan' : 'In Progress'}
              </span>
            </div>
            
            <div className={`relative w-48 h-48 mx-auto mb-8 ${totalItems === 0 ? 'opacity-40 grayscale' : ''}`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="stroke-slate-100" cx="50" cy="50" fill="transparent" r="40" strokeWidth="12"></circle>
                {totalCalories > 0 && (
                  <>
                    <circle
                      className="stroke-blue-500 drop-shadow-sm"
                      cx="50" cy="50" fill="transparent" r="40"
                      strokeDasharray={`${proteinDash} ${circumference}`}
                      strokeDashoffset="0"
                      strokeWidth="12" strokeLinecap="round"
                    />
                    <circle
                      className="stroke-emerald-500 drop-shadow-sm"
                      cx="50" cy="50" fill="transparent" r="40"
                      strokeDasharray={`${carbsDash} ${circumference}`}
                      strokeDashoffset={`-${proteinDash}`}
                      strokeWidth="12" strokeLinecap="round"
                    />
                    <circle
                      className="stroke-amber-500 drop-shadow-sm"
                      cx="50" cy="50" fill="transparent" r="40"
                      strokeDasharray={`${fatsDash} ${circumference}`}
                      strokeDashoffset={`-${proteinDash + carbsDash}`}
                      strokeWidth="12" strokeLinecap="round"
                    />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${totalItems === 0 ? 'text-slate-300' : 'text-slate-900'}`}>
                  {Math.round(totalCalories)}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${totalItems === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                  kcal
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Protein', value: totalProtein, color: totalItems === 0 ? 'bg-slate-300' : 'bg-blue-500', textColor: totalItems === 0 ? 'text-slate-400' : 'text-slate-900' },
                { label: 'Carbs', value: totalCarbs, color: totalItems === 0 ? 'bg-slate-300' : 'bg-emerald-500', textColor: totalItems === 0 ? 'text-slate-400' : 'text-slate-900' },
                { label: 'Fats', value: totalFats, color: totalItems === 0 ? 'bg-slate-300' : 'bg-amber-500', textColor: totalItems === 0 ? 'text-slate-400' : 'text-slate-900' },
              ].map((macro) => (
                <div key={macro.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${macro.color}`}></div>
                    <div>
                      <p className={`text-sm font-bold ${macro.textColor}`}>{macro.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">of total calories</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${macro.textColor}`}>{Math.round(macro.value * 10) / 10}g</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {totalCalories > 0 ? Math.round((macro.value * (macro.label === 'Fats' ? 9 : 4) / totalCalories) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Library Card – mode-conditional */}
          <div className="bg-white rounded-2xl border border-slate-200 p-0 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">
                    {mode === 'general' ? 'General Food Library' : 'Food Library'}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  {mode === 'general' ? `${GENERAL_MACRO_ITEMS.length} items` : `${filteredLibraryFoods.length} items`}
                </span>
              </div>

              {/* Search only in Example Mode */}
              {mode === 'example' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-700 placeholder:text-slate-400 transition-all" 
                      placeholder="Search foods..."
                      value={librarySearch}
                      onChange={e => setLibrarySearch(e.target.value)}
                      type="text"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1">
                    <GripVertical className="w-3 h-3" /> Drag foods into meal blocks
                  </p>
                </>
              )}
              {mode === 'general' && (
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <GripVertical className="w-3 h-3" /> Drag categories into meal blocks
                </p>
              )}
            </div>

            {/* General Mode items */}
            {mode === 'general' && (
              <div className="p-2 space-y-1 max-h-[480px] overflow-y-auto scrollbar-hide">
                {GENERAL_MACRO_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleGeneralDragStart(item)}
                    className="p-3 hover:bg-slate-50 rounded-xl transition-all cursor-grab active:cursor-grabbing group border border-transparent hover:border-slate-200 flex items-center gap-3"
                  >
                    <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                    <div className={`w-2 h-10 rounded-full shrink-0 ${item.color}`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{item.description}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${item.bgColor}`}>
                      {item.defaultAmount}{item.id === 'fibrous-veg' || item.id === 'dairy-protein' || item.id === 'fruit' ? 'g' : 'g'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Example Mode food database items */}
            {mode === 'example' && (
              <div className="p-2 space-y-1 max-h-[420px] overflow-y-auto scrollbar-hide">
                {filteredLibraryFoods.length === 0 && (
                  <div className="p-6 text-center text-sm text-slate-400">No foods match your search.</div>
                )}
                {filteredLibraryFoods.map((food) => (
                  <div
                    key={food.id}
                    draggable
                    onDragStart={() => handleDragStart(food)}
                    className="p-3 hover:bg-slate-50 rounded-xl transition-all cursor-grab active:cursor-grabbing group border border-transparent hover:border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors truncate">{food.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest shrink-0 ml-1">
                            {food.servingSize}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span className="text-orange-500">{food.calories} kcal</span>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span>{food.protein}g P</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span>{food.carbs}g C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span>{food.fats}g F</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button className="w-full py-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center justify-center gap-2">
                View Full Library
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Water Intake Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-900">Water Intake</h3>
            </div>
            <div className="flex items-end gap-1 h-12 mb-2">
              {[100, 80, 60, 0, 0].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-md transition-all ${h > 0 ? 'bg-blue-500' : 'bg-slate-100'}`} 
                  style={{ height: h > 0 ? `${h}%` : '100%', opacity: h > 0 ? h/100 : 1 }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span>Current: 1.5L</span>
              <span>Goal: 2.5L</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* New Meal Block Modal */}
      {showNewBlockModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">New Meal Block</h2>
              <button onClick={() => setShowNewBlockModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Block Name</label>
                <input
                  autoFocus
                  value={newBlockName}
                  onChange={e => setNewBlockName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmAddMealBlock(); }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  placeholder="e.g. Pre-Workout Snack"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Time</label>
                <input
                  value={newBlockTime}
                  onChange={e => setNewBlockTime(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmAddMealBlock(); }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                  placeholder="e.g. 10:30 AM"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewBlockModal(false)}
                  className="flex-1 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddMealBlock}
                  className="flex-1 py-2.5 font-bold bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                >
                  Add Block
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
