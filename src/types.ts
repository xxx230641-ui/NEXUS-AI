export type Language = 'en' | 'ar';

export type ContextCategory = 'Professional' | 'Family' | 'Learning' | 'Social';
export type ActiveContextMode = ContextCategory | 'Auto';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  connectedAppsCount: number;
}

export type EntityType = 'Person' | 'Project' | 'Event' | 'Document' | 'Topic' | 'AppConnector';
export type ConnectorType = 'gmail' | 'calendar' | 'slack' | 'notion' | 'whatsapp';

export interface EntityNode {
  id: string;
  name: string;
  type: EntityType;
  primaryContext: ContextCategory;
  confidence: number; // 0 to 100
  source: ConnectorType;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string; // e.g. 'WORKS_ON', 'ATTENDS_EVENT', 'MENTIONS_TOPIC', 'DEPENDS_ON', 'FAMILY_MEMBER'
  weight: number;
  context?: ContextCategory;
}

export interface IntegrationConnector {
  id: ConnectorType;
  name: string;
  iconName: string;
  status: 'connected' | 'syncing' | 'disconnected';
  lastSync: string;
  itemsIngested: number;
  description: string;
  color: string;
}

export interface ActivityFeedItem {
  id: string;
  source: ConnectorType;
  title: string;
  sender: string;
  preview: string;
  timestamp: string;
  context: ContextCategory;
  urgency: 'high' | 'medium' | 'low';
  read: boolean;
  linkedEntityIds?: string[];
}

export interface MeetingBriefing {
  eventId: string;
  title: string;
  time: string;
  duration: string;
  location: string;
  participants: { name: string; role: string; avatar?: string }[];
  context: ContextCategory;
  summary: string;
  keyTopics: string[];
  pendingActionItems: string[];
  conflictWarning?: {
    conflictingEventTitle: string;
    conflictingContext: ContextCategory;
    time: string;
    recommendation: string;
  };
}

export interface ContextPrediction {
  id: string;
  type: 'conflict' | 'action_required' | 'prep_needed' | 'focus_suggestion';
  title: string;
  description: string;
  suggestedAction: string;
  urgency: 'critical' | 'important' | 'info';
  contextCategory: ContextCategory;
  timestamp: string;
  actionExecuted?: boolean;
}

export interface ContextClassificationResult {
  currentContext: ContextCategory;
  confidence: number;
  reasoning: string;
  activeSignals: string[];
  detectedTopics: string[];
}

export interface EntityExtractionResult {
  extractedEntities: {
    name: string;
    type: EntityType;
    context: ContextCategory;
    confidence: number;
    source: ConnectorType;
    metadata?: Record<string, any>;
  }[];
  extractedRelationships: {
    sourceEntityName: string;
    targetEntityName: string;
    relation: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nexus';
  text: string;
  timestamp: string;
  referencedEntities?: string[];
  actionSuggestion?: {
    label: string;
    type: string;
    payload?: any;
  };
}
