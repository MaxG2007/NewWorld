/**
 * Этап 39 — LOCAL AI
 * 
 * Модульная система локального ИИ для игры.
 * ИИ не является фундаментом игры - все системы работают без него.
 * ИИ используется для обогащения контента: диалоги, описания, слухи.
 * 
 * Архитектура:
 * Game Core → AI Manager → [Local AI Adapter | Fallback Adapter]
 */

export type { AIAdapter, AIAdapterConfig, AIRequest, AIResponse, AIStats, AITaskType } from './types/AITypes';

export { BaseAIAdapter } from './adapters/BaseAIAdapter';
export { LocalHTTPAIAdapter } from './adapters/LocalHTTPAIAdapter';
export { FallbackAIAdapter } from './adapters/FallbackAIAdapter';

export { AIManager } from './managers/AIManager';

export { DialogueService } from './services/DialogueService';
export { RumorService } from './services/RumorService';
export { DescriptionService } from './services/DescriptionService';
