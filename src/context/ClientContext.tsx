import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchWithAuth } from '../api';
import { useAuth } from './AuthContext';

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
  status: 'Active' | 'Pending' | 'Inactive' | 'Invited';
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

  // Plan assignment state (localStorage-backed)
  nutritionPlanAssigned: boolean;
  trainingPlanAssigned: boolean;

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
  deleteClient: (clientId: string) => Promise<void>;
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

  const deleteClient = async (clientId: string) => {
    // Remove from UI immediately (optimistic update)
    setClients(prev => prev.filter(c => c.id !== clientId));
    try {
      await fetchWithAuth(`/manager/clients/${clientId}`, { method: 'DELETE' });
    } catch (err: any) {
      console.warn('deleteClient API error:', err?.message);
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
         return {
            id: c.id,
            email: c.email,
            created_at: c.created_at,
            name: c.name || c.email.split('@')[0], 
            age: c.age || '--',
            gender: c.gender || 'Unknown',
            status: c.status || 'Active',
            riskStatus: c.riskStatus || null,
            plan: c.plan || 'No Plan',
            lastCheckIn: c.lastCheckIn || 'Never',
            nextAppointment: c.nextAppointment || 'Not Scheduled',
            progress: c.progress || 0,
            progressLabel: c.progressLabel || 'No Data',
            avatar: c.avatar || `https://ui-avatars.com/api/?name=${c.email}&background=random`,
            goal: c.goal || 'Not Set',
            notes: c.notes || '',
            weight: c.weight || null,
            tempPassword: c.temp_password || undefined,
            nutritionPlanAssigned: c.nutritionPlanAssigned || false,
            trainingPlanAssigned: c.trainingPlanAssigned || false,
            lastCheckInDate: c.lastCheckInDate || null,
            isUnreviewed: c.isUnreviewed || false,
            check_ins: c.check_ins || []
          };
      });
      
      console.log('DEBUG: ClientContext loaded IDs:', formatted.map((c: any) => c.id));
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
    <ClientContext.Provider value={{ clients, isLoading, error, reloadClients: loadClients, assignNutritionPlan, assignTrainingPlan, deleteClient }}>
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
