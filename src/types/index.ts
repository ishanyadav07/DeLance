export interface Project {
  id: string;
  title: string;
  client: string;
  budget: string;
  currency: 'USD' | 'EUR' | 'GBP';
  status: 'open' | 'in-progress' | 'reviewing' | 'completed' | 'draft';
  milestone?: string;
  progress?: number;
  deadline?: string;
  tags: string[];
  description: string;
}

export interface Milestone {
  id: string;
  title: string;
  amount: string;
  status: 'approved' | 'pending' | 'active';
  dueDate: string;
}

export interface PulseEvent {
  id: string;
  type: 'milestone_approved' | 'work_submitted' | 'contract_signed';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}
