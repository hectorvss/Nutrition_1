export interface Client {
  id: string;
  name: string;
  avatar: string;
  status: 'IN PROGRESS' | 'NEEDS UPDATE' | 'DRAFT' | 'ENDED' | 'NO PLAN';
  phase: string;
  adherence: number;
  frequency: string;
  nextSession: string;
  lastSession: string;
  online?: boolean;
}

export const clients: Client[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf0Q3uAjHC8p014ZEXi-XOqgXIRaqRf0R1dawNQFMSEqrtIhBl997C3o6iGILTMLcGdyoP1VfSeZrtgvvQQ-hVjchh-eGdHuWGvBVI19wQvtu4SMW4Qwy809bw1FKZjwadQQ6pkJb5CaIrmomnOXQiloCBpKeBZ00l53VC9TijpiLDgjqcQ_pAw7psb_m0b-dpBrXlwCrZvjZFOJ4BwSxnkeFTJ4H9_DddUPYVgWypgllSmAkHkI6pkuxMW3pn8MYu5aXBRPDKxWoH',
    status: 'IN PROGRESS',
    phase: 'Phase 2: Power',
    adherence: 92,
    frequency: '4x / Week',
    nextSession: 'Tomorrow, Lower Body',
    lastSession: 'Today, 08:30 AM',
    online: true
  },
  {
    id: '2',
    name: 'Mike Ross',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD_vMvwpXoLlTvndeGwZKVEVR9LnlKTY7x4v283aQEkHNrFvOf2FkhHnA2XWrpxhHT4mMLcSoItEUxba42nxgxqNNuJvTyVHzS5fD0_swZBoYKN7-CW08PkSgsQQgyX3byp77LYkuTbJDioLGOyeHyuZ54ihPXcsmArA7syTYH1qzDcJmdVBUe6fK_UZWms6dpr23NkxWlBZfBKtVbuDmMxducfpVG6A6mF7ZwEgsfEuv-6bD2fA_NmTqRSu1WbFh9EoRTlr3G3qzI',
    status: 'NEEDS UPDATE',
    phase: 'Phase 1: Hypertrophy',
    adherence: 65,
    frequency: '3x / Week',
    nextSession: 'Today, Push Day',
    lastSession: 'Yesterday'
  },
  {
    id: '3',
    name: 'Emily Blunt',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2K8wbItMJ_n_4a7my908LEkiV0U6TxCOVwSni92ptejf9zLpJF96awRUl2o3LHYj3L-73YLeiJkXAyifwxWD_lOOL0OPymFuYUHiBoTwnHeo6AIgvVueGjbulf5DReQrbabpSCE5BBzZUOpJs-gZsq00yXKtopINY2rIxvFZR_0-PwlaAtUOm1JdiVjQARoBlRIVEg0ziuNf5LkOv71M47ZgMGLs7g8OlsyYNdCy1WOEownX_KSl7OmmC4HENgqJQVjAZtcS6doAH',
    status: 'DRAFT',
    phase: 'Onboarding',
    adherence: 0,
    frequency: 'TBD',
    nextSession: '--',
    lastSession: 'No activity'
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf0Q3uAjHC8p014ZEXi-XOqgXIRaqRf0R1dawNQFMSEqrtIhBl997C3o6iGILTMLcGdyoP1VfSeZrtgvvQQ-hVjchh-eGdHuWGvBVI19wQvtu4SMW4Qwy809bw1FKZjwadQQ6pkJb5CaIrmomnOXQiloCBpKeBZ00l53VC9TijpiLDgjqcQ_pAw7psb_m0b-dpBrXlwCrZvjZFOJ4BwSxnkeFTJ4H9_DddUPYVgWypgllSmAkHkI6pkuxMW3pn8MYu5aXBRPDKxWoH',
    status: 'ENDED',
    phase: 'Phase 3: Strength',
    adherence: 98,
    frequency: '5x / Week',
    nextSession: 'Fri, Deadlift',
    lastSession: 'Oct 14'
  },
  {
    id: '5',
    name: 'Alex Rivera',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM7fMx1P-bsXh9AosZoDRwasVK1Yif0_C7AELybRrp6j7dXvUBAQyu2-jDPoAH4dELklt5N9uEjo70-FGCJh18R9RLawTxJD9bBukhNedoykOGTyouarCa2k7lUMJodlCp0et85Wbr3ti31wkDWfp9HwlcrT0HMCGF1q0-cu2JarjDvml0-CaUAkP-r_N3_NLynHabQx1HZX4B_OU3rZRSUffB3xGc_B7uuFWOa5hs7_azd4EJghgE5AjU4XM4OYsHgoFpnzrkqmCJ',
    status: 'NO PLAN',
    phase: 'Not Assigned',
    adherence: 0,
    frequency: 'TBD',
    nextSession: '--',
    lastSession: 'Never'
  }
];
