/**
 * World Editor Types - Этап 34: FULL WORLD EDITOR
 * 
 * Типы и интерфейсы для редактора мира
 */

// ==================== РЕДАКТОР КАРТЫ ====================

export type TerrainTool =
  | 'terrain'
  | 'biome'
  | 'height'
  | 'water'
  | 'resources'
  | 'roads'
  | 'buildings'
  | 'regions'
  | 'poi';

export interface MapEditorState {
  activeTool: TerrainTool;
  brushSize: number;
  brushShape: 'circle' | 'square' | 'line';
  selectedBiome?: string;
  selectedResource?: string;
  heightDelta: number;
  waterLevel: number;
  roadType?: string;
  buildingTemplate?: string;
  regionId?: string;
  poiType?: string;
}

export interface TerrainEdit {
  x: number;
  y: number;
  oldTerrain: string;
  newTerrain: string;
}

export interface BiomeEdit {
  x: number;
  y: number;
  oldBiome: string;
  newBiome: string;
}

export interface HeightEdit {
  x: number;
  y: number;
  oldHeight: number;
  newHeight: number;
}

export interface WaterEdit {
  x: number;
  y: number;
  oldWaterLevel: number;
  newWaterLevel: number;
}

export interface ResourceEdit {
  x: number;
  y: number;
  resourceId: string;
  quantity: number;
  operation: 'add' | 'remove' | 'modify';
}

export interface RoadEdit {
  points: { x: number; y: number }[];
  roadType: string;
  operation: 'create' | 'delete' | 'modify';
}

export interface BuildingEdit {
  position: { x: number; y: number };
  buildingType: string;
  rotation: number;
  operation: 'place' | 'remove' | 'modify';
}

export interface RegionEdit {
  regionId: string;
  name: string;
  boundaries: { x: number; y: number }[];
  operation: 'create' | 'modify' | 'delete';
}

export interface POIEdit {
  poiId: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  metadata: Record<string, unknown>;
  operation: 'create' | 'remove' | 'modify';
}

// ==================== РЕДАКТОР NPC ====================

export interface NPCEditorState {
  selectedNPCId: string | null;
  editMode: NPCEditMode;
  previewChanges: boolean;
}

export type NPCEditMode =
  | 'appearance'
  | 'race'
  | 'name'
  | 'profession'
  | 'schedule'
  | 'personality'
  | 'relations'
  | 'inventory'
  | 'memory'
  | 'secrets';

export interface AppearanceEdit {
  npcId: string;
  sprite?: string;
  colorScheme?: Record<string, string>;
  accessories?: string[];
  bodyType?: string;
  hairStyle?: string;
  facialFeatures?: Record<string, unknown>;
}

export interface RaceEdit {
  npcId: string;
  oldRace: string;
  newRace: string;
}

export interface NameEdit {
  npcId: string;
  firstName: string;
  lastName?: string;
  nickname?: string;
}

export interface ProfessionEdit {
  npcId: string;
  profession: string;
  skillLevel: number;
  workplace?: string;
}

export interface ScheduleBlock {
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
}

export interface ScheduleEdit {
  npcId: string;
  schedule: ScheduleBlock[];
}

export interface PersonalityTrait {
  trait: string;
  value: number; // -100 to 100
}

export interface PersonalityEdit {
  npcId: string;
  traits: PersonalityTrait[];
  fears?: string[];
  likes?: string[];
  dislikes?: string[];
  values?: string[];
}

export interface RelationshipEdit {
  npcId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
  trust: number;
  operation: 'add' | 'modify' | 'remove';
}

export interface InventoryEdit {
  npcId: string;
  itemId: string;
  quantity: number;
  operation: 'add' | 'remove' | 'modify';
  itemData?: Record<string, unknown>;
}

export interface MemoryEdit {
  npcId: string;
  memory: {
    eventId: string;
    event: string;
    importance: number;
    emotionalWeight: number;
    source: string;
    timestamp: number;
    confidence: number;
  };
  operation: 'add' | 'modify' | 'remove';
}

export interface SecretEdit {
  npcId: string;
  secret: {
    id: string;
    type: 'personal' | 'family' | 'crime' | 'quest' | 'location';
    description: string;
    knownBy: string[];
    discoverable: boolean;
  };
  operation: 'add' | 'modify' | 'remove';
}

// ==================== РЕДАКТОР СЕМЬИ ====================

export interface FamilyEditorState {
  selectedFamilyId: string | null;
  editMode: FamilyEditMode;
  viewMode: 'tree' | 'list' | 'graph';
}

export type FamilyEditMode =
  | 'clan'
  | 'relatives'
  | 'property'
  | 'history'
  | 'status'
  | 'relations';

export interface ClanEdit {
  familyId: string;
  clanName: string;
  crest?: string;
  motto?: string;
  origin: string;
  operation: 'create' | 'modify' | 'delete';
}

export interface RelativeEdit {
  familyId: string;
  member: {
    id: string;
    name: string;
    relation: string;
    birthDate: number;
    deathDate?: number;
    profession?: string;
    alive: boolean;
  };
  operation: 'add' | 'modify' | 'remove';
}

export interface PropertyEdit {
  familyId: string;
  property: {
    id: string;
    type: 'building' | 'land' | 'item' | 'money';
    name: string;
    value: number;
    location?: string;
  };
  operation: 'add' | 'modify' | 'remove';
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  event: string;
  description: string;
  participants: string[];
  impact: number;
}

export interface HistoryEdit {
  familyId: string;
  entry: HistoryEntry;
  operation: 'add' | 'modify' | 'remove';
}

export interface StatusEdit {
  familyId: string;
  socialClass: string;
  reputation: number;
  titles?: string[];
  privileges?: string[];
  obligations?: string[];
}

export interface FamilyRelationEdit {
  familyId: string;
  targetFamilyId: string;
  relationType: 'alliance' | 'rivalry' | 'neutral' | 'vassal' | 'liege';
  strength: number;
  operation: 'add' | 'modify' | 'remove';
}

// ==================== РЕДАКТОР СОБЫТИЙ ====================

export interface EventEditorState {
  selectedEventId: string | null;
  editMode: EventEditMode;
  testMode: boolean;
}

export type EventEditMode =
  | 'conditions'
  | 'actions'
  | 'triggers'
  | 'rewards'
  | 'dialogue';

export interface Condition {
  id: string;
  type: string;
  expression: string;
  description: string;
}

export interface ConditionsEdit {
  eventId: string;
  conditions: Condition[];
  logic: 'AND' | 'OR';
}

// Примеры условий:
// age > 18
// weather == rain
// cityCrime > 0.5
// hasItem == key
// relationship < -30
export type ConditionType =
  | 'age'
  | 'weather'
  | 'cityCrime'
  | 'hasItem'
  | 'relationship'
  | 'time'
  | 'location'
  | 'skill'
  | 'reputation'
  | 'quest'
  | 'health'
  | 'energy'
  | 'season'
  | 'dayOfWeek'
  | 'isNight'
  | 'inCombat'
  | 'hasEffect';

export interface Action {
  id: string;
  type: ActionType;
  parameters: Record<string, unknown>;
  description: string;
}

// Примеры действий:
// spawn, move, kill, marry, changePrice, startQuest, changeOwner, createRumor, openDungeon
export type ActionType =
  | 'spawn'
  | 'move'
  | 'kill'
  | 'marry'
  | 'changePrice'
  | 'startQuest'
  | 'changeOwner'
  | 'createRumor'
  | 'openDungeon'
  | 'giveItem'
  | 'removeItem'
  | 'teleport'
  | 'changeWeather'
  | 'triggerEvent'
  | 'endEvent'
  | 'playSound'
  | 'showMessage'
  | 'changeReputation'
  | 'unlockArea'
  | 'lockArea'
  | 'setFlag'
  | 'clearFlag';

export interface ActionsEdit {
  eventId: string;
  actions: Action[];
  executionOrder: 'sequential' | 'parallel' | 'random';
}

export interface TriggerEdit {
  eventId: string;
  trigger: {
    type: 'time' | 'location' | 'interaction' | 'condition_met' | 'quest_complete' | 'quest_start';
    parameters: Record<string, unknown>;
  };
  operation: 'add' | 'modify' | 'remove';
}

export interface RewardEdit {
  eventId: string;
  reward: {
    type: 'item' | 'gold' | 'experience' | 'reputation' | 'unlock' | 'title';
    value: number | string;
    description: string;
  };
  operation: 'add' | 'modify' | 'remove';
}

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: string;
  choices?: DialogueChoice[];
}

export interface DialogueChoice {
  text: string;
  nextLineId?: string;
  condition?: Condition;
  effects?: Action[];
}

export interface DialogueEdit {
  eventId: string;
  dialogue: {
    lines: Record<string, DialogueLine>;
    startLineId: string;
  };
  operation: 'add' | 'modify' | 'remove';
}

// ==================== ОБЩИЕ ТИПЫ ====================

export interface EditOperation {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  undone: boolean;
}

export interface WorldEditorHistory {
  undoStack: EditOperation[];
  redoStack: EditOperation[];
  maxHistorySize: number;
}

export interface ValidationRule {
  field: string;
  rule: (value: unknown) => boolean;
  errorMessage: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EditorConfig {
  enableUndoRedo: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  validationEnabled: boolean;
  previewEnabled: boolean;
  gridSnap: boolean;
  gridSize: number;
}
