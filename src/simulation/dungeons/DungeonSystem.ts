import {
  Dungeon,
  DungeonRoom,
  Corridor,
  Door,
  Trap,
  DungeonKey,
  HiddenCache,
  SecretPassage,
  TreasureVault,
  DungeonDepthType,
  RoomType,
  TrapType,
  DoorType,
  KeyType,
  HiddenCacheType,
  DungeonGenerationConfig,
  DungeonDiscoveryEvent,
  DungeonExplorerProfile
} from './DungeonSchemas';

export { DungeonSystem };

/**
 * Система генерации и управления подземельями
 * 
 * Генерирует: комнаты, коридоры, ловушки, двери, ключи, тайники,
 * монстров, NPC, сокровищницы, секретные проходы.
 * 
 * Глубина влияет на сложность:
 * Depth 1 — ruins
 * Depth 2 — crypt
 * Depth 3 — abandoned mine
 * Depth 4 — ancient fortress
 * Depth 5 — sealed civilization
 * 
 * Авторство: если игрок первым открыл неизвестную область,
 * мир сохраняет имя игрока, дату, координаты, найденные предметы,
 * запись в хронике.
 */
export class DungeonSystem {
  private dungeons: Map<string, Dungeon>;
  private rooms: Map<string, DungeonRoom>;
  private corridors: Map<string, Corridor>;
  private doors: Map<string, Door>;
  private traps: Map<string, Trap>;
  private keys: Map<string, DungeonKey>;
  private hiddenCaches: Map<string, HiddenCache>;
  private secretPassages: Map<string, SecretPassage>;
  private treasureVaults: Map<string, TreasureVault>;
  
  private explorerProfiles: Map<string, DungeonExplorerProfile>;
  private discoveryEvents: DungeonDiscoveryEvent[];
  
  // Конфигурации глубин
  private depthConfigs: Map<number, { type: DungeonDepthType; config: any }>;
  
  constructor() {
    this.dungeons = new Map();
    this.rooms = new Map();
    this.corridors = new Map();
    this.doors = new Map();
    this.traps = new Map();
    this.keys = new Map();
    this.hiddenCaches = new Map();
    this.secretPassages = new Map();
    this.treasureVaults = new Map();
    
    this.explorerProfiles = new Map();
    this.discoveryEvents = [];
    
    this.depthConfigs = new Map();
    this.initializeDepthConfigs();
  }
  
  /**
   * Инициализация конфигураций глубин
   */
  private initializeDepthConfigs(): void {
    const configs: Array<[number, DungeonDepthType, any]> = [
      [1, 'ruins', {
        minRoomCount: 3,
        maxRoomCount: 8,
        monsterLevelRange: [1, 3] as [number, number],
        trapFrequency: 0.1,
        treasureQuality: 2,
        complexity: 2,
        specialFeatures: ['crumbled_walls', 'overgrown_vegetation'],
        enemyTypes: ['skeleton', 'rat', 'spider'],
        environmentalHazards: ['unstable_floor']
      }],
      [2, 'crypt', {
        minRoomCount: 5,
        maxRoomCount: 12,
        monsterLevelRange: [2, 5] as [number, number],
        trapFrequency: 0.2,
        treasureQuality: 3,
        complexity: 3,
        specialFeatures: ['sarcophagi', 'ancient_inscriptions'],
        enemyTypes: ['skeleton', 'zombie', 'specter'],
        environmentalHazards: ['darkness', 'cold']
      }],
      [3, 'abandoned_mine', {
        minRoomCount: 8,
        maxRoomCount: 20,
        monsterLevelRange: [3, 7] as [number, number],
        trapFrequency: 0.25,
        treasureQuality: 4,
        complexity: 4,
        specialFeatures: ['mine_carts', 'support_beams', 'ore_veins'],
        enemyTypes: ['goblin', 'troglodyte', 'cave_beast'],
        environmentalHazards: ['cave_in', 'gas_pockets']
      }],
      [4, 'ancient_fortress', {
        minRoomCount: 12,
        maxRoomCount: 30,
        monsterLevelRange: [5, 10] as [number, number],
        trapFrequency: 0.35,
        treasureQuality: 6,
        complexity: 6,
        specialFeatures: ['guard_towers', 'armory', 'throne_room'],
        enemyTypes: ['armored_undead', 'golem', 'dark_knight'],
        environmentalHazards: ['collapsing_ceiling', 'arrow_slits']
      }],
      [5, 'sealed_civilization', {
        minRoomCount: 20,
        maxRoomCount: 50,
        monsterLevelRange: [8, 15] as [number, number],
        trapFrequency: 0.5,
        treasureQuality: 9,
        complexity: 9,
        specialFeatures: ['ancient_machinery', 'magical_barriers', 'library'],
        enemyTypes: ['ancient_guardian', 'lich', 'dragon'],
        environmentalHazards: ['magical_radiation', 'time_distortion']
      }]
    ];
    
    configs.forEach(([depth, type, config]) => {
      this.depthConfigs.set(depth, { type, config });
    });
  }
  
  /**
   * Сгенерировать новое подземелье
   */
  generateDungeon(config: DungeonGenerationConfig): Dungeon {
    const { seed, depth, dungeonType, size, theme } = config;
    const now = Date.now();
    
    const dungeonId = `dungeon_${seed}_${depth}_${now}`;
    
    // Получить конфигурацию глубины
    const depthConfig = this.depthConfigs.get(depth) || this.depthConfigs.get(1)!;
    
    // Определить количество комнат по размеру
    const sizeMultipliers: Record<string, number> = {
      small: 0.5,
      medium: 1.0,
      large: 1.5,
      massive: 2.0
    };
    const multiplier = sizeMultipliers[size] || 1.0;
    
    const minRooms = Math.floor(depthConfig.config.minRoomCount * multiplier);
    const maxRooms = Math.floor(depthConfig.config.maxRoomCount * multiplier);
    const roomCount = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;
    
    // Создать подземелье
    const dungeon: Dungeon = {
      id: dungeonId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name: `${this.generateDungeonName(dungeonType)} of ${theme}`,
      dungeonType,
      depth,
      worldSeed: seed,
      position: { x: 0, y: 0, z: depth * 100 },
      
      rooms: [],
      corridors: [],
      secretPassages: [],
      doors: [],
      traps: [],
      keys: [],
      hiddenCaches: [],
      treasureVaults: [],
      monsters: [],
      npcs: [],
      
      isGenerated: false,
      isExplored: false,
      explorationProgress: 0,
      clearedPercentage: 0,
      
      difficulty: depthConfig.config.complexity * config.difficultyModifier,
      recommendedLevel: Math.floor((depthConfig.config.monsterLevelRange[0] + depthConfig.config.monsterLevelRange[1]) / 2),
      
      entrances: [{ x: 0, y: 0 }],
      exits: [],
      deeperLevels: [],
      upperLevels: [],
      
      discoveredBy: null,
      discoveredAt: null,
      isFirstDiscovery: false,
      
      metadata: { theme, size }
    };
    
    // Сгенерировать комнаты
    this.generateRooms(dungeon, roomCount, depthConfig.config);
    
    // Сгенерировать коридоры
    this.generateCorridors(dungeon, depthConfig.config);
    
    // Сгенерировать двери
    this.generateDoors(dungeon, depthConfig.config);
    
    // Сгенерировать ловушки
    if (config.includeTraps) {
      this.generateTraps(dungeon, depthConfig.config.trapFrequency);
    }
    
    // Сгенерировать ключи
    this.generateKeys(dungeon);
    
    // Сгенерировать тайники
    this.generateHiddenCaches(dungeon, depthConfig.config.treasureQuality);
    
    // Сгенерировать сокровищницы
    this.generateTreasureVaults(dungeon, depthConfig.config.treasureQuality * config.treasureMultiplier);
    
    // Сгенерировать секретные проходы
    if (config.includeSecrets) {
      this.generateSecretPassages(dungeon);
    }
    
    // Сгенерировать монстров и NPC
    if (config.includeNPCs) {
      this.generateMonsters(dungeon, depthConfig.config.enemyTypes);
    }
    
    dungeon.isGenerated = true;
    
    this.dungeons.set(dungeonId, dungeon);
    
    return dungeon;
  }
  
  /**
   * Открыть подземелье (первое обнаружение)
   */
  discoverDungeon(
    dungeonId: string,
    discovererId: string,
    discovererType: 'Player' | 'NPC',
    worldSeed: string,
    coordinates: { x: number; y: number; z: number }
  ): DungeonDiscoveryEvent | null {
    const dungeon = this.dungeons.get(dungeonId);
    if (!dungeon) return null;
    
    const now = Date.now();
    const isFirstDiscovery = !dungeon.discoveredBy;
    
    if (isFirstDiscovery) {
      dungeon.discoveredBy = { id: discovererId, type: discovererType };
      dungeon.discoveredAt = now;
      dungeon.isFirstDiscovery = true;
      dungeon.updatedAt = now;
    }
    
    // Создать событие открытия
    const discoveryEvent: DungeonDiscoveryEvent = {
      id: `discovery_${dungeonId}_${now}`,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      dungeonId,
      dungeonName: dungeon.name,
      dungeonType: dungeon.dungeonType,
      depth: dungeon.depth,
      coordinates,
      discoverer: { id: discovererId, type: discovererType },
      discoveredAt: now,
      worldSeed,
      description: `Discovered ${dungeon.name} at depth ${dungeon.depth}`,
      isFirstDiscovery,
      recordedInChronicle: isFirstDiscovery,
      initialFindings: {
        roomCount: dungeon.rooms.length,
        hasTraps: dungeon.traps.length > 0,
        hasTreasure: dungeon.treasureVaults.length > 0,
        hasMonsters: dungeon.monsters.length > 0,
        estimatedDanger: dungeon.difficulty
      }
    };
    
    this.discoveryEvents.push(discoveryEvent);
    
    // Обновить профиль исследователя
    this.updateExplorerProfile(discovererId, discovererType, dungeon, isFirstDiscovery);
    
    return discoveryEvent;
  }
  
  /**
   * Исследовать комнату
   */
  exploreRoom(dungeonId: string, roomId: string, explorerId: string): boolean {
    const dungeon = this.dungeons.get(dungeonId);
    if (!dungeon) return false;
    
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.isExplored = true;
    room.updatedAt = Date.now();
    
    // Обновить прогресс исследования подземелья
    const exploredRooms = dungeon.rooms.filter(rid => {
      const r = this.rooms.get(rid.id);
      return r?.isExplored;
    }).length;
    
    dungeon.explorationProgress = exploredRooms / dungeon.rooms.length;
    dungeon.updatedAt = Date.now();
    
    // Обновить профиль исследователя
    this.updateExplorerStats(explorerId, { roomsDiscovered: 1 });
    
    return true;
  }
  
  /**
   * Обнаружить ловушку
   */
  detectTrap(trapId: string, detectorId: string, skill: number): boolean {
    const trap = this.traps.get(trapId);
    if (!trap || !trap.canBeDisarmed) return false;
    
    const detectionChance = skill / (trap.disarmDifficulty * 10);
    const detected = Math.random() < detectionChance;
    
    if (detected) {
      this.updateExplorerStats(detectorId, { trapsDetected: 1 });
    }
    
    return detected;
  }
  
  /**
   * Обезвредить ловушку
   */
  disarmTrap(trapId: string, disarmerId: string, skill: number): boolean {
    const trap = this.traps.get(trapId);
    if (!trap || !trap.canBeDisarmed) return false;
    
    const successChance = skill / (trap.disarmDifficulty * 10);
    const success = Math.random() < successChance;
    
    if (success) {
      trap.isTriggered = true; // Пометить как обезвреженную
      trap.updatedAt = Date.now();
    } else {
      // При неудаче ловушка срабатывает
      trap.isTriggered = true;
      this.updateExplorerStats(disarmerId, { trapsTriggered: 1 });
    }
    
    return success;
  }
  
  /**
   * Открыть дверь
   */
  openDoor(doorId: string, openerId: string, hasKey?: boolean): boolean {
    const door = this.doors.get(doorId);
    if (!door) return false;
    
    if (door.isLocked && !hasKey) {
      return false; // Нужен ключ
    }
    
    if (door.isTrapped) {
      // Проверка на ловушку
      const triggerChance = 0.3;
      if (Math.random() < triggerChance) {
        // Ловушка сработала
        const trap = door.trapId ? this.traps.get(door.trapId) : null;
        if (trap) {
          trap.isTriggered = true;
        }
      }
    }
    
    door.isOpen = true;
    door.updatedAt = Date.now();
    
    return true;
  }
  
  /**
   * Найти тайник
   */
  findHiddenCache(cacheId: string, finderId: string, perception: number): boolean {
    const cache = this.hiddenCaches.get(cacheId);
    if (!cache || !cache.isHidden) return false;
    
    const detectionChance = perception / (cache.detectionDifficulty * 10);
    const found = Math.random() < detectionChance;
    
    if (found) {
      cache.isHidden = false;
      cache.updatedAt = Date.now();
      this.updateExplorerStats(finderId, { secretsFound: 1 });
    }
    
    return found;
  }
  
  /**
   * Обнаружить секретный проход
   */
  discoverSecretPassage(passageId: string, discovererId: string): boolean {
    const passage = this.secretPassages.get(passageId);
    if (!passage || !passage.isHidden) return false;
    
    passage.isDiscovered = true;
    passage.updatedAt = Date.now();
    
    this.updateExplorerStats(discovererId, { secretsFound: 1 });
    
    return true;
  }
  
  /**
   * Получить или создать профиль исследователя
   */
  getOrCreateExplorerProfile(ownerId: string, ownerType: 'Player' | 'NPC'): DungeonExplorerProfile {
    const existing = this.explorerProfiles.get(ownerId);
    if (existing) return existing;
    
    const now = Date.now();
    const profile: DungeonExplorerProfile = {
      id: `explorer_profile_${ownerId}`,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      ownerId,
      ownerType,
      explorationSkill: 0,
      trapDetectionSkill: 0,
      lockpickingSkill: 0,
      combatSkill: 0,
      dungeonsExplored: 0,
      roomsDiscovered: 0,
      trapsDetected: 0,
      trapsTriggered: 0,
      secretsFound: 0,
      treasuresLooted: 0,
      monstersDefeated: 0,
      deepestDepthReached: 0,
      discoveredDungeons: [],
      firstDiscoveries: [],
      knownDungeons: new Map()
    };
    
    this.explorerProfiles.set(ownerId, profile);
    return profile;
  }
  
  /**
   * Получить подземелье по ID
   */
  getDungeon(dungeonId: string): Dungeon | undefined {
    return this.dungeons.get(dungeonId);
  }
  
  /**
   * Получить все события открытий
   */
  getDiscoveryEvents(): DungeonDiscoveryEvent[] {
    return [...this.discoveryEvents];
  }
  
  /**
   * Серализация состояния для сохранения
   */
  serialize(): Record<string, unknown> {
    return {
      dungeons: Array.from(this.dungeons.values()),
      rooms: Array.from(this.rooms.values()),
      corridors: Array.from(this.corridors.values()),
      doors: Array.from(this.doors.values()),
      traps: Array.from(this.traps.values()),
      keys: Array.from(this.keys.values()),
      hiddenCaches: Array.from(this.hiddenCaches.values()),
      secretPassages: Array.from(this.secretPassages.values()),
      treasureVaults: Array.from(this.treasureVaults.values()),
      explorerProfiles: Array.from(this.explorerProfiles.values()),
      discoveryEvents: this.discoveryEvents
    };
  }
  
  /**
   * Загрузка состояния из сохранения
   */
  deserialize(data: Record<string, unknown>): void {
    const serialized = data as {
      dungeons: Dungeon[];
      rooms: DungeonRoom[];
      corridors: Corridor[];
      doors: Door[];
      traps: Trap[];
      keys: DungeonKey[];
      hiddenCaches: HiddenCache[];
      secretPassages: SecretPassage[];
      treasureVaults: TreasureVault[];
      explorerProfiles: DungeonExplorerProfile[];
      discoveryEvents: DungeonDiscoveryEvent[];
    };
    
    this.dungeons.clear();
    this.rooms.clear();
    this.corridors.clear();
    this.doors.clear();
    this.traps.clear();
    this.keys.clear();
    this.hiddenCaches.clear();
    this.secretPassages.clear();
    this.treasureVaults.clear();
    this.explorerProfiles.clear();
    this.discoveryEvents = [];
    
    if (serialized.dungeons) {
      serialized.dungeons.forEach(d => this.dungeons.set(d.id, d));
    }
    if (serialized.rooms) {
      serialized.rooms.forEach(r => this.rooms.set(r.id, r));
    }
    if (serialized.corridors) {
      serialized.corridors.forEach(c => this.corridors.set(c.id, c));
    }
    if (serialized.doors) {
      serialized.doors.forEach(d => this.doors.set(d.id, d));
    }
    if (serialized.traps) {
      serialized.traps.forEach(t => this.traps.set(t.id, t));
    }
    if (serialized.keys) {
      serialized.keys.forEach(k => this.keys.set(k.id, k));
    }
    if (serialized.hiddenCaches) {
      serialized.hiddenCaches.forEach(c => this.hiddenCaches.set(c.id, c));
    }
    if (serialized.secretPassages) {
      serialized.secretPassages.forEach(s => this.secretPassages.set(s.id, s));
    }
    if (serialized.treasureVaults) {
      serialized.treasureVaults.forEach(v => this.treasureVaults.set(v.id, v));
    }
    if (serialized.explorerProfiles) {
      serialized.explorerProfiles.forEach(p => this.explorerProfiles.set(p.ownerId, p));
    }
    if (serialized.discoveryEvents) {
      this.discoveryEvents = serialized.discoveryEvents;
    }
  }
  
  // Приватные методы генерации
  
  private generateRooms(dungeon: Dungeon, count: number, config: any): void {
    const roomTypes: RoomType[] = ['entrance', 'chamber', 'corridor', 'treasure_room', 'monster_lair', 'trap_room', 'storage', 'shrine'];
    
    for (let i = 0; i < count; i++) {
      const roomId = `room_${dungeon.id}_${i}`;
      const roomType = i === 0 ? 'entrance' : roomTypes[Math.floor(Math.random() * roomTypes.length)];
      
      const room: DungeonRoom = {
        id: roomId,
        version: '1.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        roomType,
        position: { x: Math.random() * 100, y: Math.random() * 100 },
        width: Math.floor(Math.random() * 20) + 10,
        height: Math.floor(Math.random() * 20) + 10,
        doors: [],
        traps: [],
        hiddenCaches: [],
        monsters: [],
        npcs: [],
        treasures: [],
        isExplored: false,
        isLit: roomType === 'entrance',
        lightSources: roomType === 'entrance' ? [{ type: 'torch', position: { x: 0, y: 0 }, radius: 5 }] : [],
        connections: [],
        secretPassages: [],
        metadata: {}
      };
      
      this.rooms.set(roomId, room);
      dungeon.rooms.push({ id: roomId, type: 'DungeonRoom' });
    }
  }
  
  private generateCorridors(dungeon: Dungeon, config: any): void {
    // Упрощённая генерация коридоров между комнатами
    for (let i = 0; i < dungeon.rooms.length - 1; i++) {
      const startRoom = this.rooms.get(dungeon.rooms[i].id)!;
      const endRoom = this.rooms.get(dungeon.rooms[i + 1].id)!;
      
      const corridorId = `corridor_${dungeon.id}_${i}`;
      const corridor: Corridor = {
        id: corridorId,
        version: '1.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startRoom: startRoom.id,
        endRoom: endRoom.id,
        path: [
          { x: startRoom.position.x + startRoom.width / 2, y: startRoom.position.y + startRoom.height / 2 },
          { x: endRoom.position.x + endRoom.width / 2, y: endRoom.position.y + endRoom.height / 2 }
        ],
        length: 10,
        width: 3,
        hasTraps: false,
        traps: [],
        isExplored: false,
        isLit: false,
        doors: []
      };
      
      this.corridors.set(corridorId, corridor);
      dungeon.corridors.push({ id: corridorId, type: 'Corridor' });
      
      startRoom.connections.push(endRoom.id);
      endRoom.connections.push(startRoom.id);
    }
  }
  
  private generateDoors(dungeon: Dungeon, config: any): void {
    const doorTypes: DoorType[] = ['wooden', 'iron', 'stone', 'locked', 'trapped'];
    
    dungeon.corridors.forEach((corrRef, index) => {
      if (Math.random() < 0.5) {
        const doorId = `door_${dungeon.id}_${index}`;
        const doorType = doorTypes[Math.floor(Math.random() * doorTypes.length)];
        
        const door: Door = {
          id: doorId,
          version: '1.0',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          doorType,
          position: { x: 50, y: 50 },
          isOpen: false,
          isLocked: doorType === 'locked' || doorType === 'trapped',
          isTrapped: doorType === 'trapped',
          requiredKey: doorType === 'locked' ? `key_${dungeon.id}_${index}` : null,
          trapId: doorType === 'trapped' ? `trap_${dungeon.id}_${index}` : null,
          health: 100,
          difficulty: Math.floor(Math.random() * 5) + 1
        };
        
        this.doors.set(doorId, door);
        dungeon.doors.push({ id: doorId, type: 'Door' });
      }
    });
  }
  
  private generateTraps(dungeon: Dungeon, frequency: number): void {
    const trapTypes: TrapType[] = ['spike_pit', 'dart_trap', 'poison_gas', 'alarm_trap'];
    
    dungeon.rooms.forEach((roomRef, index) => {
      if (Math.random() < frequency) {
        const trapId = `trap_${dungeon.id}_${index}`;
        const trapType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
        
        const trap: Trap = {
          id: trapId,
          version: '1.0',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          trapType,
          position: { x: Math.random() * 20, y: Math.random() * 20 },
          damage: Math.floor(Math.random() * 20) + 5,
          triggerRadius: 2,
          isTriggered: false,
          canBeDisarmed: true,
          disarmDifficulty: Math.floor(Math.random() * 5) + 3,
          effects: trapType === 'poison_gas' ? ['poison'] : []
        };
        
        this.traps.set(trapId, trap);
        dungeon.traps.push({ id: trapId, type: 'Trap' });
        
        const room = this.rooms.get(roomRef.id);
        if (room) {
          room.traps.push({ id: trapId, type: 'Trap' });
        }
      }
    });
  }
  
  private generateKeys(dungeon: Dungeon): void {
    const keyTypes: KeyType[] = ['simple_key', 'ornate_key', 'crystal_key'];
    
    dungeon.doors.forEach((doorRef) => {
      const door = this.doors.get(doorRef.id);
      if (door?.requiredKey) {
        const keyId = door.requiredKey;
        const keyType = keyTypes[Math.floor(Math.random() * keyTypes.length)];
        
        const key: DungeonKey = {
          id: keyId,
          version: '1.0',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          keyType,
          name: `${keyType.replace('_', ' ')} Key`,
          description: `Opens ${door.doorType} doors`,
          compatibleDoors: [doorRef.id],
          location: null,
          isFound: false,
          rarity: Math.floor(Math.random() * 5) + 1
        };
        
        this.keys.set(keyId, key);
        dungeon.keys.push({ id: keyId, type: 'DungeonKey' });
      }
    });
  }
  
  private generateHiddenCaches(dungeon: Dungeon, quality: number): void {
    const cacheTypes: HiddenCacheType[] = ['gold_cache', 'item_cache', 'weapon_cache', 'potion_cache'];
    
    const cacheCount = Math.floor(quality / 2);
    for (let i = 0; i < cacheCount; i++) {
      const cacheId = `cache_${dungeon.id}_${i}`;
      const cacheType = cacheTypes[Math.floor(Math.random() * cacheTypes.length)];
      const roomId = dungeon.rooms[Math.floor(Math.random() * dungeon.rooms.length)].id;
      
      const cache: HiddenCache = {
        id: cacheId,
        version: '1.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cacheType,
        position: { x: Math.random() * 20, y: Math.random() * 20 },
        roomId,
        isHidden: true,
        detectionDifficulty: Math.floor(Math.random() * 5) + 3,
        contents: [{ itemId: `item_${i}`, quantity: Math.floor(Math.random() * 10) + 1 }],
        isLooted: false,
        trapped: Math.random() < 0.2,
        trapId: null
      };
      
      this.hiddenCaches.set(cacheId, cache);
      dungeon.hiddenCaches.push({ id: cacheId, type: 'HiddenCache' });
      
      const room = this.rooms.get(roomId);
      if (room) {
        room.hiddenCaches.push({ id: cacheId, type: 'HiddenCache' });
      }
    }
  }
  
  private generateTreasureVaults(dungeon: Dungeon, quality: number): void {
    if (quality < 3) return; // Слишком низкое качество для сокровищницы
    
    const vaultId = `vault_${dungeon.id}`;
    const roomId = dungeon.rooms[dungeon.rooms.length - 1]?.id; // Последняя комната
    
    if (!roomId) return;
    
    const vault: TreasureVault = {
      id: vaultId,
      version: '1.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      roomId,
      position: { x: 50, y: 50 },
      treasureTier: Math.min(Math.floor(quality / 2), 5),
      contents: [
        { itemId: 'gold_coins', itemtype: 'currency', quantity: Math.floor(Math.random() * 1000) + 100, rarity: 1 },
        { itemId: 'ancient_artifact', itemtype: 'artifact', quantity: 1, rarity: Math.floor(quality) }
      ],
      isProtected: true,
      protectionType: Math.random() < 0.5 ? 'trap' : 'guardian',
      protectionDetails: 'Protected by ancient magic',
      isLooted: false,
      value: quality * 1000
    };
    
    this.treasureVaults.set(vaultId, vault);
    dungeon.treasureVaults.push({ id: vaultId, type: 'TreasureVault' });
  }
  
  private generateSecretPassages(dungeon: Dungeon): void {
    const passageCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < passageCount; i++) {
      const passageId = `secret_${dungeon.id}_${i}`;
      const connectedRooms = [
        dungeon.rooms[Math.floor(Math.random() * dungeon.rooms.length)]?.id,
        dungeon.rooms[Math.floor(Math.random() * dungeon.rooms.length)]?.id
      ].filter(Boolean) as string[];
      
      if (connectedRooms.length < 2) continue;
      
      const passage: SecretPassage = {
        id: passageId,
        version: '1.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        position: { x: Math.random() * 50, y: Math.random() * 50 },
        connectedRooms,
        isDiscovered: false,
        discoveryRequirement: null,
        mechanism: 'lever',
        requiredItem: null,
        isHidden: true
      };
      
      this.secretPassages.set(passageId, passage);
      dungeon.secretPassages.push({ id: passageId, type: 'SecretPassage' });
    }
  }
  
  private generateMonsters(dungeon: Dungeon, enemyTypes: string[]): void {
    // Упрощённая генерация монстров
    const monsterCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < monsterCount; i++) {
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const roomId = dungeon.rooms[Math.floor(Math.random() * dungeon.rooms.length)]?.id;
      
      if (roomId) {
        const monsterId = `monster_${dungeon.id}_${i}`;
        dungeon.monsters.push({ id: monsterId, type: 'NPC' });
        
        const room = this.rooms.get(roomId);
        if (room) {
          room.monsters.push({ id: monsterId, type: 'NPC' });
        }
      }
    }
  }
  
  private generateDungeonName(type: DungeonDepthType): string {
    const names: Record<DungeonDepthType, string[]> = {
      ruins: ['Ancient Ruins', 'Forgotten Ruins', 'Crumbling Ruins'],
      crypt: ['Dark Crypt', 'Royal Crypt', 'Accursed Crypt'],
      abandoned_mine: ['Deep Mine', 'Lost Mine', 'Cursed Mine'],
      ancient_fortress: ['Iron Fortress', 'Shadow Fortress', 'Eternal Fortress'],
      sealed_civilization: ['Lost City', 'Forbidden Citadel', 'Ancient Empire']
    };
    
    const variants = names[type] || ['Unknown Dungeon'];
    return variants[Math.floor(Math.random() * variants.length)];
  }
  
  private updateExplorerProfile(
    explorerId: string,
    explorerType: 'Player' | 'NPC',
    dungeon: Dungeon,
    isFirstDiscovery: boolean
  ): void {
    const profile = this.getOrCreateExplorerProfile(explorerId, explorerType);
    
    profile.dungeonsExplored++;
    profile.discoveredDungeons.push({ id: dungeon.id, type: 'Dungeon' });
    profile.deepestDepthReached = Math.max(profile.deepestDepthReached, dungeon.depth);
    profile.updatedAt = Date.now();
    
    if (isFirstDiscovery) {
      profile.firstDiscoveries.push({
        dungeonName: dungeon.name,
        dungeonType: dungeon.dungeonType,
        depth: dungeon.depth,
        discoveredAt: dungeon.discoveredAt!,
        coordinates: dungeon.position
      });
    }
  }
  
  private updateExplorerStats(explorerId: string, stats: Partial<DungeonExplorerProfile>): void {
    const profile = this.explorerProfiles.get(explorerId);
    if (!profile) return;
    
    if (stats.roomsDiscovered !== undefined) {
      profile.roomsDiscovered += stats.roomsDiscovered;
    }
    if (stats.trapsDetected !== undefined) {
      profile.trapsDetected += stats.trapsDetected;
    }
    if (stats.trapsTriggered !== undefined) {
      profile.trapsTriggered += stats.trapsTriggered;
    }
    if (stats.secretsFound !== undefined) {
      profile.secretsFound += stats.secretsFound;
    }
    
    profile.updatedAt = Date.now();
  }
}

export default DungeonSystem;
