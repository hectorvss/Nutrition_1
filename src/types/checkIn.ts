export type CheckInStepType = 
  | 'single_choice'
  | 'multi_select'
  | 'text'
  | 'long_text'
  | 'number'
  | 'info_card'
  | 'measurement_group'
  | 'photo_group'
  | 'slider';

export interface CheckInQuestion {
  id: string;
  type: CheckInStepType;
  title: string;
  subtitle?: string;
  required?: boolean;
  is_fixed?: boolean;
  options?: string[];
  placeholder?: string;
  unit?: string;
  category?: string; // e.g., 'primary', 'optional'
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals';
    value: any;
  };
  meta?: Record<string, any>;
}

export interface CheckInStep {
  id: string;
  type?: 'question' | 'info_card' | 'measurement_group' | 'photo_group';
  title: string;
  subtitle?: string;
  icon?: string;
  questions: CheckInQuestion[];
  meta?: Record<string, any>;
}

export interface CheckInTemplate {
  id: string;
  managerId?: string;
  key: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  version: number;
  templateSchema: CheckInStep[];
  createdAt?: string;
  updatedAt?: string;
}
