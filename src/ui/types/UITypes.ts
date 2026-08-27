/**
 * UI/UX System Types - Этап 33
 * 
 * Типы и интерфейсы для системы пользовательского интерфейса
 */

// Базовые типы UI компонентов
export interface UIComponent {
  id: string;
  type: 'window' | 'panel' | 'button' | 'list' | 'grid' | 'tooltip' | 'input' | 'label';
  visible: boolean;
  enabled: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: UIStyle;
  children?: UIComponent[];
}

export interface UIStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  fontColor?: string;
  padding?: number;
  margin?: number;
}

// Типы экранов
export type ScreenType =
  | 'character'
  | 'inventory'
  | 'map'
  | 'journal'
  | 'quests'
  | 'skills'
  | 'family'
  | 'relations'
  | 'knowledge'
  | 'rumors'
  | 'construction'
  | 'crafting'
  | 'trade'
  | 'settings'
  | 'chronicle'
  | 'debug';

// Интерфейс менеджера окон
export interface UIWindowManager {
  activeScreen: ScreenType | null;
  screenHistory: ScreenType[];
  
  openScreen(screen: ScreenType): void;
  closeScreen(): void;
  switchScreen(screen: ScreenType): void;
  getScreenState(screen: ScreenType): ScreenState | null;
}

export interface ScreenState {
  screen: ScreenType;
  data: Record<string, unknown>;
  lastUpdated: number;
  isVisible: boolean;
}

// Данные для каждого экрана
export interface CharacterScreenData {
  name: string;
  age: number;
  profession: string;
  stats: Record<string, number>;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  portrait?: string;
  biography: string;
  currentStatus: string;
}

export interface InventoryScreenData {
  items: InventoryItem[];
  weight: number;
  maxWeight: number;
  gold: number;
  equippedSlots: EquipmentSlots;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  weight: number;
  value: number;
  description?: string;
  icon?: string;
}

export interface EquipmentSlots {
  head?: InventoryItem;
  chest?: InventoryItem;
  legs?: InventoryItem;
  feet?: InventoryItem;
  hands?: InventoryItem;
  mainHand?: InventoryItem;
  offHand?: InventoryItem;
  accessory1?: InventoryItem;
  accessory2?: InventoryItem;
}

export interface MapScreenData {
  currentRegion: string;
  discoveredRegions: string[];
  playerPosition: { x: number; y: number };
  mapType: 'world' | 'regional' | 'local' | 'dungeon';
  markers: MapMarker[];
  routes: MapRoute[];
  zoomLevel: number;
}

export interface MapMarker {
  id: string;
  type: 'point' | 'area' | 'route';
  position: { x: number; y: number };
  label: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface MapRoute {
  id: string;
  points: { x: number; y: number }[];
  name: string;
  difficulty?: number;
  length?: number;
}

export interface JournalScreenData {
  entries: JournalEntry[];
  currentPage: number;
  totalPages: number;
  filter?: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  type: 'event' | 'discovery' | 'conversation' | 'combat' | 'quest';
  title: string;
  content: string;
  importance: 'low' | 'medium' | 'high' | 'legendary';
  tags?: string[];
}

export interface QuestsScreenData {
  activeQuests: QuestData[];
  completedQuests: QuestData[];
  failedQuests: QuestData[];
  selectedQuestId?: string;
}

export interface QuestData {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'chain' | 'personal' | 'family' | 'city' | 'political' | 'dungeon';
  status: 'active' | 'completed' | 'failed' | 'paused';
  objectives: QuestObjective[];
  reward?: QuestReward;
  giver?: string;
  deadline?: number;
  chainInfo?: {
    previousQuest?: string;
    nextQuest?: string;
    chainId?: string;
  };
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  required: number;
  type: 'kill' | 'collect' | 'deliver' | 'talk' | 'explore' | 'build' | 'craft';
}

export interface QuestReward {
  gold?: number;
  experience?: number;
  items?: InventoryItem[];
  reputation?: Record<string, number>;
  unlock?: string;
}

export interface SkillsScreenData {
  skills: SkillData[];
  availablePoints: number;
  totalPoints: number;
  skillTree?: SkillTreeNode[];
}

export interface SkillData {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  experience: number;
  requiredForNext: number;
  category: 'combat' | 'crafting' | 'social' | 'magic' | 'survival' | 'knowledge';
  icon?: string;
  effects?: SkillEffect[];
}

export interface SkillEffect {
  type: 'stat_bonus' | 'unlock_ability' | 'passive_bonus' | 'active_ability';
  value?: number;
  description: string;
}

export interface SkillTreeNode {
  skillId: string;
  prerequisites: string[];
  position: { x: number; y: number };
}

export interface FamilyScreenData {
  playerId: string;
  familyTree: FamilyMember[];
  marriages: MarriageRecord[];
  heirs: HeirData[];
  familyReputation: number;
  familyLegacy: LegacyData;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'self' | 'parent' | 'child' | 'sibling' | 'spouse' | 'grandparent' | 'grandchild' | 'ancestor';
  alive: boolean;
  birthDate: number;
  deathDate?: number;
  profession?: string;
  notableAchievements?: string[];
}

export interface MarriageRecord {
  id: string;
  spouse1: string;
  spouse2: string;
  marriageDate: number;
  status: 'active' | 'divorced' | 'widowed';
  divorceReason?: string;
  ceremonyLocation?: string;
}

export interface HeirData {
  id: string;
  name: string;
  relation: string;
  inheritancePriority: number;
  traits: string[];
}

export interface LegacyData {
  achievements: string[];
  discoveries: string[];
  constructions: string[];
  historicalImpact: number;
}

export interface RelationsScreenData {
  relationships: RelationshipData[];
  socialGraph: SocialNode[];
  friendCount: number;
  enemyCount: number;
  reputationByGroup: Record<string, number>;
}

export interface RelationshipData {
  entityId: string;
  name: string;
  type: 'friend' | 'enemy' | 'romantic' | 'family' | 'professional' | 'rival' | 'business' | 'political';
  strength: number; // -100 to 100
  trust: number; // 0 to 100
  history: RelationshipEvent[];
  lastInteraction: number;
}

export interface RelationshipEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  impact: number;
}

export interface SocialNode {
  id: string;
  name: string;
  connections: string[];
  influence: number;
  groupAffiliations: string[];
}

export interface KnowledgeScreenData {
  discoveredRegions: RegionKnowledge[];
  creatureBestiary: CreatureEntry[];
  recipes: RecipeKnowledge[];
  loreEntries: LoreEntry[];
  mapsDiscovered: number;
  secretsFound: number;
}

export interface RegionKnowledge {
  regionId: string;
  name: string;
  discoveryDate: number;
  exploredPercentage: number;
  pointsOfInterest: POIData[];
  dangers: string[];
  resources: string[];
}

export interface POIData {
  id: string;
  name: string;
  type: string;
  discovered: boolean;
  coordinates?: { x: number; y: number };
}

export interface CreatureEntry {
  creatureId: string;
  name: string;
  encounters: number;
  kills: number;
  knownWeaknesses: string[];
  knownDrops: string[];
  dangerLevel: number;
  fullyDocumented: boolean;
}

export interface RecipeKnowledge {
  recipeId: string;
  name: string;
  category: string;
  learned: boolean;
  masteryLevel: number;
  timesCrafted: number;
}

export interface LoreEntry {
  id: string;
  title: string;
  category: 'history' | 'mythology' | 'religion' | 'geography' | 'culture';
  content: string;
  source?: string;
  reliability: 'confirmed' | 'rumor' | 'legend' | 'disputed';
}

export interface RumorsScreenData {
  activeRumors: RumorData[];
  verifiedRumors: RumorData[];
  falseRumors: RumorData[];
  rumorSources: RumorSource[];
}

export interface RumorData {
  id: string;
  content: string;
  type: 'event' | 'person' | 'location' | 'item' | 'quest';
  credibility: number; // 0 to 100
  source?: string;
  receivedDate: number;
  verified: boolean;
  expirationDate?: number;
  relatedEntities?: string[];
}

export interface RumorSource {
  id: string;
  name: string;
  reliability: number;
  specialty?: string;
  lastContact?: number;
}

export interface ConstructionScreenData {
  buildMode: boolean;
  selectedBlock: BuildingBlock | null;
  availableBlocks: BuildingBlock[];
  currentStructure?: StructureData;
  resources: ResourceCount[];
  placementPreview?: PlacementPreview;
}

export interface BuildingBlock {
  id: string;
  name: string;
  type: 'wall' | 'floor' | 'door' | 'roof' | 'furniture' | 'chest' | 'stairs' | 'light';
  material: string;
  cost: ResourceCount[];
  dimensions: { width: number; height: number; depth: number };
  icon?: string;
  description?: string;
}

export interface StructureData {
  id: string;
  name: string;
  type: 'room' | 'floor' | 'building' | 'fortification' | 'workshop' | 'warehouse' | 'shop' | 'house';
  blocks: PlacedBlock[];
  rooms: RoomData[];
  functionality: string[];
  value: number;
}

export interface PlacedBlock {
  blockId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  placedAt: number;
}

export interface RoomData {
  id: string;
  name: string;
  purpose: string;
  size: number;
  lighting: number;
  furniture: string[];
}

export interface ResourceCount {
  resourceId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface PlacementPreview {
  block: BuildingBlock;
  position: { x: number; y: number; z: number };
  valid: boolean;
  collision: boolean;
}

export interface CraftingScreenData {
  availableRecipes: CraftingRecipe[];
  craftingStation?: string;
  selectedRecipe?: CraftingRecipe;
  craftableItems: CraftingRecipe[];
  lockedRecipes: LockedRecipe[];
  craftingProgress?: CraftingProgress;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  category: string;
  ingredients: ResourceCount[];
  result: InventoryItem;
  timeRequired: number;
  skillRequired?: { skillId: string; level: number };
  stationRequired?: string;
  learned: boolean;
  timesCrafted: number;
}

export interface LockedRecipe {
  recipeId: string;
  name: string;
  lockReason: 'skill' | 'recipe_unknown' | 'station_missing' | 'materials_missing';
  requirements: string[];
}

export interface CraftingProgress {
  recipeId: string;
  progress: number;
  totalTime: number;
  startedAt: number;
  canCancel: boolean;
}

export interface TradeScreenData {
  traderId: string;
  traderName: string;
  traderReputation: number;
  playerGold: number;
  tradeOffers: TradeItem[];
  playerInventory: InventoryItem[];
  priceModifier: number;
  barterMode: boolean;
}

export interface TradeItem {
  itemId: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  quantity: number;
  maxQuantity?: number;
  category: string;
  icon?: string;
}

export interface SettingsScreenData {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  controls: ControlSettings;
  gameplay: GameplaySettings;
  accessibility: AccessibilitySettings;
}

export interface GraphicsSettings {
  resolution: string;
  fullscreen: boolean;
  vsync: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: boolean;
  antiAliasing: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  mute: boolean;
}

export interface ControlSettings {
  keyBindings: Record<string, string>;
  mouseSensitivity: number;
  invertY: boolean;
  controllerEnabled: boolean;
}

export interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'permadeath';
  autosave: boolean;
  autosaveInterval: number;
  tooltips: boolean;
  questMarkers: boolean;
}

export interface AccessibilitySettings {
  colorblindMode: boolean;
  subtitles: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  screenReader: boolean;
}

export interface ChronicleScreenData {
  eras: EraData[];
  majorEvents: ChronicleEvent[];
  playerContributions: PlayerContribution[];
  worldState: WorldStateSummary;
  timeline: TimelineEntry[];
}

export interface EraData {
  id: string;
  name: string;
  startDate: number;
  endDate?: number;
  description: string;
  definingEvents: string[];
  significantFigures: string[];
}

export interface ChronicleEvent {
  id: string;
  timestamp: number;
  type: 'micro' | 'regional' | 'global';
  title: string;
  description: string;
  impact: number;
  entitiesInvolved: string[];
  location?: string;
  recorded: boolean;
}

export interface PlayerContribution {
  id: string;
  type: 'discovery' | 'construction' | 'quest' | 'event' | 'relationship';
  description: string;
  timestamp: number;
  significance: number;
  recordedInChronicle: boolean;
}

export interface WorldStateSummary {
  population: number;
  activeConflicts: number;
  discoveredRegions: number;
  totalBuildings: number;
  currentEra: string;
  stabilityIndex: number;
}

export interface TimelineEntry {
  timestamp: number;
  event: string;
  category: string;
  importance: number;
}

// Debug данные
export interface DebugScreenData {
  gameTime: number;
  seed: string;
  currentChunk: { x: number; y: number };
  npcCount: number;
  loadedEntities: number;
  simulationTier: number;
  memoryEstimate: number;
  eventQueueSize: number;
  fps: number;
  tickRate: number;
  activeSystems: string[];
}

// События UI
export interface UIEvent {
  type: 'screen_opened' | 'screen_closed' | 'button_clicked' | 'input_changed' | 'list_selected';
  screen?: ScreenType;
  componentId?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

// Конфигурация UI
export interface UIConfig {
  defaultScreen: ScreenType;
  maxScreenHistory: number;
  tooltipDelay: number;
  animationDuration: number;
  responsiveBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}
