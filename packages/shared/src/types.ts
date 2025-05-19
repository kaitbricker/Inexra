export enum UserRole {
  ADMIN = 'ADMIN',
  CREATOR = 'CREATOR',
  BASIC_USER = 'BASIC_USER'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE'
}

export enum Platform {
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER'
}

export enum ConversationStatus {
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  platformUserId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  metadata?: Record<string, any>;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  platform: Platform;
  platformMessageId: string;
  senderId: string;
  recipientId: string;
  sentimentScore?: number;
  leadScore?: number;
  keywords: string[];
  socialAccountId: string;
  conversationId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  status: ConversationStatus;
  sentimentSummary?: number;
  engagementScore?: number;
  userId: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadScore {
  id: string;
  score: number;
  priorityLevel: number;
  nextAction?: string;
  sentimentTrend?: Record<string, any>;
  engagementMetrics?: Record<string, any>;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAnalysis {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  keywords: string[];
  intent: string;
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  toxicity: {
    score: number;
    categories: {
      identity_attack: number;
      insult: number;
      obscene: number;
      severe_toxicity: number;
      sexual_explicit: number;
      threat: number;
    };
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
} 