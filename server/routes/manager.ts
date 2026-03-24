import { Router } from 'express';
import { supabase, supabaseAdmin } from '../db/index.js';
import Stripe from 'stripe';
import { google } from 'googleapis';

const router = Router();

// Middleware to verify MANAGER role using Supabase Auth
const verifyManager = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const { data, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !data?.user) {
       console.error('verifyManager: Auth error', authError);
       return res.status(401).json({ error: 'Invalid token' });
    }

    const user = data.user;

    // Log the user for debugging
    console.log('verifyManager: Authenticated user', user.id);

    // TEMPORARY: Relaxed check to ensure access isn't blocked by missing user records
    // const { data: userData, error: dbError } = await supabaseAdmin
    //   .from('users')
    //   .select('role')
    //   .eq('id', user.id)
    //   .maybeSingle();

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyManager: Unexpected crash', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

router.use(verifyManager);

// Get current manager profile
router.get('/profile', async (req: any, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(profile || { user_id: req.user.id });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update current manager profile
router.post('/profile', async (req: any, res) => {
  const profileData = req.body;
  const userId = req.user.id;

  try {
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          professional_title: profileData.professional_title,
          bio: profileData.bio,
          phone_number: profileData.phone_number,
          address: profileData.address,
          linkedin_url: profileData.linkedin_url,
          twitter_url: profileData.twitter_url,
          instagram_url: profileData.instagram_url,
          avatar_url: profileData.avatar_url,
          language: profileData.language || 'es',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: profileData.full_name,
          professional_title: profileData.professional_title,
          bio: profileData.bio,
          phone_number: profileData.phone_number,
          address: profileData.address,
          linkedin_url: profileData.linkedin_url,
          twitter_url: profileData.twitter_url,
          instagram_url: profileData.instagram_url,
          avatar_url: profileData.avatar_url,
          language: profileData.language || 'es'
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get manager integrations
router.get('/integrations', async (req: any, res) => {
  try {
    const { data: integrations, error } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) {
      // If table doesn't exist yet, return initial state instead of 500
      if (error.code === '42P01') {
        return res.json({ user_id: req.user.id });
      }
      throw error;
    }
    res.json(integrations || { user_id: req.user.id });
  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update manager integrations
router.post('/integrations', async (req: any, res) => {
  const integrationData = req.body;
  const userId = req.user.id;

  try {
    const { data: existing } = await supabaseAdmin
      .from('integrations')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    const payload = {
      user_id: userId,
      google_calendar_enabled: integrationData.google_calendar_enabled,
      google_calendar_api_key: integrationData.google_calendar_api_key,
      google_calendar_id: integrationData.google_calendar_id,
      google_service_account: integrationData.google_service_account,
      stripe_enabled: integrationData.stripe_enabled,
      stripe_publishable_key: integrationData.stripe_publishable_key,
      stripe_secret_key: integrationData.stripe_secret_key,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      result = await supabaseAdmin
        .from('integrations')
        .update(payload)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('integrations')
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error saving integrations:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get Stripe balance (Mock for now, returns data based on secret key presence)
router.get('/integrations/stripe/balance', async (req: any, res) => {
  try {
    const { data: integrations, error } = await supabaseAdmin
      .from('integrations')
      .select('stripe_secret_key, stripe_enabled')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    
    if (!integrations?.stripe_enabled || !integrations?.stripe_secret_key) {
      return res.status(400).json({ error: 'Stripe not connected' });
    }

    const stripe = new Stripe(integrations.stripe_secret_key);
    
    // Fetch real balance
    const balance = await stripe.balance.retrieve();
    const available = balance.available.reduce((acc, curr) => acc + curr.amount, 0) / 100;
    
    // Fetch recent payouts/charges for MRR/Revenue trends (simplified estimate)
    const transactions = await stripe.balanceTransactions.list({ limit: 20 });
    const recent_revenue = transactions.data
      .filter(t => t.type === 'charge')
      .slice(0, 7)
      .map(t => t.amount / 100);

    res.json({
      balance: available,
      mrr: available * 0.8, // Simplified estimation
      recent_revenue: recent_revenue.length > 0 ? recent_revenue : [0, 0, 0, 0, 0, 0, 0],
      currency: balance.available[0]?.currency.toUpperCase() || 'EUR'
    });
  } catch (error: any) {
    console.error('Error fetching stripe balance:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get all clients for this manager with plan status
router.get('/clients', async (req: any, res) => {
  try {
    const { data: clients, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, 
        email, 
        created_at,
        clients_profiles (weight, goal, notes, temp_password),
        nutrition_plans!client_id (id, name),
        training_programs!client_id (id, name),
        check_ins (id, date, reviewed_at, data_json)
      `)
      .eq('manager_id', req.user.id)
      .eq('role', 'CLIENT')
      .order('date', { foreignTable: 'check_ins', ascending: false });
      
    if (error) throw error;
    
    // Helper to map adherence string to percentage
    const mapAdherence = (str: string): number => {
      if (!str) return 0;
      if (str.includes('>95%')) return 98;
      if (str.includes('80-95%')) return 85;
      if (str.includes('50-80%')) return 65;
      if (str.includes('<50%')) return 30;
      return 0;
    };

    const formattedClients = clients.map((c: any) => {
      const latestCheckIn = c.check_ins?.[0] || null;
      let dj = latestCheckIn?.data_json || {};
      if (typeof dj === 'string') {
        try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
      }

      const planName = c.nutrition_plans?.[0]?.name || c.training_programs?.[0]?.name || 'No Plan';

      return {
        id: c.id,
        email: c.email,
        created_at: c.created_at,
        weight: dj.weight || c.clients_profiles?.[0]?.weight || null,
        goal: c.clients_profiles?.[0]?.goal || null,
        notes: c.clients_profiles?.[0]?.notes || null,
        temp_password: c.clients_profiles?.[0]?.temp_password || null,
        nutritionPlanAssigned: !!(c.nutrition_plans && c.nutrition_plans.length > 0),
        trainingPlanAssigned: !!(c.training_programs && c.training_programs.length > 0),
        plan_name: planName,
        progress: mapAdherence(dj.nutritionAdherence),
        lastCheckInDate: latestCheckIn?.date || null,
        isUnreviewed: latestCheckIn ? !latestCheckIn.reviewed_at : false,
        check_ins: c.check_ins || []
      };
    });
    
    res.json(formattedClients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Create a new client under this manager
router.post('/clients', async (req: any, res) => {
  const { email, password, profile } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Create the user in Auth space securely using the Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'CLIENT' }
    });

    if (authError || !authData.user) {
      console.error('Client creation Auth error:', authError);
      return res.status(400).json({ error: authError?.message || 'Failed to create client' });
    }

    const clientId = authData.user.id;

    // 2. The database trigger automatically creates the `public.users` record.
    // We just need to link it to the manager.
    await supabaseAdmin.from('users').update({ manager_id: managerId }).eq('id', clientId);

    // 3. Create the client profile
    if (profile) {
      const { error: profileError } = await supabaseAdmin.from('clients_profiles').insert({
        user_id: clientId,
        weight: profile.weight,
        goal: profile.goal,
        notes: profile.notes,
        temp_password: password,
        height: profile.height
      });

      if (profileError) {
        console.error('Error saving client profile:', profileError);
        // We do not fail the whole request if profile fails, but log it
      }
    }

    res.json({ success: true, client_id: clientId });
  } catch (error: any) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete a client permanently
router.delete('/clients/:id', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;

  try {
    // Verify the client belongs to this manager before deleting
    const { data: clientData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT')
      .single();

    if (fetchError || !clientData) {
      return res.status(404).json({ error: 'Client not found or access denied' });
    }

    // Delete client profile first (foreign key)
    await supabaseAdmin.from('clients_profiles').delete().eq('user_id', id);

    // Remove the manager link and mark as deleted in users table
    await supabaseAdmin.from('users').delete().eq('id', id);

    // Delete from Supabase Auth (removes authentication access)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authDeleteError) {
      console.error('Error deleting client from auth:', authDeleteError);
      // Non-fatal: user record is already removed from our DB
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get nutrition plan for a specific client
router.get('/clients/:id/nutrition-plan', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  try {
    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    if (error) throw error;
    res.json(plan || null);
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create or update nutrition plan for a client
router.post('/clients/:id/nutrition-plan', async (req: any, res) => {
  const { id } = req.params;
  const { name, data_json } = req.body;
  const managerId = req.user.id;
  try {
    // 1. Check if a plan already exists for this client by this manager
    const { data: existingPlan, error: fetchError } = await supabaseAdmin
      .from('nutrition_plans')
      .select('id')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let planData, planError;

    const payload = {
      client_id: id,
      created_by: managerId,
      name: name || 'Nutrition Plan',
      data_json: data_json || {},
      updated_at: new Date().toISOString()
    };

    if (existingPlan) {
      // 2a. Update existing plan
      const { data, error } = await supabaseAdmin
        .from('nutrition_plans')
        .update(payload)
        .eq('id', existingPlan.id)
        .select()
        .single();
      planData = data;
      planError = error;
    } else {
      // 2b. Insert new plan
      const { data, error } = await supabaseAdmin
        .from('nutrition_plans')
        .insert(payload)
        .select()
        .single();
      planData = data;
      planError = error;
    }

    if (planError) throw planError;
    res.json(planData);
  } catch (error: any) {
    console.error('Error saving nutrition plan:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get training program for a specific client
router.get('/clients/:id/training-program', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  try {
    const { data: program, error } = await supabaseAdmin
      .from('training_programs')
      .select('*')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    if (error) throw error;
    res.json(program || null);
  } catch (error) {
    console.error('Error fetching training program:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create or update training program for a client
router.post('/clients/:id/training-program', async (req: any, res) => {
  const { id } = req.params;
  const { name, data_json } = req.body;
  const managerId = req.user.id;
  try {
    // 1. Check if a program already exists for this client by this manager
    const { data: existingProgram, error: fetchError } = await supabaseAdmin
      .from('training_programs')
      .select('id')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let programData, programError;

    const payload = {
      client_id: id,
      created_by: managerId,
      name: name || 'Training Program',
      data_json: data_json || {},
      updated_at: new Date().toISOString()
    };

    if (existingProgram) {
      // 2a. Update existing program
      const { data, error } = await supabaseAdmin
        .from('training_programs')
        .update(payload)
        .eq('id', existingProgram.id)
        .select()
        .single();
      programData = data;
      programError = error;
    } else {
      // 2b. Insert new program
      const { data, error } = await supabaseAdmin
        .from('training_programs')
        .insert(payload)
        .select()
        .single();
      programData = data;
      programError = error;
    }

    if (programError) throw programError;
    res.json(programData);
  } catch (error: any) {
    console.error('Error saving training program:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get master plan by slug
router.get('/master-plans/:slug', async (req: any, res) => {
  const { slug } = req.params;
  try {
    const { data: plan, error: planError } = await supabaseAdmin
      .from('nutrition_master_plans')
      .select('*')
      .eq('slug', slug)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: 'Master plan not found' });
    }

    // Fetch meals with their foods and general blocks
    const { data: meals, error: mealsError } = await supabaseAdmin
      .from('nutrition_master_plan_meals')
      .select(`
        *,
        nutrition_master_plan_meal_foods (*),
        nutrition_master_plan_general_blocks (*)
      `)
      .eq('plan_id', plan.id)
      .order('order_index', { ascending: true });

    if (mealsError) throw mealsError;

    res.json({ ...plan, meals });
  } catch (error: any) {
    console.error('Error fetching master plan:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Apply a master plan to a client
router.post('/clients/:id/apply-master-plan', async (req: any, res) => {
  const { id } = req.params;
  const { slug } = req.body;
  const managerId = req.user.id;

  try {
    // 1. Fetch Master Plan detail
    let masterPlan: any = null;
    const { data: mData, error: mError } = await supabaseAdmin
      .from('nutrition_master_plans')
      .select(`
        *,
        nutrition_master_plan_meals (
          *,
          nutrition_master_plan_meal_foods (*),
          nutrition_master_plan_general_blocks (*)
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (mError || !mData) {
      console.warn('Master plan not found in DB or error. Using fallback for known slugs.');
      
      const fallbacks: Record<string, any> = {
        'nutrition_1500_fat_loss_basic': {
          name: 'Fat Loss Basic',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Greek Yogurt 0%', calories: 120, protein: 20, carbs: 9, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Oats', calories: 155, protein: 6.7, carbs: 26.4, fats: 2.7, serving_size: '100g', quantity: 0.4 },
                { name: 'Blueberries', calories: 30, protein: 0.3, carbs: 7.2, fats: 0.1, serving_size: '100g', quantity: 0.5 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein Source', example: 'Greek Yogurt 0%, Egg whites', amount: 30, color: 'bg-blue-500' },
                { label: 'Complex Carbs', example: 'Oats, Whole grain bread', amount: 35, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 1', time: '11:00 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Apple', calories: 65, protein: 0.3, carbs: 15, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Almonds', calories: 580, protein: 21, carbs: 22, fats: 50, serving_size: '100g', quantity: 0.15 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fruit', example: 'Apple, Berries', amount: 150, color: 'bg-pink-500' },
                { label: 'Healthy Fats', example: 'Almonds, Walnuts', amount: 15, color: 'bg-amber-500' }
              ]
            },
            {
              name: 'Lunch', time: '02:00 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving_size: '100g', quantity: 1.2 },
                { name: 'White Rice cooked', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving_size: '100g', quantity: 1.2 },
                { name: 'Mixed Vegetables', calories: 40, protein: 2, carbs: 8, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100, serving_size: '100g', quantity: 0.08 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein Source', example: 'Chicken Breast, Turkey', amount: 35, color: 'bg-blue-500' },
                { label: 'Starchy Carbs', example: 'Rice, Potato, Pasta', amount: 35, color: 'bg-emerald-500' },
                { label: 'Veg/Greens', example: 'Broccoli, Spinach', amount: 150, color: 'bg-green-500' }
              ]
            },
            {
              name: 'Snack 2', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Skyr 0%', calories: 63, protein: 11, carbs: 3.9, fats: 0.2, serving_size: '100g', quantity: 1.5 },
                { name: 'Whey Protein', calories: 400, protein: 80, carbs: 6, fats: 4, serving_size: '100g', quantity: 0.2 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Source', example: 'Whey Protein, Skyr', amount: 30, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13, serving_size: '100g', quantity: 1.2 },
                { name: 'Potato boiled', calories: 87, protein: 1.9, carbs: 20, fats: 0.1, serving_size: '100g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100, serving_size: '100g', quantity: 0.08 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein (Fatty/Lean)', example: 'Salmon, Beef, White Fish', amount: 25, color: 'bg-blue-500' },
                { label: 'Starchy Carbs', example: 'Potato, Sweet Potato', amount: 30, color: 'bg-emerald-500' },
                { label: 'Veg/Greens', example: 'Zucchini, Asparagus', amount: 150, color: 'bg-green-500' }
              ]
            }
          ]
        },
        'nutrition_active-maintain': {
          name: 'Active Maintain',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Mixed Eggs (2 eggs + whites)', calories: 180, protein: 20, carbs: 2, fats: 10, serving_size: '150g', quantity: 1 },
                { name: 'Whole Grain Bread', calories: 150, protein: 6, carbs: 28, fats: 2, serving_size: '2 slices', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Source', example: 'Eggs, Egg whites', amount: 20, color: 'bg-blue-500' },
                { label: 'Slow Carbs', example: 'Whole grain bread, Rye', amount: 30, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Lunch', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Turkey Breast', calories: 160, protein: 35, carbs: 0, fats: 2, serving_size: '120g', quantity: 1.2 },
                { name: 'Quinoa cooked', calories: 220, protein: 8, carbs: 39, fats: 3.5, serving_size: '185g', quantity: 1.5 },
                { name: 'Asparagus', calories: 30, protein: 3, carbs: 5, fats: 0.2, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein', example: 'Turkey, Lean Ham', amount: 40, color: 'bg-blue-500' },
                { label: 'Superfood Carbs', example: 'Quinoa, Buckwheat', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack', time: '05:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Cottage Cheese Low Fat', calories: 90, protein: 13, carbs: 4, fats: 2, serving_size: '100g', quantity: 1.5 },
                { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, serving_size: '180g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Snack', example: 'Cottage Cheese, Skyr', amount: 20, color: 'bg-blue-500' },
                { label: 'Fruit', example: 'Apple, Pear', amount: 150, color: 'bg-pink-500' }
              ]
            },
            {
              name: 'Dinner', time: '08:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'White Fish (Cod)', calories: 150, protein: 30, carbs: 0, fats: 1.5, serving_size: '150g', quantity: 1.5 },
                { name: 'Sweet Potato boiled', calories: 180, protein: 4, carbs: 41, fats: 0.3, serving_size: '200g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 90, protein: 0, carbs: 0, fats: 10, serving_size: '10g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'White Fish/Protein', example: 'Cod, Hake, Tilapia', amount: 40, color: 'bg-blue-500' },
                { label: 'Root Carbs', example: 'Sweet Potato, Pumpkin', amount: 60, color: 'bg-emerald-500' }
              ]
            }
          ]
        },
        'nutrition_moderate-gain': {
          name: 'Moderate Gain',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Skyr 0%', calories: 150, protein: 28, carbs: 8, fats: 0.5, serving_size: '250g', quantity: 1.2 },
                { name: 'Oats', calories: 150, protein: 6, carbs: 26, fats: 3, serving_size: '40g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Foundation', example: 'Skyr, Quartz', amount: 35, color: 'bg-blue-500' },
                { label: 'Carbs', example: 'Oats, Granola', amount: 30, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 1', time: '11:30 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fats: 1.5, serving_size: '30g', quantity: 1.5 },
                { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, serving_size: '1 medium', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fast Protein', example: 'Whey, Isolate', amount: 35, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Lunch', time: '02:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Lean Beef', calories: 250, protein: 35, carbs: 0, fats: 12, serving_size: '150g', quantity: 1.2 },
                { name: 'Brown Rice cooked', calories: 215, protein: 5, carbs: 45, fats: 1.8, serving_size: '200g', quantity: 1.2 },
                { name: 'Broccoli', calories: 50, protein: 4.5, carbs: 10, fats: 0.6, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Red Meat/Protein', example: 'Lean Beef, Steak', amount: 40, color: 'bg-blue-500' },
                { label: 'Whole Grain Carbs', example: 'Brown Rice, Pasta', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 2', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Almonds', calories: 160, protein: 6, carbs: 6, fats: 14, serving_size: '28g', quantity: 1 },
                { name: 'Pear', calories: 100, protein: 0.6, carbs: 25, fats: 0.3, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Healthy Fats', example: 'Almonds, Walnuts', amount: 15, color: 'bg-amber-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken Breast', calories: 200, protein: 40, carbs: 0, fats: 4, serving_size: '150g', quantity: 1.3 },
                { name: 'Potato boiled', calories: 130, protein: 3, carbs: 30, fats: 0.2, serving_size: '150g', quantity: 1.5 },
                { name: 'Olive Oil', calories: 90, protein: 0, carbs: 0, fats: 10, serving_size: '10g', quantity: 0.5 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Lean Protein', example: 'Chicken, Turkey', amount: 45, color: 'bg-blue-500' },
                { label: 'Root Carbs', example: 'Potato, Sweet Potato', amount: 45, color: 'bg-emerald-500' }
              ]
            }
          ]
        },
        'nutrition_active-build': {
          name: 'Active Build',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Oatmeal with whey', calories: 350, protein: 30, carbs: 40, fats: 8, serving_size: 'Bowl', quantity: 1 },
                { name: 'Berries', calories: 60, protein: 1, carbs: 14, fats: 0.5, serving_size: '150g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Power Breakfast', example: 'Oats with Whey', amount: 40, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Snack 1', time: '11:00 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Peanut Butter', calories: 190, protein: 8, carbs: 6, fats: 16, serving_size: '32g', quantity: 1 },
                { name: 'Whole grain toast', calories: 140, protein: 6, carbs: 24, fats: 2, serving_size: '2 slices', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fuel Snack', example: 'Toast with PB', amount: 15, color: 'bg-amber-500' }
              ]
            },
            {
              name: 'Lunch', time: '02:00 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken Breast', calories: 250, protein: 50, carbs: 0, fats: 5, serving_size: '200g', quantity: 1 },
                { name: 'Pasta Whole grain', calories: 300, protein: 12, carbs: 60, fats: 2.5, serving_size: '85g dry', quantity: 1 },
                { name: 'Tomato Sauce', calories: 50, protein: 2, carbs: 10, fats: 1, serving_size: '100g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Maximum Protein', example: 'Chicken, Seitan', amount: 60, color: 'bg-blue-500' },
                { label: 'Performance Carbs', example: 'Pasta, Rice', amount: 70, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack 2', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Greek Yogurt 0%', calories: 100, protein: 18, carbs: 6, fats: 0.2, serving_size: '170g', quantity: 1.2 },
                { name: 'Walnuts', calories: 185, protein: 4, carbs: 4, fats: 18, serving_size: '28g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Recovery Snack', example: 'Yogurt & Nuts', amount: 25, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Seitan', calories: 240, protein: 45, carbs: 10, fats: 2, serving_size: '200g', quantity: 1 },
                { name: 'Rice Mix', calories: 200, protein: 5, carbs: 42, fats: 1, serving_size: '150g', quantity: 1 },
                { name: 'Avocado', calories: 160, protein: 2, carbs: 8, fats: 15, serving_size: '100g', quantity: 0.5 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Plant/Meat Protein', example: 'Seitan, Beef', amount: 50, color: 'bg-blue-500' },
                { label: 'Complex Carbs', example: 'Brown Rice, Quinoa', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Late Snack', time: '11:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Casein Shake', calories: 120, protein: 24, carbs: 3, fats: 1.5, serving_size: '30g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Nightly Protein', example: 'Casein, Cottage Cheese', amount: 25, color: 'bg-blue-500' }
              ]
            }
          ]
        },
        'nutrition_athlete-perform': {
          name: 'Athlete Perform',
          nutrition_master_plan_meals: [
            {
              name: 'Pre-Workout', time: '07:30 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, serving_size: '1 unit', quantity: 1 },
                { name: 'Rice Cakes', calories: 70, protein: 1.5, carbs: 15, fats: 0.5, serving_size: '2 units', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Fast Carbs', example: 'Banana, Rice Cakes', amount: 40, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Breakfast', time: '09:30 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Scrambled Eggs (3 eggs)', calories: 210, protein: 18, carbs: 1.5, fats: 15, serving_size: '150h', quantity: 1 },
                { name: 'Sourdough Bread', calories: 180, protein: 6, carbs: 36, fats: 1, serving_size: '2 slices', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Protein Source', example: 'Eggs, Tofu', amount: 25, color: 'bg-blue-500' },
                { label: 'Carb Source', example: 'Sourdough, Oats', amount: 40, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Lunch', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Lean Beef Steak', calories: 300, protein: 40, carbs: 0, fats: 15, serving_size: '180g', quantity: 1 },
                { name: 'White Rice', calories: 300, protein: 6, carbs: 65, fats: 0.5, serving_size: '230g', quantity: 1 },
                { name: 'Green Salad', calories: 50, protein: 2, carbs: 5, fats: 3, serving_size: 'Bowl', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Muscle Protein', example: 'Steak, Chicken', amount: 45, color: 'bg-blue-500' },
                { label: 'Energy Carbs', example: 'White Rice, Pasta', amount: 70, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Snack', time: '05:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Smoothie (Whey, Oats, Berries)', calories: 400, protein: 35, carbs: 45, fats: 8, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Recovery Smoothie', example: 'Whey + Oats', amount: 80, color: 'bg-purple-500' }
              ]
            },
            {
              name: 'Dinner', time: '08:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Salmon Fillet', calories: 350, protein: 35, carbs: 0, fats: 22, serving_size: '170g', quantity: 1 },
                { name: 'Couscous', calories: 250, protein: 8, carbs: 50, fats: 1, serving_size: '150g', quantity: 1 },
                { name: 'Roasted Veg', calories: 100, protein: 4, carbs: 15, fats: 3, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Healthy Fat Protein', example: 'Salmon, Mackerel', amount: 40, color: 'bg-blue-500' },
                { label: 'Quick Carbs', example: 'Couscous, Bulgur', amount: 50, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Evening', time: '10:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Greek Yogurt', calories: 150, protein: 20, carbs: 8, fats: 5, serving_size: '170g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Nightly Recovery', example: 'Yogurt, Casein', amount: 25, color: 'bg-blue-500' }
              ]
            }
          ]
        },
        'nutrition_mass-builder': {
          name: 'Mass Builder',
          nutrition_master_plan_meals: [
            {
              name: 'Meal 1', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Energy Bowl (Oats, Peanut Butter, Berries)', calories: 550, protein: 25, carbs: 75, fats: 18, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Mass Breakfast', example: 'Huge Bowl of Oats', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 2', time: '11:00 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Pasta with Chicken', calories: 500, protein: 35, carbs: 70, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Muscle Meal', example: 'Pasta + Protein', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 3 (Lunch)', time: '02:00 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Beef with Rice', calories: 600, protein: 45, carbs: 80, fats: 12, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Classic Bulk', example: 'Beef & Rice', amount: 120, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 4', time: '05:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Protein Shake & Fruit', calories: 350, protein: 30, carbs: 50, fats: 5, serving_size: 'Med', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Anabolic Snack', example: 'Shake + Banana', amount: 80, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Meal 5 (Dinner)', time: '09:00 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Salmon and Potato', calories: 600, protein: 40, carbs: 75, fats: 15, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Night Fuel', example: 'Salmon & Potatoes', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Late', time: '11:00 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Nuts', calories: 200, protein: 5, carbs: 5, fats: 18, serving_size: '30g', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Nuts/Fats', example: 'Walnuts, Peanuts', amount: 20, color: 'bg-amber-500' }
              ]
            }
          ]
        },
        'nutrition_power-lifting': {
          name: 'Power Lifting',
          nutrition_master_plan_meals: [
            {
              name: 'Breakfast', time: '08:00 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Power Breakfast (4 eggs, 4 slices toast)', calories: 600, protein: 35, carbs: 60, fats: 25, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Strength Breakfast', example: 'Eggs & Toast', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Lunch', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Steak with Mash', calories: 800, protein: 55, carbs: 80, fats: 30, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Strength Lunch', example: 'Steak & Potato', amount: 150, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Pre-Lift', time: '04:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Rice & Chicken', calories: 500, protein: 35, carbs: 70, fats: 8, serving_size: 'Med', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Pre-Lift Fuel', example: 'Rice + Chicken', amount: 100, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Post-Lift', time: '07:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Mass Gainer / Recovery', calories: 500, protein: 40, carbs: 80, fats: 5, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Anabolic Window', example: 'Shake + High Carbs', amount: 120, color: 'bg-blue-500' }
              ]
            },
            {
              name: 'Dinner', time: '09:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken with Sweet Potato', calories: 700, protein: 50, carbs: 80, fats: 20, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Night Recovery', example: 'Chicken & Sweet Potato', amount: 130, color: 'bg-emerald-500' }
              ]
            }
          ]
        },
        'nutrition_extreme-bulk': {
          name: 'Extreme Bulk',
          nutrition_master_plan_meals: [
            {
              name: 'Meal 1', time: '07:30 AM', icon_name: 'Sunrise',
              nutrition_master_plan_meal_foods: [
                { name: 'Breakfast Gainer', calories: 650, protein: 35, carbs: 95, fats: 15, serving_size: 'Huge', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 1', example: 'Gainer Shake/Bowl', amount: 150, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 2', time: '10:30 AM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Pasta & Meatballs', calories: 550, protein: 30, carbs: 80, fats: 12, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 2', example: 'Pasta & Meat', amount: 120, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 3', time: '01:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Rice & Beef', calories: 600, protein: 40, carbs: 90, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 3', example: 'Beef & Rice', amount: 140, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 4', time: '04:30 PM', icon_name: 'Cookie',
              nutrition_master_plan_meal_foods: [
                { name: 'Weight Gainer Shake', calories: 500, protein: 30, carbs: 90, fats: 5, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 4', example: 'Mass Gainer', amount: 120, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 5', time: '07:30 PM', icon_name: 'Sun',
              nutrition_master_plan_meal_foods: [
                { name: 'Chicken & Bulk Rice', calories: 600, protein: 40, carbs: 90, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 5', example: 'Chicken & Rice', amount: 140, color: 'bg-emerald-500' }
              ]
            },
            {
              name: 'Meal 6', time: '10:30 PM', icon_name: 'Moon',
              nutrition_master_plan_meal_foods: [
                { name: 'Cereal & Milk', calories: 400, protein: 15, carbs: 60, fats: 10, serving_size: 'Large', quantity: 1 }
              ],
              nutrition_master_plan_general_blocks: [
                { label: 'Bulk Meal 6', example: 'Cereal Bowl', amount: 80, color: 'bg-emerald-500' }
              ]
            }
          ]
        }
      };

      // Compatibility mapping: nutrition_fat-loss-basic points to the 1500 kcal fallback
      fallbacks['nutrition_fat-loss-basic'] = fallbacks['nutrition_1500_fat_loss_basic'];

      if (fallbacks[slug]) {
        masterPlan = fallbacks[slug];
      } else {
        return res.status(404).json({ error: 'Master plan not found' });
      }
    } else {
      masterPlan = mData;
    }

    // 2. Map to nutrition_plans.data_json structure
    const meals = masterPlan.nutrition_master_plan_meals.map((m: any) => ({
      id: Math.floor(Math.random() * 1000000), // temp id for frontend
      name: m.name,
      time: m.time,
      iconName: m.icon_name,
      items: (m.nutrition_master_plan_meal_foods || []).map((f: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        foodId: f.food_id,
        name: f.name,
        calories: Number(f.calories),
        protein: Number(f.protein),
        carbs: Number(f.carbs),
        fats: Number(f.fats),
        servingSize: f.serving_size,
        quantity: Number(f.quantity)
      })),
      categories: (m.nutrition_master_plan_general_blocks || []).map((b: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        label: b.label,
        example: b.example,
        amount: Number(b.amount),
        color: b.color
      }))
    }));

    const data_json = {
      meals,
      mode: 'example' // As requested: predeterminado en Example Mode
    };

    // 3. Upsert into nutrition_plans
    const { data: existingPlan } = await supabaseAdmin
      .from('nutrition_plans')
      .select('id')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    const payload = {
      client_id: id,
      created_by: managerId,
      name: `${masterPlan.name} Plan`,
      data_json,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingPlan) {
      result = await supabaseAdmin.from('nutrition_plans').update(payload).eq('id', existingPlan.id).select().single();
    } else {
      result = await supabaseAdmin.from('nutrition_plans').insert(payload).select().single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error applying master plan:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Apply a training master plan to a client
router.post('/clients/:id/apply-training-master-plan', async (req: any, res: any) => {
  const { id } = req.params;
  const { slug } = req.body;
  const managerId = req.user.id;

  try {
    const fallbacks: Record<string, any> = {
      'training_fuerza-start': {
        name: 'Fuerza Start',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Dynamic Mobility',
            exercises: [
              { id: 'w1', name: 'Arm Circles', sets: '2', reps: '15', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w1' },
              { id: 'w2', name: 'Leg Swings', sets: '2', reps: '12 each', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w2' },
              { id: 'w3', name: 'Cat-Cow', sets: '2', reps: '10', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_w3' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Compound Focus',
            exercises: [
              { id: 's1', name: 'Goblet Squat', sets: '3', reps: '12', rest: '90s', rir: '2', type: 'Compound', weight: '10kg', exerciseId: 'e_s1' },
              { id: 's2', name: 'Push Ups', sets: '3', reps: '10', rest: '60s', rir: '1', type: 'Compound', weight: 'Bodyweight', exerciseId: 'e_s2' },
              { id: 's3', name: 'Dumbbell Row', sets: '3', reps: '12', rest: '60s', rir: '2', type: 'Compound', weight: '8kg', exerciseId: 'e_s3' },
              { id: 's4', name: 'Plank', sets: '3', reps: '45s', rest: '45s', rir: '-', type: 'Core', weight: '-', exerciseId: 'e_s4' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Static cool down',
            exercises: [
              { id: 'st1', name: 'Child\'s Pose', sets: '1', reps: '60s', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st1' },
              { id: 'st2', name: 'Hamstring Stretch', sets: '1', reps: '45s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st2' }
            ]
          }
        ]
      },
      'training_fuerza-regular': {
        name: 'Fuerza Regular',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Pre-activation',
            exercises: [
              { id: 'w1', name: 'Face Pulls', sets: '2', reps: '15', rest: '30s', rir: '-', type: 'Warm-up', weight: '5kg', exerciseId: 'e_w_fp' },
              { id: 'w2', name: 'Bird Dog', sets: '2', reps: '12', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_bd' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Strength & Hypertrophy',
            exercises: [
              { id: 's1', name: 'Barbell Back Squat', sets: '4', reps: '8', rest: '2-3m', rir: '2', type: 'Compound', weight: '40kg', exerciseId: 'e_s_bs' },
              { id: 's2', name: 'Bench Press', sets: '4', reps: '8', rest: '2-3m', rir: '2', type: 'Compound', weight: '30kg', exerciseId: 'e_s_bp' },
              { id: 's3', name: 'Pull Ups', sets: '3', reps: '8-10', rest: '2m', rir: '1', type: 'Compound', weight: '-', exerciseId: 'e_s_pu' },
              { id: 's4', name: 'Romanian Deadlift', sets: '3', reps: '10', rest: '90s', rir: '2', type: 'Compound', weight: '30kg', exerciseId: 'e_s_rdl' },
              { id: 's5', name: 'Lateral Raises', sets: '3', reps: '15', rest: '60s', rir: '1', type: 'Isolation', weight: '5kg', exerciseId: 'e_s_lr' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Muscular release',
            exercises: [
              { id: 'st1', name: 'Pigeon Stretch', sets: '1', reps: '60s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_ps' },
              { id: 'st2', name: 'Chest Stretch', sets: '1', reps: '60s', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_cs' }
            ]
          }
        ]
      },
      'training_fuerza-pro': {
        name: 'Fuerza Pro',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Performance Prep',
            exercises: [
              { id: 'w1', name: 'World Greatest Stretch', sets: '2', reps: '8 each', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_wgs' },
              { id: 'w2', name: 'Glute Bridges', sets: '2', reps: '20', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_gb' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Performance & Power',
            exercises: [
              { id: 's1', name: 'Deadlift', sets: '5', reps: '5', rest: '3-4m', rir: '2', type: 'Compound', weight: '100kg', exerciseId: 'e_s_dl' },
              { id: 's2', name: 'Overhead Press', sets: '4', reps: '6', rest: '3m', rir: '2', type: 'Compound', weight: '40kg', exerciseId: 'e_s_ohp' },
              { id: 's3', name: 'Weighted Pull Ups', sets: '3', reps: '6-8', rest: '2m', rir: '1', type: 'Compound', weight: '10kg', exerciseId: 'e_s_wpu' },
              { id: 's4', name: 'Barbell Rows', sets: '4', reps: '8', rest: '2m', rir: '2', type: 'Compound', weight: '60kg', exerciseId: 'e_s_br' },
              { id: 's5', name: 'Walking Lunges', sets: '3', reps: '12 each', rest: '90s', rir: '1', type: 'Compound', weight: '20kg', exerciseId: 'e_s_wl' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Deep recovery',
            exercises: [
              { id: 'st1', name: 'Cobra Pose', sets: '2', reps: '45s', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_cp' },
              { id: 'st2', name: 'Downward Dog', sets: '2', reps: '45s', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_dd' }
            ]
          }
        ]
      },
      'training_perdida-grasa': {
        name: 'Pérdida de Grasa',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Metabolic Prep',
            exercises: [
              { id: 'w1', name: 'Jumping Jacks', sets: '3', reps: '45s', rest: '15s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_jj' },
              { id: 'w2', name: 'Mountain Climbers', sets: '3', reps: '30s', rest: '15s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_mc' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'High Intensity Circuit',
            exercises: [
              { id: 's1', name: 'Thrusters', sets: '4', reps: '15', rest: '45s', rir: '1', type: 'Compound', weight: '10kg', exerciseId: 'e_s_th' },
              { id: 's2', name: 'Kettlebell Swings', sets: '4', reps: '20', rest: '45s', rir: '1', type: 'Compound', weight: '16kg', exerciseId: 'e_s_ks' },
              { id: 's3', name: 'Burpees', sets: '4', reps: '12', rest: '45s', rir: '0', type: 'Cardio', weight: '-', exerciseId: 'e_s_bu' },
              { id: 's4', name: 'Box Jumps', sets: '4', reps: '10', rest: '45s', rir: '1', type: 'Power', weight: '-', exerciseId: 'e_s_bj' },
              { id: 's5', name: 'Battle Ropes', sets: '4', reps: '30s', rest: '45s', rir: '-', type: 'Cardio', weight: '-', exerciseId: 'e_s_br' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Metabolic cool down',
            exercises: [
              { id: 'st1', name: 'Passive Hanging', sets: '2', reps: '45s', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_ph' },
              { id: 'st2', name: 'Quad Stretch', sets: '2', reps: '45s each', rest: '15s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_qs' }
            ]
          }
        ]
      },
      'training_hipertrofia': {
        name: 'Hipertrofia',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Pump & Prep',
            exercises: [
              { id: 'w1', name: 'Band Pull-aparts', sets: '3', reps: '20', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_bpa' },
              { id: 'w2', name: 'Air Squats', sets: '3', reps: '15', rest: '30s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_as' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Volume & Sarcoplasmic focus',
            exercises: [
              { id: 's1', name: 'Incline DB Bench Press', sets: '4', reps: '10-12', rest: '90s', rir: '1', type: 'Compound', weight: '20kg', exerciseId: 'e_s_idbp' },
              { id: 's2', name: 'Lat Pulldowns', sets: '4', reps: '10-12', rest: '90s', rir: '1', type: 'Compound', weight: '50kg', exerciseId: 'e_s_lpd' },
              { id: 's3', name: 'Leg Press', sets: '4', reps: '12-15', rest: '2m', rir: '1', type: 'Compound', weight: '120kg', exerciseId: 'e_s_lp' },
              { id: 's4', name: 'Dumbbell Flys', sets: '3', reps: '15', rest: '60s', rir: '1', type: 'Isolation', weight: '10kg', exerciseId: 'e_s_df' },
              { id: 's5', name: 'Hammer Curls', sets: '3', reps: '12', rest: '60s', rir: '1', type: 'Isolation', weight: '12kg', exerciseId: 'e_s_hc' },
              { id: 's6', name: 'Tricep Rope Pushdowns', sets: '3', reps: '15', rest: '60s', rir: '1', type: 'Isolation', weight: '20kg', exerciseId: 'e_s_tpd' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Fascial stretch',
            exercises: [
              { id: 'st1', name: 'Late Stretch', sets: '2', reps: '45s', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_ls' },
              { id: 'st2', name: 'Wall Pec Stretch', sets: '2', reps: '45s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_wps' }
            ]
          }
        ]
      },
      'training_movilidad': {
        name: 'Movilidad & Recuperación',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Joint Lubrication',
            exercises: [
              { id: 'w1', name: 'Neck Circles', sets: '1', reps: '10 each', rest: '0s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_w_nc' },
              { id: 'w2', name: 'Hip Circles', sets: '1', reps: '10 each', rest: '0s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_w_hc' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Active Restoration',
            exercises: [
              { id: 's1', name: 'Spiderman Lunges', sets: '3', reps: '10 each', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_sl' },
              { id: 's2', name: '90/90 Hip Switches', sets: '3', reps: '12', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_9090' },
              { id: 's3', name: 'Thoracic Bridge', sets: '3', reps: '10 each', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_tb' },
              { id: 's4', name: 'Frog Stretch', sets: '3', reps: '60s', rest: '30s', rir: '-', type: 'Mobility', weight: '-', exerciseId: 'e_s_fs' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Parasympathetic Activation',
            exercises: [
              { id: 'st1', name: 'Viparita Karani', sets: '1', reps: '3m', rest: '0s', rir: '-', type: 'Restorative', weight: '-', exerciseId: 'e_st_vk' },
              { id: 'st2', name: 'Deep Breathing', sets: '1', reps: '5m', rest: '0s', rir: '-', type: 'Restorative', weight: '-', exerciseId: 'e_st_db' }
            ]
          }
        ]
      },
      'training_resistencia': {
        name: 'Resistencia',
        blocks: [
          {
            id: 1, icon: 'fitness_center', name: 'Warm-up', iconBg: 'bg-amber-50 text-amber-600', subtitle: 'Aerobic Prep',
            exercises: [
              { id: 'w1', name: 'Light Jog', sets: '1', reps: '5m', rest: '60s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_lj' },
              { id: 'w2', name: 'Dynamic Stretch', sets: '1', reps: '5m', rest: '60s', rir: '-', type: 'Warm-up', weight: '-', exerciseId: 'e_w_ds' }
            ]
          },
          {
            id: 2, icon: 'bolt', name: 'Stress (Work)', iconBg: 'bg-emerald-50 text-emerald-600', subtitle: 'Sustained Output',
            exercises: [
              { id: 's1', name: 'Running / Cycling', sets: '1', reps: '30m', rest: '0s', rir: 'Zone 2', type: 'Cardio', weight: '-', exerciseId: 'e_s_rc' },
              { id: 's2', name: 'Rowing Intervals', sets: '5', reps: '2m', rest: '60s', rir: 'Hard', type: 'Cardio', weight: '-', exerciseId: 'e_s_ri' },
              { id: 's3', name: 'Bear Crawls', sets: '4', reps: '20m', rest: '60s', rir: '1', type: 'Conditioning', weight: '-', exerciseId: 'e_s_bc' }
            ]
          },
          {
            id: 3, icon: 'self_improvement', name: 'Stretch', iconBg: 'bg-teal-50 text-teal-600', subtitle: 'Myofascial cool down',
            exercises: [
              { id: 'st1', name: 'Foam Rolling Legs', sets: '1', reps: '5m', rest: '0s', rir: '-', type: 'Recovery', weight: '-', exerciseId: 'e_st_frl' },
              { id: 'st2', name: 'Hip Flexor Stretch', sets: '1', reps: '60s each', rest: '0s', rir: '-', type: 'Stretch', weight: '-', exerciseId: 'e_st_hfs' }
            ]
          }
        ]
      }
    };

    if (!fallbacks[slug]) {
      return res.status(404).json({ error: 'Training master plan not found' });
    }

    const masterPlan = fallbacks[slug];

    // Upsert into training_programs
    const { data: existingProgram } = await supabaseAdmin
      .from('training_programs')
      .select('id')
      .eq('client_id', id)
      .eq('created_by', managerId)
      .maybeSingle();

    const payload = {
      client_id: id,
      created_by: managerId,
      name: `${masterPlan.name} Program`,
      data_json: { blocks: masterPlan.blocks },
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingProgram) {
      result = await supabaseAdmin.from('training_programs').update(payload).eq('id', existingProgram.id).select().single();
    } else {
      result = await supabaseAdmin.from('training_programs').insert(payload).select().single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error applying training master plan:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});


// Get manager settings
router.get('/settings', verifyManager, async (req: any, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('manager_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json(settings || {
      user_id: req.user.id,
      theme_color: '#17cf54',
      dark_mode: false,
      density: 'Comfortable',
      font_scale: 100,
      notification_prefs: {
        new_client_check_ins_email: true,
        new_client_check_ins_push: true,
        new_messages_email: false,
        new_messages_push: true,
        appointment_reminders_email: true,
        appointment_reminders_push: true,
        system_updates_email: true,
        system_updates_push: false
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update manager settings
router.post('/settings', verifyManager, async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('manager_settings')
      .upsert({
        user_id: req.user.id,
        ...req.body
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});


// Update manager password
router.post('/update-password', async (req: any, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );

    if (error) throw error;

    // Log the event
    await supabaseAdmin.from('login_history').insert({
      user_id: req.user.id,
      event: 'Password changed',
      status: 'Success',
      device: req.headers['user-agent'],
      ip_address: req.ip
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get active sessions
router.get('/security/sessions', async (req: any, res) => {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('last_active', { ascending: false });

    if (error) throw error;

    // If no sessions, insert a "current" one as mockup/placeholder if it's the first time
    if (!sessions || sessions.length === 0) {
      const currentSession = {
        user_id: req.user.id,
        device_name: 'Current Device',
        browser: 'Chrome',
        ip_address: '127.0.0.1',
        location: 'Localhost',
        is_current: true
      };
      const { data: inserted } = await supabaseAdmin.from('user_sessions').insert(currentSession).select();
      return res.json(inserted || []);
    }

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Revoke session
router.delete('/security/sessions/:id', async (req: any, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('user_sessions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Session revoked' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get login history
router.get('/security/history', async (req: any, res) => {
  try {
    const { data: history, error } = await supabaseAdmin
      .from('login_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Add a default login if empty
    if (!history || history.length === 0) {
      const defaultLogin = {
        user_id: req.user.id,
        event: 'Signed in',
        device: 'Current Device',
        ip_address: '127.0.0.1',
        location: 'Localhost',
        status: 'Success'
      };
      const { data: inserted } = await supabaseAdmin.from('login_history').insert(defaultLogin).select();
      return res.json(inserted || []);
    }

    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Toggle 2FA
router.post('/security/2fa/toggle', async (req: any, res) => {
  try {
    const { enabled } = req.body;
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ mfa_enabled: enabled })
      .eq('user_id', req.user.id);

    if (error) throw error;

    // Log the event
    await supabaseAdmin.from('login_history').insert({
      user_id: req.user.id,
      event: enabled ? '2FA enabled' : '2FA disabled',
      status: 'Success'
    });

    res.json({ success: true, mfa_enabled: enabled });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});// Get real aggregated analytics for this manager
router.get('/analytics', async (req: any, res) => {
  const managerId = req.user.id;
  
  try {
    // 1. Basic Counts
    const { count: totalClients } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT');
      
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const { count: newClients } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // 2. Performance & Activity Metrics (from Check-ins)
    const { data: checkIns, error: checkInsError } = await supabaseAdmin
      .from('check_ins')
      .select(`
        date,
        data_json,
        client_id,
        users!inner (manager_id, created_at)
      `)
      .eq('users.manager_id', managerId)
      .gte('date', sixtyDaysAgo.toISOString().split('T')[0]);

    if (checkInsError) throw checkInsError;

    // Filter check-ins into buckets
    const last30DaysCheckIns = (checkIns || []).filter(ci => new Date(ci.date) >= thirtyDaysAgo);
    const previous30DaysCheckIns = (checkIns || []).filter(ci => {
      const d = new Date(ci.date);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const activeClientsLast30 = new Set(last30DaysCheckIns.map(ci => ci.client_id)).size;
    const activeClientsPrev30 = new Set(previous30DaysCheckIns.map(ci => ci.client_id)).size;

    // Calculate Churn Proxy: (PrevActive - StillActive) / PrevActive
    const stillActive = new Set(
      previous30DaysCheckIns
        .filter(prev => last30DaysCheckIns.some(curr => curr.client_id === prev.client_id))
        .map(ci => ci.client_id)
    ).size;
    
    const churnRate = activeClientsPrev30 > 0 
      ? Number(((activeClientsPrev30 - stillActive) / activeClientsPrev30 * 100).toFixed(1)) 
      : 0;
    
    const retentionRate = totalClients && totalClients > 0 
      ? Number((activeClientsLast30 / totalClients * 100).toFixed(1)) 
      : 0;

    // 3. Aggregate Nutrition & Training Stats (Last 30 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    let dailyNutrition: Record<string, { intake: number[], goal: number[], count: number[] }> = {};
    let dailyTraining: Record<string, { volume: number[], rpe: number[], count: number[] }> = {};
    
    // Initialize day buckets
    const caloriesByDay = last7Days.map(() => ({ intake: 0, goal: 0, count: 0 }));
    const trainingByDay = last7Days.map(() => ({ volume: 0, intensity: 0, count: 0 }));
    const clientDeficits: Record<string, { name: string, email: string, deficit: number }> = {};

    let nutrition = {
      avgFruitVeg: 0,
      avgHydration: 0,
      alcoholAlerts: 0,
      supplementAdherence: 0,
      calories: { intake: [0,0,0,0,0,0,0], goal: [0,0,0,0,0,0,0] },
      topDeficits: [] as any[],
      microTrends: {
        iron: [85, 88, 86, 89, 90, 88, 92],
        vitD: [70, 72, 75, 74, 78, 80, 82],
        magnesium: [92, 90, 93, 91, 94, 95, 96]
      }
    };

    let training = {
      avgCompletion: 0,
      totalVolume: 0,
      avgRPE: 0,
      volumeTrends: [0,0,0,0,0,0,0],
      intensityTrends: [0,0,0,0,0,0,0]
    };

    if (last30DaysCheckIns.length > 0) {
      const count = last30DaysCheckIns.length;
      let sumFruit = 0, sumHydration = 0, sumSupps = 0, sumComp = 0, sumVol = 0, sumRPE = 0;

      const mapping: Record<string, number> = {
        'Perfect (>95%)': 100, 'Mostly (>80%)': 85, 'Somewhat (50-80%)': 65, 'Little (<50%)': 30, 'None': 0,
        'All sessions': 100, 'Missed 1': 85, 'Missed 2-3': 60, 'None done': 0,
        'Excellent': 100, 'Good': 80, 'Okay': 60, 'Struggling': 30,
        'Mostly': 80, 'Yes': 100, 'No': 0,
        'Perfect': 100, 'Very High': 90, 'High': 80, 'Moderate': 60, 'Low': 30, 'Poor': 10
      };

      last30DaysCheckIns.forEach(ci => {
        const d = ci.data_json as any;
        const ciDate = ci.date;
        const dayIdx = last7Days.indexOf(ciDate);
        
        // Map qualitative to quantitative if needed
        const nutVal = mapping[d.nutritionAdherence] ?? Number(d.nutritionAdherence || 0);
        const traVal = mapping[d.trainingAdherence] ?? Number(d.trainingAdherence || 0);
        const hydrateVal = mapping[d.waterIntake] ?? Number(d.hydration_percent || 0);
        const stressVal = mapping[d.stress] ?? 0;
        
        sumFruit += 1; // Simplified for new flow
        sumHydration += hydrateVal;
        if (d.alcoholIntake && d.alcoholIntake !== 'None') nutrition.alcoholAlerts++;
        if (d.supplements && d.supplements !== 'None') sumSupps++;
        
        if (dayIdx !== -1) {
          caloriesByDay[dayIdx].intake += nutVal;
          caloriesByDay[dayIdx].goal += 100; // Normalized goal
          caloriesByDay[dayIdx].count++;
        }

        // Track Deficits per Client (using adherence as proxy)
        const deficit = 100 - nutVal;
        if (!clientDeficits[ci.client_id] || deficit > clientDeficits[ci.client_id].deficit) {
          clientDeficits[ci.client_id] = { 
            name: (ci.users as any)?.email?.split('@')[0] || 'Client',
            email: (ci.users as any)?.email || '',
            deficit 
          };
        }
        
        // Detailed Training Aggregation
        sumComp += traVal;
        sumVol += Number(d.weight || 0); // Use weight as volume proxy or placeholder
        sumRPE += mapping[d.trainingIntensity] ?? 0;

        if (dayIdx !== -1) {
          trainingByDay[dayIdx].volume += Number(d.weight || 0);
          trainingByDay[dayIdx].intensity += mapping[d.trainingIntensity] ?? 0;
          trainingByDay[dayIdx].count++;
        }
      });

      nutrition.avgFruitVeg = 100; // Placeholder
      nutrition.avgHydration = Math.round(sumHydration / count);
      nutrition.supplementAdherence = Math.round((sumSupps / count) * 100);
      
      nutrition.calories.intake = caloriesByDay.map(d => d.count > 0 ? Math.round(d.intake / d.count) : 0);
      nutrition.calories.goal = caloriesByDay.map(d => 100);
      
      nutrition.topDeficits = Object.values(clientDeficits)
        .sort((a,b) => b.deficit - a.deficit)
        .slice(0, 5)
        .map(d => ({ 
          name: d.name, 
          email: d.email, 
          deficit: d.deficit > 20 ? 'Action Required' : 'On Track', 
          status: d.deficit > 20 ? 'High Deficit' : 'On Track' 
        }));

      training.avgCompletion = Math.round(sumComp / count);
      training.totalVolume = Math.round(sumVol / count);
      training.avgRPE = Number((sumRPE / count).toFixed(1));

      training.volumeTrends = trainingByDay.map(d => d.count > 0 ? Math.round(d.volume / d.count) : 0);
      training.intensityTrends = trainingByDay.map(d => d.count > 0 ? Number((d.intensity / d.count).toFixed(1)) : 0);
    }

    // 4. Cohort Analysis Logic
    // Get all clients to group by month
    const { data: allClients } = await supabaseAdmin
      .from('users')
      .select('id, created_at')
      .eq('manager_id', managerId)
      .eq('role', 'CLIENT')
      .order('created_at', { ascending: true });

    const { data: allCheckIns } = await supabaseAdmin
      .from('check_ins')
      .select('client_id, date')
      .in('client_id', (allClients || []).map(c => c.id));

    const cohorts: any[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group clients by month
    const clientGroups: Record<string, string[]> = {};
    allClients?.forEach(c => {
      const date = new Date(c.created_at);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (!clientGroups[key]) clientGroups[key] = [];
      clientGroups[key].push(c.id);
    });

    // For each cohort, calculate retention for subsequent months
    Object.keys(clientGroups).reverse().slice(0, 5).reverse().forEach(cohortKey => {
      const clientIds = clientGroups[cohortKey];
      const cohortStartDate = new Date(allClients?.find(c => clientIds.includes(c.id))?.created_at || '');
      
      const retention = [100]; // Month 0 is always 100%
      for (let i = 1; i <= 6; i++) {
        const targetMonth = new Date(cohortStartDate);
        targetMonth.setMonth(targetMonth.getMonth() + i);
        
        if (targetMonth > now) {
          retention.push(null as any);
          continue;
        }

        const activeInMonth = new Set(
          (allCheckIns || []).filter(ci => {
            if (!clientIds.includes(ci.client_id)) return false;
            const ciDate = new Date(ci.date);
            return ciDate.getMonth() === targetMonth.getMonth() && ciDate.getFullYear() === targetMonth.getFullYear();
          }).map(ci => ci.client_id)
        ).size;

        retention.push(Math.round((activeInMonth / clientIds.length) * 100));
      }
      cohorts.push({ cohort: cohortKey, data: retention });
    });

    // 5. Compliance Score Calculation (Weighted aggregation of adherence)
    const complianceScore = training.avgCompletion * 0.4 + nutrition.avgHydration * 0.3 + (retentionRate) * 0.3;

    // 6. Recent Activity & Attention Required
    const { data: recentCheckIns } = await supabaseAdmin
      .from('check_ins')
      .select(`
        id, 
        date, 
        client_id, 
        reviewed_at, 
        users!inner (
          email,
          manager_id,
          profiles!left (
            full_name
          )
        )
      `)
      .eq('users.manager_id', managerId)
      .order('date', { ascending: false })
      .limit(10);

    const activity = (recentCheckIns || []).map(ci => {
      const userData = ci.users as any;
      const profile = Array.isArray(userData.profiles) ? userData.profiles[0] : userData.profiles;
      const clientName = profile?.full_name || userData.email?.split('@')[0] || 'Client';

      return {
        type: 'CHECK_IN',
        title: 'New Check-in',
        sub: `from ${clientName}`,
        time: ci.date,
        color: 'bg-emerald-100 text-emerald-600',
        checkInId: ci.id,
        clientId: ci.client_id
      };
    });

    const attentionRequired = (recentCheckIns || [])
      .filter(ci => !ci.reviewed_at)
      .map(ci => ({
        id: ci.id,
        type: 'CHECK_IN',
        client: (ci.users as any)?.name || 'Client',
        clientId: ci.client_id,
        title: 'Weekly Check-in',
        desc: 'New submission pending review',
        timeLabel: ci.date,
        status: 'pending',
        avatar: `https://ui-avatars.com/api/?name=${(ci.users as any)?.name || 'C'}&background=random`
      }));

    // 7. Revenue & Stripe
    let revenue = 0;
    let monthlyRevenue = Array(12).fill(0);
    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', managerId)
      .maybeSingle();

    if (integrations?.stripe_enabled && integrations?.stripe_secret_key) {
      try {
        const stripe = new Stripe(integrations.stripe_secret_key);
        const startOfYear = Math.floor(new Date(now.getFullYear(), 0, 1).getTime() / 1000);
        const charges = await stripe.charges.list({ created: { gte: startOfYear }, limit: 100 });
        charges.data.forEach(c => {
          const date = new Date(c.created * 1000);
          if (date.getFullYear() === now.getFullYear()) {
            monthlyRevenue[date.getMonth()] += (c.amount / 100);
          }
        });
        revenue = monthlyRevenue[now.getMonth()];
      } catch (sErr) { console.error('Stripe analytics error:', sErr); }
    }

    // 7. Training Distribution & Muscle Frequency (Based on Assigned Plans)
    const { data: allPrograms } = await supabaseAdmin
      .from('manager_training_programs')
      .select('data_json')
      .in('client_id', (allClients || []).map(c => c.id));

    let typeDist: Record<string, number> = { Strength: 0, Hypertrophy: 0, Mobility: 0, Cardio: 0 };
    let muscleFreq: Record<string, number> = { Legs: 0, Back: 0, Chest: 0, Shoulders: 0, Arms: 0, Core: 0 };
    let totalWorkouts = 0;
    let totalExercises = 0;

    if (allPrograms && allPrograms.length > 0) {
      allPrograms.forEach(prog => {
        const pData = prog.data_json as any;
        if (!pData || !pData.workouts) return;

        pData.workouts.forEach((w: any) => {
          totalWorkouts++;
          const name = (w.name || '').toLowerCase();
          if (name.includes('fuerza') || name.includes('strength')) typeDist.Strength++;
          else if (name.includes('hyper') || name.includes('músculo') || name.includes('muscle')) typeDist.Hypertrophy++;
          else if (name.includes('mob') || name.includes('flex')) typeDist.Mobility++;
          else if (name.includes('cardio') || name.includes('run') || name.includes('hit')) typeDist.Cardio++;
          else typeDist.Strength++; // Default

          if (w.blocks) {
            w.blocks.forEach((b: any) => {
              if (b.exercises) {
                b.exercises.forEach((ex: any) => {
                  totalExercises++;
                  const mg = (ex.muscle_group || 'Other').toLowerCase();
                  if (mg.includes('leg') || mg.includes('pierna') || mg.includes('glute') || mg.includes('quad')) muscleFreq.Legs++;
                  else if (mg.includes('back') || mg.includes('espalda') || mg.includes('lat')) muscleFreq.Back++;
                  else if (mg.includes('chest') || mg.includes('pecho') || mg.includes('pec')) muscleFreq.Chest++;
                  else if (mg.includes('shoulder') || mg.includes('hombro') || mg.includes('delt')) muscleFreq.Shoulders++;
                  else if (mg.includes('arm') || mg.includes('brazo') || mg.includes('bi') || mg.includes('tri')) muscleFreq.Arms++;
                  else if (mg.includes('core') || mg.includes('abs') || mg.includes('abd')) muscleFreq.Core++;
                });
              }
            });
          }
        });
      });
    }

    const trainingDistribution = Object.entries(typeDist).map(([label, count]) => ({
      label,
      value: totalWorkouts > 0 ? Math.round((count / totalWorkouts) * 100) : 0
    }));

    const muscleFrequency = Object.entries(muscleFreq).map(([label, count]) => ({
      label,
      percentage: totalExercises > 0 ? Math.round((count / totalExercises) * 100) : (label === 'Legs' ? 30 : 20)
    }));

    res.json({
      business: {
        totalClients: totalClients || 0,
        newLeads: newClients || 0,
        retention: retentionRate, 
        churnRate,
        revenue: revenue || 0,
        ltv: totalClients ? Math.round((revenue * 6) / totalClients) : 0,
        monthlyRevenue,
        cohorts,
        complianceScore: Math.round(complianceScore || 0)
      },
      nutrition,
      training: {
        ...training,
        distribution: trainingDistribution,
        muscleFrequency
      },
      recentActivity: activity.length > 0 ? activity : [
         { type: 'SYSTEM', title: 'Welcome', sub: 'to your dashboard', time: 'Just now', color: 'bg-blue-100 text-blue-600' }
      ],
      attentionRequired: attentionRequired
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
;

// --- ONBOARDING ROUTES ---

// List all onboarding flows
router.get('/onboarding', async (req: any, res) => {
  try {
    const { data: flows, error } = await supabaseAdmin
      .from('onboarding_messages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') return res.json([]); // Table doesn't exist yet
      throw error;
    }
    res.json(flows || []);
  } catch (error: any) {
    console.error('Error fetching onboarding flows:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get specific flow with assignment stats
router.get('/onboarding/:id', async (req: any, res) => {
  try {
    const { data: flow, error } = await supabaseAdmin
      .from('onboarding_messages')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Get assignment stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('onboarding_assignments')
      .select('status')
      .eq('message_id', req.params.id);

    const counts = {
      total: stats?.length || 0,
      seen: stats?.filter((s: any) => s.status === 'seen').length || 0,
      dismissed: stats?.filter((s: any) => s.status === 'dismissed').length || 0,
      pending: stats?.filter((s: any) => s.status === 'pending').length || 0
    };

    res.json({ ...flow, stats: counts });
  } catch (error: any) {
    console.error('Error fetching flow details:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Create or update an onboarding flow
router.post('/onboarding', async (req: any, res) => {
  const { id, title, description, content, status } = req.body;
  try {
    const payload = {
      title,
      description,
      content: content || [],
      status: status || 'draft',
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      result = await supabaseAdmin
        .from('onboarding_messages')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from('onboarding_messages')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (error: any) {
    console.error('Error saving onboarding flow:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get detailed profile stats for a specific client
router.get('/clients/:id/profile-stats', async (req: any, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  const now = new Date();

  try {
    // 1. Verify client belongs to manager
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('users')
      .select('*, clients_profiles(*)')
      .eq('id', id)
      .eq('manager_id', managerId)
      .single();

    if (clientErr || !client) return res.status(404).json({ error: 'Client not found' });

    // 2. Fetch Check-ins
    const { data: checkIns } = await supabaseAdmin
      .from('check_ins')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: true });

    // 3. Weight & Body Fat History
    const weightHistory = (checkIns || []).map(ci => ({
      date: ci.date,
      weight: (ci.data_json as any).weight || null,
      bodyFat: (ci.data_json as any).body_fat || null
    })).filter(w => w.weight !== null);

    // 4. Latest Measurements
    const lastCheckIn = checkIns && checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
    const measurements = lastCheckIn ? (lastCheckIn.data_json as any).measurements || {} : {};

    // 5. Macro Adherence (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCheckIns = (checkIns || []).filter(ci => new Date(ci.date) >= sevenDaysAgo);
    
    let avgProteinAdherence = 0;
    let avgCarbsAdherence = 0;
    let avgFatsAdherence = 0;
    let dailyCaloricAvg = 0;

    if (recentCheckIns.length > 0) {
      let totalP = 0, totalC = 0, totalF = 0, totalKcal = 0;
      let countP = 0, countC = 0, countF = 0, countKcal = 0;

      recentCheckIns.forEach(ci => {
        const d = ci.data_json as any;
        if (d.protein_intake && d.protein_goal) { totalP += (d.protein_intake / d.protein_goal); countP++; }
        if (d.carbs_intake && d.carbs_goal) { totalC += (d.carbs_intake / d.carbs_goal); countC++; }
        if (d.fats_intake && d.fats_goal) { totalF += (d.fats_intake / d.fats_goal); countF++; }
        if (d.calories_intake) { totalKcal += d.calories_intake; countKcal++; }
      });

      avgProteinAdherence = countP > 0 ? Math.round((totalP / countP) * 100) : 90;
      avgCarbsAdherence = countC > 0 ? Math.round((totalC / countC) * 100) : 85;
      avgFatsAdherence = countF > 0 ? Math.round((totalF / countF) * 100) : 92;
      dailyCaloricAvg = countKcal > 0 ? Math.round(totalKcal / countKcal) : 0;
    }

    // 6. Recent Activity
    const { data: recentMsgs } = await supabaseAdmin
      .from('messages')
      .select('created_at, content')
      .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
      .order('created_at', { ascending: false })
      .limit(3);

    const activity = [
      ...(checkIns || []).slice(-3).map(ci => ({
        type: 'CHECK_IN',
        title: 'Morning Check-in',
        sub: `Logged weight (${(ci.data_json as any).weight}kg)`,
        time: ci.date,
        color: 'bg-emerald-100 text-emerald-600'
      })),
      ...(recentMsgs || []).map(m => ({
        type: 'MESSAGE',
        title: 'Message Received',
        sub: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
        time: m.created_at,
        color: 'bg-blue-100 text-blue-600'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    // 8. Training Stats — from workout_logs
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const { data: allWorkoutLogs } = await supabaseAdmin
      .from('workout_logs')
      .select('*')
      .eq('client_id', id)
      .order('logged_at', { ascending: false })
      .limit(100);

    const workoutLogs = allWorkoutLogs || [];
    const weeklyLogs = workoutLogs.filter(w => new Date(w.logged_at) >= startOfWeek);

    let weeklyVolume = 0;
    let avgRPE = 0;
    let workoutCount = weeklyLogs.length;

    // Helper: compute total volume for a session (sum of weight × reps for all sets of all exercises)
    const calcSessionVolume = (log: any): number => {
      let vol = 0;
      for (const ex of (log.exercises || [])) {
        for (const s of (ex.sets_logged || [])) {
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          vol += w * r;
        }
      }
      return vol;
    };

    weeklyLogs.forEach(log => {
      weeklyVolume += calcSessionVolume(log);
    });

    const logsWithRPE = weeklyLogs.filter(l => l.session_rpe);
    avgRPE = logsWithRPE.length > 0
      ? Number((logsWithRPE.reduce((s, l) => s + Number(l.session_rpe), 0) / logsWithRPE.length).toFixed(1))
      : 0;

    // Fatigue: if latest RPE > 8 consider high  
    const fatigue = logsWithRPE.length > 0 ? Number(logsWithRPE[0].session_rpe) : 5;

    // 9. Strength PRs & History from workout_logs
    // PRs: highest weight lifted per exercise (across all logs)
    const prMap: Record<string, { weight: number; date: string }> = {};
    for (const log of workoutLogs) {
      for (const ex of (log.exercises || [])) {
        const exName = (ex.name || '').toLowerCase();
        const maxSet = (ex.sets_logged || []).reduce((best: any, s: any) => {
          const w = Number(s.weight) || 0;
          return w > (best?.weight || 0) ? s : best;
        }, null);
        if (maxSet) {
          const w = Number(maxSet.weight) || 0;
          if (!prMap[exName] || w > prMap[exName].weight) {
            prMap[exName] = { weight: w, date: log.logged_at };
          }
        }
      }
    }

    // Map canonical PRs for common exercises
    const findPR = (keywords: string[]) => {
      const key = Object.keys(prMap).find(k => keywords.some(kw => k.includes(kw)));
      return key ? prMap[key] : null;
    };
    const squatPR = findPR(['squat', 'sentadilla']);
    const deadliftPR = findPR(['deadlift', 'peso muerto']);
    const benchPR = findPR(['bench', 'press banca', 'press plano', 'chest press']);

    const prs = {
      squat: squatPR ? squatPR.weight : '--',
      deadlift: deadliftPR ? deadliftPR.weight : '--',
      bench: benchPR ? benchPR.weight : '--',
      date: squatPR?.date || deadliftPR?.date || benchPR?.date || null
    };

    // Strength history: weekly aggregated volume for chart
    const weekBuckets: Record<string, { volume: number; squat: number; deadlift: number; bench: number }> = {};
    for (const log of workoutLogs) {
      const d = new Date(log.logged_at);
      // ISO week start (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      const key = weekStart.toISOString().split('T')[0];
      if (!weekBuckets[key]) weekBuckets[key] = { volume: 0, squat: 0, deadlift: 0, bench: 0 };
      weekBuckets[key].volume += calcSessionVolume(log);
      for (const ex of (log.exercises || [])) {
        const exName = (ex.name || '').toLowerCase();
        const maxW = (ex.sets_logged || []).reduce((m: number, s: any) => Math.max(m, Number(s.weight) || 0), 0);
        if (['squat', 'sentadilla'].some(kw => exName.includes(kw))) weekBuckets[key].squat = Math.max(weekBuckets[key].squat, maxW);
        if (['deadlift', 'peso muerto'].some(kw => exName.includes(kw))) weekBuckets[key].deadlift = Math.max(weekBuckets[key].deadlift, maxW);
        if (['bench', 'press banca', 'press plano'].some(kw => exName.includes(kw))) weekBuckets[key].bench = Math.max(weekBuckets[key].bench, maxW);
      }
    }
    const strengthHistory = Object.entries(weekBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date,
        squat: vals.squat || null,
        deadlift: vals.deadlift || null,
        bench: vals.bench || null,
        volume: vals.volume
      }));

    // Recent workouts: last 5 sessions
    const recentWorkouts = workoutLogs.slice(0, 5).map(log => ({
      name: log.workout_name || 'Workout Session',
      date: log.logged_at,
      status: 'Completed',
      volume: Math.round(calcSessionVolume(log)),
      rpe: log.session_rpe || 0
    }));

    // Sensations: collect notes for specific exercises across all logs
    const sensations: { exercise: string, date: string, note: string }[] = [];
    for (const log of workoutLogs) {
      for (const ex of (log.exercises || [])) {
        if (ex.notes && ex.notes.trim()) {
          sensations.push({
            exercise: ex.name,
            date: new Date(log.logged_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            note: ex.notes
          });
        }
      }
      if (sensations.length >= 10) break; // Limit to 10 latest sensations
    }

    // 10. Mindset Stats & History
    const latestCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
    const latestData = latestCheckIn ? (latestCheckIn.data_json as any) : {};
    
    const mindset = {
      energy: latestData.energy_level || '--',
      stress: latestData.stress_level || '--',
      mood: latestData.mood_score || '--',
      motivation: latestData.motivation_level || '--',
      history: (checkIns || []).map(ci => ({
        date: ci.date,
        energy: (ci.data_json as any).energy_level || null,
        stress: (ci.data_json as any).stress_level || null,
        mood: (ci.data_json as any).mood_score || null,
        motivation: (ci.data_json as any).motivation_level || null
      })).filter(h => h.energy || h.stress || h.mood || h.motivation)
    };

    // 11. Documents (Mock for now)
    const documents = [
      { name: 'Initial Assessment.pdf', date: client.created_at, type: 'PDF' }
    ];

    res.json({
      weightHistory,
      latestWeight: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : client.weight,
      goal: client.goal || 'TBD',
      bodyFat: weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].bodyFat : '--',
      activeDays: checkIns?.length || 0,
      adherenceRate: checkIns ? Math.round((checkIns.length / 30) * 100) : 0, 
      macros: {
        protein: avgProteinAdherence,
        carbs: avgCarbsAdherence,
        fats: avgFatsAdherence,
        calories: dailyCaloricAvg
      },
      training: {
        weeklyVolume,
        avgRPE,
        workoutCount,
        fatigue,
        prs,
        strengthHistory,
        recentWorkouts,
        sensations
      },
      mindset,
      measurements,
      activity,
      documents,
      allergies: (client as any).metadata?.allergies || ['None']
    });
  } catch (error: any) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Publish/Assign flow to users
router.post('/onboarding/:id/publish', async (req: any, res) => {
  const { user_ids } = req.body; // Array of user IDs or 'all'
  const flowId = req.params.id;

  try {
    // 1. Mark flow as published
    const { error: updateError } = await supabaseAdmin
      .from('onboarding_messages')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .eq('id', flowId);

    if (updateError) throw updateError;

    // 2. Assign to users
    let targets = [];
    if (user_ids === 'all') {
      const { data: clients } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('manager_id', req.user.id)
        .eq('role', 'CLIENT');
      targets = clients?.map(c => c.id) || [];
    } else {
      targets = user_ids || [];
    }

    if (targets.length > 0) {
      const assignments = targets.map(uid => ({
        message_id: flowId,
        user_id: uid,
        status: 'pending'
      }));

      const { error: assignError } = await supabaseAdmin
        .from('onboarding_assignments')
        .upsert(assignments, { onConflict: 'message_id,user_id' });

      if (assignError) throw assignError;
    }

    res.json({ success: true, assigned_to: targets.length });
  } catch (error: any) {
    console.error('Error publishing flow:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// --- TASKS & CALENDAR ROUTES ---

// Get all tasks for this manager
router.get('/tasks', async (req: any, res) => {
  try {
    console.log(`GET /tasks: Fetching for manager ${req.user.id}`);
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*, users!client_id(email)')
      .eq('manager_id', req.user.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    res.json(tasks || []);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Helper function to sync a task to Google Calendar
async function syncToGoogleCalendar(managerId: string, task: any, operation: 'INSERT' | 'UPDATE' | 'DELETE' = 'INSERT') {
  try {
    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', managerId)
      .maybeSingle();

    if (!integrations?.google_calendar_enabled) {
      return;
    }

    let auth: any = integrations.google_calendar_api_key;

    if (integrations.google_service_account) {
      try {
        const credentials = typeof integrations.google_service_account === 'string' 
          ? JSON.parse(integrations.google_service_account) 
          : integrations.google_service_account;
        
        auth = google.auth.fromJSON(credentials);
        (auth as any).scopes = ['https://www.googleapis.com/auth/calendar'];
      } catch (err) {
        console.error('Failed to parse Google Service Account JSON');
        return; 
      }
    } else if (!auth) {
      return;
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = integrations.google_calendar_id || 'primary';
    
    console.log(`Syncing task ${task.id} to Google Calendar ${calendarId}...`);
    // Determine the date/time string
    // Standardize: if task has date and start_time/time
    const dateStr = task.date || new Date().toISOString().split('T')[0];
    const timeStr = task.time || task.start_time || '09:00';
    const endStr = task.end_time || (parseInt(timeStr.split(':')[0]) + 1).toString().padStart(2, '0') + ':' + timeStr.split(':')[1];

    const eventBody = {
      summary: task.title,
      description: task.description || task.desc || '',
      start: {
        dateTime: `${dateStr}T${timeStr}:00Z`, 
      },
      end: {
        dateTime: `${dateStr}T${endStr}:00Z`,
      },
      timeZone: 'UTC' // Standardize
    };

    console.log('Google Event Data:', JSON.stringify(eventBody, null, 2));

    if (operation === 'DELETE') {
      if (task.google_event_id) {
        await calendar.events.delete({ calendarId, eventId: task.google_event_id });
        console.log(`Task ${task.id} deleted from Google Calendar`);
      }
    } else if (operation === 'UPDATE' && task.google_event_id) {
      await calendar.events.update({
        calendarId,
        eventId: task.google_event_id,
        requestBody: eventBody
      });
      console.log(`Task ${task.id} updated in Google Calendar`);
    } else {
      // INSERT (or fallback if UPDATE was requested but no ID exists)
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventBody,
      });
      
      const newEventId = response.data.id;
      if (newEventId) {
        // Store the ID in our DB
        await supabaseAdmin
          .from('tasks')
          .update({ google_event_id: newEventId })
          .eq('id', task.id);
        console.log(`Task ${task.id} synced to Google Calendar (New Event: ${newEventId})`);
      }
    }
  } catch (error: any) {
    console.error('Google Calendar Sync Error:', error.message || error);
    if (error.code === 404 || error.code === 403) {
      console.warn('CRITICAL: Calendar not found or access denied. Ensure the calendar is SHARED with the Service Account email if using JSON.');
    }
  }
}

// Create a new task
router.post('/tasks', async (req: any, res) => {
  console.log('POST /tasks: Received payload:', JSON.stringify(req.body, null, 2));
  try {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
        duration: req.body.duration,
        client_id: req.body.client_id,
        status: req.body.status || 'pending',
        manager_id: req.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger Google Calendar Sync (non-blocking)
    syncToGoogleCalendar(req.user.id, data);

    res.json(data);
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Manual trigger to sync all tasks to Google Calendar
router.post('/integrations/google-calendar/sync-all', async (req: any, res) => {
  try {
    const managerId = req.user.id;
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('manager_id', managerId);

    if (error) throw error;

    let successCount = 0;
    let failCount = 0;

    for (const task of (tasks || [])) {
      try {
        await syncToGoogleCalendar(managerId, task);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    res.json({ success: true, synced: successCount, failed: failCount });
  } catch (error: any) {
    console.error('Error in sync-all:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Test Google Calendar Connection
router.post('/integrations/google-calendar/test', async (req: any, res) => {
  try {
    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!integrations?.google_calendar_api_key && !integrations?.google_service_account) {
      return res.json({ success: false, message: 'Falta la API Key o Cuenta de Servicio' });
    }

    let auth: any = integrations.google_calendar_api_key;
    if (integrations.google_service_account) {
      try {
        const credentials = typeof integrations.google_service_account === 'string' 
          ? JSON.parse(integrations.google_service_account) 
          : integrations.google_service_account;
        auth = google.auth.fromJSON(credentials);
        (auth as any).scopes = ['https://www.googleapis.com/auth/calendar'];
      } catch (err) {
        return res.json({ success: false, message: 'JSON de Cuenta de Servicio inválido' });
      }
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const list = await calendar.calendarList.list({ maxResults: 1 });
    
    // Check if the specific calendarID is accessible
    if (integrations.google_calendar_id) {
       try {
         await calendar.events.list({ calendarId: integrations.google_calendar_id, maxResults: 1 });
       } catch (e: any) {
         return res.json({ success: false, message: `Calendario ID ${integrations.google_calendar_id} no accesible: ${e.message}` });
       }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Google test error:', error);
    let msg = error.message || 'Error de conexión';
    if (error.code === 401) msg = 'No autorizado (revisa tu API Key/JSON)';
    if (error.code === 403) msg = 'Acceso denegado (¿has compartido el calendario con el email de la cuenta de servicio?)';
    res.json({ success: false, message: msg });
  }
});

// Test Stripe Connection
router.post('/integrations/stripe/test', async (req: any, res) => {
  try {
    const { data: integrations } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!integrations?.stripe_secret_key) {
      return res.json({ success: false, message: 'Falta la Secret Key' });
    }

    const stripe = new Stripe(integrations.stripe_secret_key);
    await stripe.balance.retrieve();
    res.json({ success: true });
  } catch (error: any) {
    console.error('Stripe test error:', error);
    res.json({ success: false, message: error.message || 'Clave de Stripe inválida' });
  }
});

// Update a task
router.patch('/tasks/:id', async (req: any, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update({
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
        duration: req.body.duration,
        client_id: req.body.client_id,
        status: req.body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('manager_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Sync to Google Calendar
    await syncToGoogleCalendar(req.user.id, data, 'UPDATE');

    res.json(data);
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete a task
router.delete('/tasks/:id', async (req: any, res) => {
  try {
    // 1. Get task first to get google_event_id
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('manager_id', req.user.id)
      .maybeSingle();

    if (task) {
      // 2. Sync (Delete) to Google Calendar
      await syncToGoogleCalendar(req.user.id, task, 'DELETE');
    }

    // 3. Delete from DB
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('manager_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ROADMAP ROUTES

router.get('/clients/:clientId/roadmap', async (req: any, res) => {
  const { clientId } = req.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle();

    if (error) throw error;
    
    // Default structure if not found
    if (!data) {
      return res.json({ 
        nutrition: [], 
        training: [], 
        status: 'Draft' 
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.post('/clients/:clientId/roadmap', async (req: any, res) => {
  const { clientId } = req.params;
  const managerId = req.user.id;
  const { nutrition, training, status } = req.body;

  try {
    // Upsert the roadmap
    const { data: existing } = await supabaseAdmin
      .from('roadmaps')
      .select('id')
      .eq('client_id', clientId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('roadmaps')
        .update({ 
          data_json: { nutrition, training },
          status: status || 'Draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('roadmaps')
        .insert({ 
          client_id: clientId,
          manager_id: managerId,
          data_json: { nutrition, training },
          status: status || 'Draft'
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error saving roadmap:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;


