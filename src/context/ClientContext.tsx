import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';
import { getRecommendationsByPlanningId } from '../constants/planMappings';

export interface ClientProfile {
  weight?: number;
  goal?: string;
  height?: number;
  notes?: string;
  temp_password?: string;
}

export interface ClientData {
  id: string;
  email: string;
  name: string;
  age: string | number;
  gender: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Invited' | 'Archived';
  isAtRisk?: boolean;
  riskStatus: string | null;
  plan: string;
  lastCheckIn: string;
  nextAppointment: string;
  progress: number;
  progressLabel: string;
  avatar: string;
  created_at: string;
  clients_profiles?: ClientProfile[];
  
  // Custom mapped fields for specific views (Nutrition, Training)
  goal: string;
  notes: string;
  weight: number | null;

  // Plan assignment state (localStorage-backed or API based)
  nutritionPlanAssigned: boolean;
  trainingPlanAssigned: boolean;
  
  // Strategic Synchronization Layer
  planningAssigned: boolean;
  planningTemplateId?: string | null;
  recommendedNutritionId?: number | null;
  recommendedTrainingId?: string | null;
  planFamilyKey?: string | null;
  planFamilyLabel?: string | null;

  tempPassword?: string;
  lastCheckInDate?: string;
  isUnreviewed?: boolean;
  check_ins?: any[];
}

interface ClientContextType {
  clients: ClientData[];
  isLoading: boolean;
  error: string | null;
  reloadClients: () => Promise<void>;
  assignNutritionPlan: (clientId: string) => void;
  assignTrainingPlan: (clientId: string) => void;
  assignPlanningDraft: (clientId: string, templateId: string, settings: any) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  archiveClient: (clientId: string, status: 'Active' | 'Archived') => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const assignNutritionPlan = async (clientId: string) => {
    try {
      // Save an initial empty plan to mark it as assigned
      await fetchWithAuth(`/manager/clients/${clientId}/nutrition-plan`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Plan de Nutrición', data_json: { is_new: true } })
      });
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, nutritionPlanAssigned: true } : c));
    } catch (err) {
      console.error('Error assigning nutrition plan:', err);
    }
  };

  const assignTrainingPlan = async (clientId: string) => {
    try {
       // Save an initial empty program to mark it as assigned
       await fetchWithAuth(`/manager/clients/${clientId}/training-program`, {
         method: 'POST',
         body: JSON.stringify({ name: 'Programa de Entrenamiento', data_json: { is_new: true } })
       });
       setClients(prev => prev.map(c => c.id === clientId ? { ...c, trainingPlanAssigned: true } : c));
    } catch (err) {
      console.error('Error assigning training plan:', err);
    }
  };

  const assignPlanningDraft = async (clientId: string, templateId: string, settings: any) => {
    try {
      const recommendations = getRecommendationsByPlanningId(templateId);
      
      const updateData = {
        planningAssigned: true,
        planningTemplateId: templateId,
        recommendedNutritionId: recommendations?.nutritionTemplateId,
        recommendedTrainingId: recommendations?.trainingTemplateId,
        planFamilyKey: recommendations?.familyKey,
        planFamilyLabel: recommendations?.familyLabel,
        settings
      };

      // In a real app, this would be a specific endpoint. 
      // For now, persist as part of the client profile/meta in data_json of the roadmap
      await fetchWithAuth(`/manager/clients/${clientId}/roadmap`, {
        method: 'POST',
        body: JSON.stringify({ 
          name: 'Draft Roadmap', 
          data_json: { 
            ...updateData, 
            status: 'DRAFT', 
            nutrition: [], 
            training: [], 
            goals: [], 
            milestones: [],
            assumptions: { steps: '', sleep: '', constraints: '' }
          } 
        })
      });

      setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updateData } : c));
    } catch (err) {
      console.error('Error assigning planning draft:', err);
    }
  };

  const deleteClient = async (clientId: string) => {
    // Remove from UI immediately (optimistic update)
    setClients(prev => prev.filter(c => c.id !== clientId));
    try {
      await fetchWithAuth(`/manager/clients/${clientId}`, { method: 'DELETE' });
    } catch (err: any) {
      console.warn('deleteClient API error:', err?.message);
    }
  };

  const archiveClient = async (clientId: string, status: 'Active' | 'Archived') => {
    // Optimistic update
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status } : c));
    
    try {
      const response = await fetchWithAuth(`/manager/clients/${clientId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      
      if (response.success && response.user) {
        // Sync with server's returned state
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: response.user.status } : c));
      }
    } catch (err: any) {
      console.error('Error archiving client:', err);
      // Rollback on error
      await loadClients();
    }
  };

  const loadClients = useCallback(async () => {
    if (!user) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch clients and their plans in parallel for better performance or just rely on backend to include it
      // For now, let's just fetch clients and then we could fetch statuses, but to keep it simple, 
      // let's assume the backend might be updated or we perform a check.
      // Better: Backend should return the assignment status in /manager/clients.
      // Let's check if I can modify /manager/clients to include this.
      
      const data = await fetchWithAuth('/manager/clients');
      
      const formatted = data.map((c: any) => {
          let dj = {};
          if (c.check_ins?.[0]?.data_json) {
            dj = c.check_ins[0].data_json;
            if (typeof dj === 'string') {
              try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
            }
          }
          return {
             id: c.id,
             email: c.email,
             created_at: c.created_at,
             name: c.name || c.email.split('@')[0], 
             age: c.age || '--',
             gender: c.gender || 'Unknown',
             status: c.status || 'Active',
             isAtRisk: c.isAtRisk || false,
             weight: (dj as any).weight || c.clients_profiles?.[0]?.weight || null,
             goal: c.clients_profiles?.[0]?.goal || c.goal || 'Not Set',
             notes: c.clients_profiles?.[0]?.notes || c.notes || '',
             temp_password: c.clients_profiles?.[0]?.temp_password || c.tempPassword,
             nutritionPlanAssigned: (c.nutrition_plans && c.nutrition_plans.length > 0) || c.nutritionPlanAssigned || false,
             trainingPlanAssigned: (c.training_programs && c.training_programs.length > 0) || c.trainingPlanAssigned || false,
             plan: c.plan_name || 'No Plan',
             progress: c.progress || 0,
             progressLabel: c.progressLabel || 'No Data',
             avatar: c.avatar || `https://ui-avatars.com/api/?name=${c.email}&background=random`,
             lastCheckIn: c.lastCheckIn || 'Never',
             nextAppointment: c.nextAppointment || 'Not Scheduled',
             lastCheckInDate: c.lastCheckInDate || null,
             isUnreviewed: c.isUnreviewed || false,
             check_ins: c.check_ins || [],
             
             // Extract roadmap data if available
             ...(() => {
                const roadmap = c.roadmaps?.[0];
                if (!roadmap) return {
                  planningAssigned: false,
                  planningTemplateId: null,
                  recommendedNutritionId: null,
                  recommendedTrainingId: null,
                  planFamilyKey: null,
                  planFamilyLabel: null
                };

                let dj = roadmap.data_json || {};
                if (typeof dj === 'string') {
                  try { dj = JSON.parse(dj); } catch (e) { dj = {}; }
                }

                return {
                  planningAssigned: true,
                  planningTemplateId: dj.planningTemplateId || dj.templateId || null,
                  recommendedNutritionId: dj.recommendations?.nutrition || dj.recommendedNutritionId || null,
                  recommendedTrainingId: dj.recommendations?.training || dj.recommendedTrainingId || null,
                  planFamilyKey: dj.planFamilyKey || dj.goalType || null,
                  planFamilyLabel: dj.planFamilyLabel || dj.goalType || null
                };
             })()
           };
      });
      
      setClients(formatted);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
      console.error('Error loading clients context:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return (
    <ClientContext.Provider value={{ 
      clients, 
      isLoading, 
      error, 
      reloadClients: loadClients, 
      assignNutritionPlan, 
      assignTrainingPlan, 
      assignPlanningDraft,
      deleteClient, 
      archiveClient 
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
