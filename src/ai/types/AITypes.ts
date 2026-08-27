/**
 * Типы данных для системы локального ИИ (Этап 39)
 */

export type AITaskType = 
  | 'dialogue'
  | 'description'
  | 'rumor'
  | 'npc_portrait'
  | 'npc_description'
  | 'editor_help'
  | 'text_generation';

export interface AIRequest {
  task: AITaskType;
  context: Record<string, any>;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  success: boolean;
  content: string;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    generationTime?: number;
  };
  error?: string;
}

export interface DialogueContext {
  speaker: {
    id: string;
    name: string;
    race: string;
    profession: string;
    personality: Record<string, number>;
  };
  listener: {
    id: string;
    name: string;
  };
  topic?: string;
  relationship: number;
  location: string;
  timeOfDay: string;
  recentEvents: string[];
}

export interface RumorContext {
  source: {
    id: string;
    name: string;
    credibility: number;
  };
  baseEvent: string;
  region: string;
  distortionLevel: number;
}

export interface DescriptionContext {
  targetType: 'npc' | 'item' | 'location' | 'building';
  data: Record<string, any>;
  style?: 'brief' | 'detailed' | 'poetic';
  maxLength?: number;
}

export interface EditorHelpContext {
  action: string;
  currentData: Record<string, any>;
  suggestions: string[];
}

export interface AIAdapterConfig {
  type: 'local_http' | 'local_runtime' | 'fallback';
  endpoint?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  fallbackUsed: number;
  averageResponseTime: number;
  lastModelUsed?: string;
}

export interface AIAdapter {
  initialize(): Promise<void>;
  isAvailable(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
  getStats(): AIStats;
  shutdown(): Promise<void>;
}
