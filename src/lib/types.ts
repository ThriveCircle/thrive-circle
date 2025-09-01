export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "coach" | "client";
  avatar?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  status: "active" | "inactive" | "archived";
  coachId?: string;
  programId?: string;
  goals?: string[];
  assessmentCount?: number;
  sessionCount?: number;
  lastSession?: string;
  nextSession?: string | null;
  totalSpent?: number;
  notes: string[];
  sessions: Session[];
  tasks: Task[];
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  avatar?: string;
  availability: {
    days: string[];
    hours: string;
  };
  clients: string[]; // Array of client IDs
  sessions: string[]; // Array of session IDs
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  totalEarnings?: number;
  status: "active" | "pending" | "suspended" | "inactive";
  isVerified: boolean;
  certifications: string[];
  experience: number; // years
  languages: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  modules: ProgramModule[];
  milestones: ProgramMilestone[];
  clients: string[]; // Array of client IDs
  createdAt: string;
}

export interface ProgramModule {
  id: string;
  name: string;
  description: string;
  order: number;
  duration: number; // days
  content: string;
}

export interface ProgramMilestone {
  id: string;
  name: string;
  description: string;
  order: number;
  targetDate: string;
  completed: boolean;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  questions: AssessmentQuestion[];
  category: string;
  tags: string[];
  estimatedTime: number; // in minutes
  version: string;
  isActive: boolean;
  settings: AssessmentSettings;
  branding: AssessmentBranding;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // coach ID
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-select' | 'multi-select' | 'likert' | 'rating' | 'short-text' | 'long-text' | 'numeric' | 'slider' | 'file-upload';
  question: string;
  required: boolean;
  options?: string[]; // for select, likert, rating questions
  minValue?: number; // for numeric, slider questions
  maxValue?: number; // for numeric, slider questions
  step?: number; // for slider questions
  scale?: number; // for likert questions (1-5, 1-7, etc.)
  placeholder?: string; // for text questions
  maxLength?: number; // for text questions
  fileTypes?: string[]; // for file upload questions
  maxFileSize?: number; // in bytes
  order: number;
  category?: string; // for grouping questions
  conditional?: {
    dependsOn: string; // question ID this depends on
    condition: string; // condition to show this question
  };
}

export interface AssessmentSettings {
  allowPaging: boolean;
  questionsPerPage: number;
  allowTiming: boolean;
  timeLimit?: number; // in minutes
  allowResume: boolean;
  allowRandomization: boolean;
  showProgressBar: boolean;
  allowReview: boolean;
  allowComments: boolean;
  requireCompletion: boolean;
}

export interface AssessmentBranding {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  customCSS?: string;
  showCoachBranding: boolean;
  coachName?: string;
  coachLogo?: string;
}

export interface AssessmentAssignment {
  id: string;
  assessmentId: string;
  clientId: string;
  coachId: string;
  assignedAt: string;
  dueDate?: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number; // in minutes
  progress: number; // 0-100
  lastAccessedAt: string;
  settings: AssessmentSettings;
  branding: AssessmentBranding;
}

export interface AssessmentResponse {
  id: string;
  assignmentId: string;
  questionId: string;
  answer: any;
  fileUploads?: string[]; // file URLs
  timeSpent: number; // seconds spent on this question
  answeredAt: string;
}

export interface AssessmentResult {
  id: string;
  assignmentId: string;
  assessmentId: string;
  clientId: string;
  coachId: string;
  responses: AssessmentResponse[];
  totalScore?: number;
  maxScore?: number;
  percentageScore?: number;
  timeSpent: number; // total minutes
  completedAt: string | null;
  analysis: AssessmentAnalysis;
  recommendations: string[];
  status: 'draft' | 'completed' | 'reviewed' | 'archived';
}

export interface AssessmentAnalysis {
  categoryBreakdown: Record<string, number>;
  strengthAreas: string[];
  improvementAreas: string[];
  trendAnalysis: {
    previousScore?: number;
    improvement: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  insights: string[];
  riskFactors: string[];
}

export interface Session {
  id: string;
  clientId: string;
  coachId: string;
  programId?: string;
  date: string;
  duration: number; // minutes
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  type: "initial" | "follow-up" | "assessment" | "milestone";
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  coachId?: string;
  programId?: string;
  goalId?: string; // Associated goal
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  completedAt?: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  attachments?: string[]; // File URLs
  notes?: string[];
  timeSpent?: number; // minutes
  createdAt: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  clientId: string;
  coachId?: string;
  targetDate: string;
  successCriteria: string[];
  status: "active" | "completed" | "paused" | "cancelled";
  progress: number; // 0-100
  milestones: GoalMilestone[];
  metrics: GoalMetric[];
  createdAt: string;
  updatedAt?: string;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetDate: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
  order: number;
  createdAt: string;
}

export interface GoalMetric {
  id: string;
  goalId: string;
  name: string;
  unit: string;
  frequency: "daily" | "weekly" | "monthly";
  target: number;
  currentValue: number;
  history: MetricHistory[];
  createdAt: string;
}

export interface MetricHistory {
  id: string;
  metricId: string;
  value: number;
  date: string;
  notes?: string;
}

export interface ClientTask extends Task {
  isPersonal: boolean; // Personal vs coach-assigned
  evidence?: string[]; // Evidence uploads
  streak?: number; // Current streak
  badges?: string[]; // Earned badges
}

export interface MessageThread {
  id: string;
  participants: string[]; // user IDs
  subject: string;
  lastMessage: Message;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  retentionPolicy: '7days' | '30days' | '90days' | '1year' | 'permanent';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments: Attachment[];
  isRead: boolean;
  readBy: string[]; // user IDs who have read this message
  readAt?: string;
  isTyping: boolean;
  createdAt: string;
  editedAt?: string;
  isDeleted: boolean;
  moderationStatus: 'pending' | 'approved' | 'flagged' | 'removed';
  reportCount: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'video';
  url: string;
  size: number; // in bytes
  mimeType: string;
  isVirusScanned: boolean;
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'error';
  cdnUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface TypingIndicator {
  id: string;
  userId: string;
  threadId: string;
  isTyping: boolean;
  lastActivity: string;
}

export interface ModerationReport {
  id: string;
  messageId: string;
  threadId: string;
  reporterId: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  actionTaken?: 'warned' | 'suspended' | 'banned' | 'none';
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  action: 'message_sent' | 'message_deleted' | 'thread_created' | 'thread_archived' | 'user_muted' | 'moderation_action';
  userId: string;
  targetId: string; // message ID, thread ID, or user ID
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  coachId: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardSummary {
  activeClients: number;
  completionRate: number;
  upcomingSessions: number;
  revenueMTD: number;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export interface ReportTrends {
  metric: string;
  data: {
    date: string;
    value: number;
  }[];
  period: "7d" | "30d" | "90d" | "1y";
}
