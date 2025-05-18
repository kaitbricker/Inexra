export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
  variables: TemplateVariable[];
  version: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface TemplateAnalytics {
  id: string;
  templateId: string;
  template?: Template;
  usageCount: number;
  avgResponseTime: number;
  engagementRate: number;
  conversionRate: number;
  sentimentScore?: number;
  categoryStats?: CategoryStats;
  timeStats?: TimeStats;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryStats {
  category: string;
  usageCount: number;
  avgResponseTime: number;
  engagementRate: number;
  conversionRate: number;
}

export interface TimeStats {
  hourly: Record<string, number>;
  daily: Record<string, number>;
  weekly: Record<string, number>;
  monthly: Record<string, number>;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  content: string;
  variables: TemplateVariable[];
  changes: string;
  createdBy: string;
  createdAt: Date;
}

export interface TemplateApproval {
  id: string;
  templateId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
