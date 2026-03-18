export interface Event {
  id: string;
  name: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'archived' | 'draft';
  languages: string[];
  totalConversations: number;
  totalExhibitors: number;
  logo?: string;
  primaryColor: string;
  welcomeMessage: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'event_admin' | 'viewer';
  status: 'active' | 'inactive';
  avatar?: string;
  assignedEvents: string[];
  lastLogin: string;
  createdAt: string;
}

export type Period = '7d' | '30d' | '90d' | 'all';

export interface ConversationStat {
  date: string;
  conversations: number;
  messages: number;
  uniqueUsers: number | null;
}

export interface TopQuery {
  query: string;
  count: number;
  category: string | null;
}

export interface LanguageStat {
  language: string;
  code: string;
  percentage: number;
  count: number;
}

export interface ExhibitorStat {
  name: string;
  searches: number;
  profileViews: number;
  queries: number;
}

export interface ExportRecord {
  id: string;
  type: 'conversations' | 'analytics' | 'queries' | 'exhibitor' | 'unanswered';
  format: 'csv' | 'excel' | 'pdf';
  dateRange: string;
  eventName: string;
  status: 'completed' | 'processing' | 'failed';
  fileSize: string;
  createdAt: string;
  createdBy: string;
}

export interface KPIData {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
}

export interface RecentConversation {
  id: string;
  user: string;
  query: string;
  response: string;
  language: string;
  timestamp: string;
  satisfied: boolean | null;
}

export interface OverviewStats {
  totalConversations: number;
  activeEvents: number;
  totalConversationsGrowth: number | null;
  activeEventsGrowth: number | null;
  responseAccuracy: number | null;
  responseAccuracyGrowth: number | null;
  avgResponseTime: number | null;
  avgResponseTimeGrowth: number | null;
}

export interface CoverageTopic {
  topic: string;
  coverage: number;
  accuracy: number;
}

export interface AdoptionFunnelStage {
  stage: string;
  count: number;
}

export interface AdoptionSegment {
  segment: string;
  eligible: number;
  users: number;
  adoption: number;
  avgConv: number;
  repeat: number;
}

export interface StandTypeAdoption {
  type: string;
  users: number;
}

export interface UserRetention {
  type: string;
  count: number;
}

export interface FeedbackSentiment {
  type: string;
  count: number;
}

export interface Escalation {
  reason: string;
  count: number;
}

export interface IntentOutcome {
  intent: string;
  conversations: number;
  success: number;
  unsuccessful: number;
}

export interface OpsImpact {
  dept: string;
  impact: number;
}
