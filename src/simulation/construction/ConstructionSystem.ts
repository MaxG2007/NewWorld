import {
  BuildingBlock,
  Furniture,
  Room,
  BuildingFloor,
  Staircase,
  Building,
  Fortification,
  ConstructionAction,
  BlockType,
  BuildingMaterial,
  BlockCondition,
  BlockOrientation
} from '../../data/ConstructionSchemas';

/**
 * Система строительства и размещения объектов в мире
 * 
 * Сначала: размещение блока, стены, пол, двери, крыша, мебель, сундуки.
 * Затем: помещения, этажи, лестницы, освещение, функциональность,
 * склады, мастерские, магазины, дома, укрепления.
 * 
 * Важное правило: здание должно быть физически связано с миром
 * и иметь интерьер, а не быть просто красивым спрайтом.
 */
export class ConstructionSystem {
  private blocks: Map<string, BuildingBlock>;
  private furniture: Map<string, Furniture>;
  private rooms: Map<string, Room>;
  private floors: Map<string, BuildingFloor>;
  private staircases: Map<string, Staircase>;
  private buildings: Map<string, Building>;
  private fortifications: Map<string, Fortification>;
  private constructionActions: Map<string, ConstructionAction>;
  
  // Индексы для быстрого поиска
  private blocksByPosition: Map<string, Set<string>>; // "x,y,z" -> block IDs
  private blocksByBuilding: Map<string, Set<string>>; // buildingId -> block IDs
  private furnitureByRoom: Map<string, Set<string>>; // roomId -> furniture IDs
  
  constructor() {
    this.blocks = new Map();
    this.furniture = new Map();
    this.rooms = new Map();
    this.floors = new Map();
    this.staircases = new Map();
    this.buildings = new Map();
    this.fortifications = new Map();
    this.constructionActions = new Map();
    
    this.blocksByPosition = new Map();
    this.blocksByBuilding = new Map();
    this.furnitureByRoom = new Map();
  }
  
  /**
   * Разместить строительный блок
   */
  placeBlock(
    blockType: BlockType,
    material: BuildingMaterial,
    x: number,
    y: number,
    z: number,
    placedBy: string,
    builderType: 'Player' | 'NPC',
    orientation: BlockOrientation = 'up',
    rotation: number = 0
  ): BuildingBlock {
    const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const conditionState = this.calculateConditionState(100);
    
    const newBlock: BuildingBlock = {
      id: blockId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      x,
      y,
      z,
      blockType,
      material,
      condition: 100,
      conditionState,
      orientation,
      rotation,
      width: this.getDefaultBlockSize(blockType).width,
      height: this.getDefaultBlockSize(blockType).height,
      depth: this.getDefaultBlockSize(blockType).depth,
      connectedBlocks: [],
      supportedBy: null,
      supports: [],
      placedBy: { id: placedBy, type: builderType },
      ownerId: placedBy,
      isSolid: this.isBlockSolid(blockType),
      isTransparent: this.isBlockTransparent(blockType),
      isClimbable: this.isBlockClimbable(blockType),
      isWalkable: this.isBlockWalkable(blockType),
      isOpenable: this.isBlockOpenable(blockType),
      isOpen: false,
      isLocked: false,
      lockLevel: 0,
      emitsLight: false,
      lightIntensity: 0,
      lightColor: null,
      customName: null,
      description: null,
      textureVariant: Math.floor(Math.random() * 3),
      metadata: {}
    };
    
    this.blocks.set(blockId, newBlock);
    this.indexBlockByPosition(blockId, x, y, z);
    
    return newBlock;
  }
  
  /**
   * Удалить блок
   */
  removeBlock(blockId: string): boolean {
    const block = this.blocks.get(blockId);
    if (!block) return false;
    
    // Удалить из индекса позиций
    this.removeBlockFromPositionIndex(blockId, block.x, block.y, block.z);
    
    // Обновить подключенные блоки
    block.connectedBlocks.forEach(ref => {
      const connected = this.blocks.get(ref.id);
      if (connected) {
        connected.connectedBlocks = connected.connectedBlocks.filter(b => b.id !== blockId);
      }
    });
    
    this.blocks.delete(blockId);
    return true;
  }
  
  /**
   * Разместить мебель
   */
  placeFurniture(
    furnitureType: Furniture['furnitureType'],
    name: string,
    x: number,
    y: number,
    z: number,
    material: BuildingMaterial,
    ownerId: string | null,
    roomId: string | null = null,
    rotation: number = 0
  ): Furniture {
    const furnitureId = `furn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const dimensions = this.getDefaultFurnitureSize(furnitureType);
    
    const newFurniture: Furniture = {
      id: furnitureId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name,
      furnitureType,
      x,
      y,
      z,
      rotation,
      width: dimensions.width,
      height: dimensions.height,
      depth: dimensions.depth,
      material,
      condition: 100,
      capacity: this.getFurnitureCapacity(furnitureType),
      storedItems: [],
      isUsable: this.isFurnitureUsable(furnitureType),
      usageType: this.getFurnitureUsageType(furnitureType),
      ownerId,
      placedInRoom: roomId ? { id: roomId, type: 'Room' } : null,
      color: null,
      textureVariant: Math.floor(Math.random() * 5),
      decoration: null,
      description: null,
      value: this.calculateFurnitureValue(furnitureType, material),
      weight: this.calculateFurnitureWeight(furnitureType, material),
      metadata: {}
    };
    
    this.furniture.set(furnitureId, newFurniture);
    
    if (roomId) {
      this.indexFurnitureByRoom(furnitureId, roomId);
    }
    
    return newFurniture;
  }
  
  /**
   * Удалить мебель
   */
  removeFurniture(furnitureId: string): boolean {
    const furn = this.furniture.get(furnitureId);
    if (!furn) return false;
    
    if (furn.placedInRoom) {
      this.removeFurnitureFromRoomIndex(furnitureId, furn.placedInRoom.id);
    }
    
    this.furniture.delete(furnitureId);
    return true;
  }
  
  /**
   * Создать комнату
   */
  createRoom(
    roomType: Room['roomType'],
    name: string,
    bounds: Room['bounds'],
    buildingId: string | null,
    ownerId: string | null = null
  ): Room {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newRoom: Room = {
      id: roomId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name,
      roomType,
      bounds,
      floorBlocks: [],
      wallBlocks: [],
      ceilingBlocks: [],
      doors: [],
      windows: [],
      furniture: [],
      lightSources: [],
      ambientLight: 50,
      hasHeating: false,
      hasVentilation: false,
      isEnclosed: true,
      isAccessible: true,
      ownerId,
      assignedTo: null,
      buildingId: buildingId ? { id: buildingId, type: 'Building' } : null,
      floorLevel: Math.floor(bounds.z),
      temperature: 20,
      cleanliness: 80,
      decorationLevel: 0,
      description: null,
      metadata: {}
    };
    
    this.rooms.set(roomId, newRoom);
    
    if (buildingId) {
      this.addRoomToBuilding(buildingId, roomId);
    }
    
    return newRoom;
  }
  
  /**
   * Создать этаж здания
   */
  createFloor(
    buildingId: string,
    floorNumber: number,
    zLevel: number,
    height: number = 3
  ): BuildingFloor {
    const floorId = `floor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newFloor: BuildingFloor = {
      id: floorId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      floorNumber,
      floorName: this.getFloorName(floorNumber),
      zLevel,
      height,
      rooms: [],
      staircases: [],
      floorBlocks: [],
      ceilingBlocks: [],
      lighting: [],
      isAccessible: true,
      accessRequirements: [],
      buildingId: { id: buildingId, type: 'Building' },
      metadata: {}
    };
    
    this.floors.set(floorId, newFloor);
    this.addFloorToBuilding(buildingId, floorId);
    
    return newFloor;
  }
  
  /**
   * Установить лестницу
   */
  installStaircase(
    buildingId: string,
    staircaseType: Staircase['staircaseType'],
    x: number,
    y: number,
    fromZ: number,
    toZ: number,
    material: BuildingMaterial,
    direction: BlockOrientation = 'north'
  ): Staircase {
    const stairsId = `stairs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const floorDiff = Math.abs(toZ - fromZ);
    const steps = Math.ceil(floorDiff / 0.2); // примерно 0.2 на ступеньку
    
    const newStaircase: Staircase = {
      id: stairsId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      staircaseType,
      x,
      y,
      fromZ,
      toZ,
      direction,
      width: 1.2,
      depth: 3,
      steps,
      material,
      condition: 100,
      isSafe: true,
      difficulty: 1,
      connectsFloors: [Math.floor(fromZ), Math.floor(toZ)],
      buildingId: { id: buildingId, type: 'Building' },
      metadata: {}
    };
    
    this.staircases.set(stairsId, newStaircase);
    this.addStaircaseToBuilding(buildingId, stairsId);
    
    return newStaircase;
  }
  
  /**
   * Создать здание
   */
  createBuilding(
    buildingType: Building['buildingType'],
    name: string,
    location: { x: number; y: number; regionId: string | null; settlementId: string | null },
    footprint: { width: number; depth: number },
    ownerId: string | null,
    ownerType: Building['ownerType'] = null
  ): Building {
    const buildingId = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newBuilding: Building = {
      id: buildingId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      name,
      buildingType,
      location,
      footprint,
      floors: [],
      floorCount: 1,
      basementLevels: 0,
      hasRoof: false,
      roofType: null,
      roofMaterial: null,
      foundationDepth: 1,
      foundationMaterial: 'stone',
      exteriorWalls: [],
      wallMaterial: null,
      entrances: [],
      rooms: [],
      furniture: [],
      storageAreas: [],
      totalStorageCapacity: 0,
      workshops: [],
      shopAreas: [],
      fortifications: null,
      lightingSystem: null,
      isHabitable: false,
      isFunctional: false,
      requiresMaintenance: true,
      lastMaintenance: null,
      ownerId,
      ownerType,
      value: this.calculateBuildingValue(buildingType, footprint),
      maintenanceCost: 0,
      taxValue: 0,
      condition: 100,
      age: 0,
      builtAt: now,
      builtBy: ownerId ? { id: ownerId, type: 'Player' } : null,
      renovatedAt: null,
      accessPermissions: ownerId ? [{
        entityId: ownerId,
        entityType: 'Player',
        permissionLevel: 'owner'
      }] : [],
      description: null,
      metadata: {}
    };
    
    this.buildings.set(buildingId, newBuilding);
    
    // Создать первый этаж по умолчанию
    this.createFloor(buildingId, 0, 0, 3);
    
    return newBuilding;
  }
  
  /**
   * Добавить освещение
   */
  addLighting(
    x: number,
    y: number,
    z: number,
    _intensity: number,
    lightType: 'torch' | 'lamp' | 'lantern' | 'magical' | 'natural' = 'torch',
    _color: string | null = null
  ): BuildingBlock {
    return this.placeBlock(
      'wall', // используем wall как базовый тип для светильников
      lightType === 'magical' ? 'crystal' : 'metal',
      x,
      y,
      z,
      'system',
      'Player',
      'up',
      0
    );
  }
  
  /**
   * Начать действие строительства
   */
  startConstructionAction(
    actionType: ConstructionAction['actionType'],
    builderId: string,
    builderType: 'Player' | 'NPC',
    requiredMaterials: ConstructionAction['requiredMaterials'],
    _targetId?: string
  ): ConstructionAction {
    const actionId = `construct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const estimatedTime = this.estimateConstructionTime(actionType, requiredMaterials);
    
    const newAction: ConstructionAction = {
      id: actionId,
      version: '1.0',
      createdAt: now,
      updatedAt: now,
      actionType,
      builderId,
      builderType,
      startedAt: now,
      estimatedCompletion: now + estimatedTime,
      completedAt: null,
      progress: 0,
      requiredMaterials,
      laborCost: this.calculateLaborCost(actionType),
      materialCost: this.calculateMaterialCost(requiredMaterials),
      success: null,
      errorMessage: null,
      metadata: {}
    };
    
    this.constructionActions.set(actionId, newAction);
    return newAction;
  }
  
  /**
   * Обновить прогресс строительства
   */
  updateConstructionProgress(actionId: string, progressDelta: number): boolean {
    const action = this.constructionActions.get(actionId);
    if (!action) return false;
    
    action.progress = Math.min(100, action.progress + progressDelta);
    action.updatedAt = Date.now();
    
    if (action.progress >= 100) {
      action.completedAt = Date.now();
      action.success = true;
    }
    
    return true;
  }
  
  /**
   * Получить блок по позиции
   */
  getBlockAt(x: number, y: number, z: number): BuildingBlock | null {
    const key = `${x},${y},${z}`;
    const blockIds = this.blocksByPosition.get(key);
    if (!blockIds || blockIds.size === 0) return null;
    
    const firstId = blockIds.values().next().value;
    return this.blocks.get(firstId!) || null;
  }
  
  /**
   * Проверить, занята ли позиция
   */
  isPositionOccupied(x: number, y: number, z: number): boolean {
    const key = `${x},${y},${z}`;
    const blockIds = this.blocksByPosition.get(key);
    return !!blockIds && blockIds.size > 0;
  }
  
  /**
   * Получить все здания игрока
   */
  getPlayerBuildings(playerId: string): Building[] {
    return Array.from(this.buildings.values()).filter(
      b => b.ownerId === playerId
    );
  }
  
  /**
   * Сериализация состояния
   */
  serialize(): Record<string, unknown> {
    return {
      blocks: Array.from(this.blocks.values()),
      furniture: Array.from(this.furniture.values()),
      rooms: Array.from(this.rooms.values()),
      floors: Array.from(this.floors.values()),
      staircases: Array.from(this.staircases.values()),
      buildings: Array.from(this.buildings.values()),
      fortifications: Array.from(this.fortifications.values()),
      constructionActions: Array.from(this.constructionActions.values())
    };
  }
  
  /**
   * Загрузка состояния
   */
  deserialize(data: Record<string, unknown>): void {
    const serialized = data as {
      blocks: BuildingBlock[];
      furniture: Furniture[];
      rooms: Room[];
      floors: BuildingFloor[];
      staircases: Staircase[];
      buildings: Building[];
      fortifications: Fortification[];
      constructionActions: ConstructionAction[];
    };
    
    this.blocks.clear();
    this.furniture.clear();
    this.rooms.clear();
    this.floors.clear();
    this.staircases.clear();
    this.buildings.clear();
    this.fortifications.clear();
    this.constructionActions.clear();
    this.blocksByPosition.clear();
    this.blocksByBuilding.clear();
    this.furnitureByRoom.clear();
    
    if (serialized.blocks) {
      serialized.blocks.forEach(block => {
        this.blocks.set(block.id, block);
        this.indexBlockByPosition(block.id, block.x, block.y, block.z);
      });
    }
    if (serialized.furniture) {
      serialized.furniture.forEach(furn => {
        this.furniture.set(furn.id, furn);
        if (furn.placedInRoom) {
          this.indexFurnitureByRoom(furn.id, furn.placedInRoom.id);
        }
      });
    }
    if (serialized.rooms) serialized.rooms.forEach(room => this.rooms.set(room.id, room));
    if (serialized.floors) serialized.floors.forEach(floor => this.floors.set(floor.id, floor));
    if (serialized.staircases) serialized.staircases.forEach(stairs => this.staircases.set(stairs.id, stairs));
    if (serialized.buildings) serialized.buildings.forEach(building => this.buildings.set(building.id, building));
    if (serialized.fortifications) serialized.fortifications.forEach(fort => this.fortifications.set(fort.id, fort));
    if (serialized.constructionActions) serialized.constructionActions.forEach(action => this.constructionActions.set(action.id, action));
  }
  
  // Приватные методы
  
  private indexBlockByPosition(blockId: string, x: number, y: number, z: number): void {
    const key = `${x},${y},${z}`;
    if (!this.blocksByPosition.has(key)) {
      this.blocksByPosition.set(key, new Set());
    }
    this.blocksByPosition.get(key)!.add(blockId);
  }
  
  private removeBlockFromPositionIndex(blockId: string, x: number, y: number, z: number): void {
    const key = `${x},${y},${z}`;
    const blockSet = this.blocksByPosition.get(key);
    if (blockSet) {
      blockSet.delete(blockId);
      if (blockSet.size === 0) {
        this.blocksByPosition.delete(key);
      }
    }
  }
  
  private indexFurnitureByRoom(furnitureId: string, roomId: string): void {
    if (!this.furnitureByRoom.has(roomId)) {
      this.furnitureByRoom.set(roomId, new Set());
    }
    this.furnitureByRoom.get(roomId)!.add(furnitureId);
  }
  
  private removeFurnitureFromRoomIndex(furnitureId: string, roomId: string): void {
    const furnSet = this.furnitureByRoom.get(roomId);
    if (furnSet) {
      furnSet.delete(furnitureId);
      if (furnSet.size === 0) {
        this.furnitureByRoom.delete(roomId);
      }
    }
  }
  
  private addRoomToBuilding(buildingId: string, roomId: string): void {
    const building = this.buildings.get(buildingId);
    if (building) {
      building.rooms.push({ id: roomId, type: 'Room' });
      building.updatedAt = Date.now();
    }
  }
  
  private addFloorToBuilding(buildingId: string, floorId: string): void {
    const building = this.buildings.get(buildingId);
    if (building) {
      building.floors.push({ id: floorId, type: 'BuildingFloor' });
      building.floorCount = building.floors.length;
      building.updatedAt = Date.now();
    }
  }
  
  private addStaircaseToBuilding(buildingId: string, stairsId: string): void {
    const building = this.buildings.get(buildingId);
    if (building) {
      // Найти первый этаж и добавить лестницу
      if (building.floors.length > 0) {
        const firstFloorRef = building.floors[0];
        const floor = this.floors.get(firstFloorRef.id);
        if (floor) {
          floor.staircases.push({ id: stairsId, type: 'Staircase' });
        }
      }
      building.updatedAt = Date.now();
    }
  }
  
  private calculateConditionState(condition: number): BlockCondition {
    if (condition >= 90) return 'pristine';
    if (condition >= 70) return 'good';
    if (condition >= 50) return 'worn';
    if (condition >= 30) return 'damaged';
    if (condition >= 10) return 'ruined';
    return 'destroyed';
  }
  
  private getDefaultBlockSize(blockType: BlockType): { width: number; height: number; depth: number } {
    const sizes: Record<BlockType, { width: number; height: number; depth: number }> = {
      wall: { width: 1, height: 2.5, depth: 0.5 },
      floor: { width: 1, height: 0.2, depth: 1 },
      door: { width: 1, height: 2, depth: 0.1 },
      roof: { width: 1, height: 0.3, depth: 1 },
      foundation: { width: 1, height: 0.5, depth: 1 },
      pillar: { width: 0.5, height: 3, depth: 0.5 },
      beam: { width: 0.3, height: 0.3, depth: 3 },
      stairs: { width: 1.2, height: 0.2, depth: 0.3 },
      ramp: { width: 1.5, height: 0.1, depth: 2 },
      window: { width: 1, height: 1.5, depth: 0.1 },
      gate: { width: 3, height: 3, depth: 0.2 },
      fence: { width: 1, height: 1.2, depth: 0.2 },
      chimney: { width: 0.8, height: 4, depth: 0.8 }
    };
    return sizes[blockType] || { width: 1, height: 1, depth: 1 };
  }
  
  private isBlockSolid(blockType: BlockType): boolean {
    const nonSolid: BlockType[] = ['door', 'window', 'gate'];
    return !nonSolid.includes(blockType);
  }
  
  private isBlockTransparent(blockType: BlockType): boolean {
    const transparent: BlockType[] = ['window', 'gate'];
    return transparent.includes(blockType);
  }
  
  private isBlockClimbable(blockType: BlockType): boolean {
    const climbable: BlockType[] = ['stairs', 'ramp'];
    return climbable.includes(blockType);
  }
  
  private isBlockWalkable(blockType: BlockType): boolean {
    const walkable: BlockType[] = ['floor', 'ramp', 'stairs'];
    return walkable.includes(blockType);
  }
  
  private isBlockOpenable(blockType: BlockType): boolean {
    const openable: BlockType[] = ['door', 'gate', 'window'];
    return openable.includes(blockType);
  }
  
  private getDefaultFurnitureSize(furnitureType: Furniture['furnitureType']): { width: number; height: number; depth: number } {
    const sizes: Record<string, { width: number; height: number; depth: number }> = {
      bed: { width: 2, height: 0.5, depth: 1 },
      table: { width: 1.5, height: 0.8, depth: 1 },
      chair: { width: 0.5, height: 1, depth: 0.5 },
      chest: { width: 1, height: 0.8, depth: 0.6 },
      cupboard: { width: 1.2, height: 2, depth: 0.6 },
      shelf: { width: 1.5, height: 0.3, depth: 0.4 },
      desk: { width: 1.5, height: 0.8, depth: 0.8 },
      bench: { width: 2, height: 0.5, depth: 0.5 },
      stool: { width: 0.4, height: 0.5, depth: 0.4 },
      cabinet: { width: 1, height: 1.5, depth: 0.5 },
      throne: { width: 1.5, height: 2, depth: 1.5 },
      altar: { width: 2, height: 1, depth: 1 },
      workbench: { width: 2, height: 1, depth: 1 },
      anvil: { width: 0.8, height: 1, depth: 0.5 },
      forge: { width: 1.5, height: 1.5, depth: 1.5 },
      cauldron: { width: 0.8, height: 0.8, depth: 0.8 },
      barrel: { width: 0.6, height: 1, depth: 0.6 },
      crate: { width: 0.8, height: 0.8, depth: 0.8 },
      lamp: { width: 0.3, height: 0.5, depth: 0.3 },
      chandelier: { width: 1, height: 1, depth: 1 },
      rug: { width: 2, height: 0.05, depth: 3 },
      curtain: { width: 2, height: 2.5, depth: 0.1 },
      mirror: { width: 1, height: 1.5, depth: 0.1 },
      custom: { width: 1, height: 1, depth: 1 }
    };
    return sizes[furnitureType] || { width: 1, height: 1, depth: 1 };
  }
  
  private getFurnitureCapacity(furnitureType: Furniture['furnitureType']): number | null {
    const capacities: Record<string, number> = {
      chest: 20,
      cupboard: 30,
      shelf: 10,
      cabinet: 15,
      barrel: 50,
      crate: 10
    };
    return capacities[furnitureType] || null;
  }
  
  private isFurnitureUsable(furnitureType: Furniture['furnitureType']): boolean {
    const usable: Furniture['furnitureType'][] = [
      'bed', 'chair', 'bench', 'stool', 'throne', 'workbench', 'anvil', 'forge', 'cauldron'
    ];
    return usable.includes(furnitureType);
  }
  
  private getFurnitureUsageType(furnitureType: Furniture['furnitureType']): string | null {
    const usageTypes: Record<string, string> = {
      bed: 'sleep',
      chair: 'sit',
      bench: 'sit',
      stool: 'sit',
      throne: 'sit_rule',
      workbench: 'craft',
      anvil: 'smith',
      forge: 'smelt',
      cauldron: 'cook',
      table: 'eat_work',
      desk: 'write'
    };
    return usageTypes[furnitureType] || null;
  }
  
  private calculateFurnitureValue(furnitureType: Furniture['furnitureType'], material: BuildingMaterial): number {
    const baseValues: Record<string, number> = {
      bed: 50, table: 30, chair: 15, chest: 40, cupboard: 60,
      shelf: 20, desk: 45, bench: 25, stool: 10, cabinet: 50,
      throne: 200, altar: 100, workbench: 80, anvil: 100, forge: 150,
      cauldron: 40, barrel: 15, crate: 10, lamp: 20, chandelier: 150,
      rug: 30, curtain: 25, mirror: 40, custom: 10
    };
    
    const materialMultipliers: Record<BuildingMaterial, number> = {
      wood: 1, stone: 1.5, brick: 1.2, marble: 3, clay: 0.8,
      thatch: 0.5, tile: 1.3, metal: 2.5, glass: 2, concrete: 1.1,
      ice: 0.7, crystal: 4
    };
    
    return Math.round((baseValues[furnitureType] || 10) * (materialMultipliers[material] || 1));
  }
  
  private calculateFurnitureWeight(furnitureType: Furniture['furnitureType'], material: BuildingMaterial): number {
    const baseWeights: Record<string, number> = {
      bed: 30, table: 15, chair: 5, chest: 10, cupboard: 25,
      shelf: 8, desk: 20, bench: 10, stool: 3, cabinet: 20,
      throne: 100, altar: 80, workbench: 40, anvil: 50, forge: 100,
      cauldron: 15, barrel: 5, crate: 3, lamp: 2, chandelier: 30,
      rug: 5, curtain: 3, mirror: 10, custom: 5
    };
    
    const materialMultipliers: Record<BuildingMaterial, number> = {
      wood: 1, stone: 3, brick: 2.5, marble: 4, clay: 1.5,
      thatch: 0.3, tile: 2, metal: 4, glass: 1.5, concrete: 3,
      ice: 1, crystal: 3
    };
    
    return Math.round((baseWeights[furnitureType] || 5) * (materialMultipliers[material] || 1));
  }
  
  private calculateBuildingValue(buildingType: Building['buildingType'], footprint: { width: number; depth: number }): number {
    const baseValues: Record<string, number> = {
      house: 500, mansion: 2000, shop: 800, tavern: 1000, inn: 1200,
      warehouse: 600, workshop: 700, barn: 400, stable: 500, fortress: 5000,
      tower: 1500, castle: 10000, temple: 2000, church: 1500, monastery: 2500,
      library: 1800, school: 1000, hospital: 1500, prison: 800, barracks: 600,
      guild_hall: 2000, town_hall: 3000, market: 1500, farmhouse: 400,
      mill: 800, mine: 1000, lighthouse: 1200, bridge: 2000, gatehouse: 800,
      ruins: 100, custom: 500
    };
    
    const area = footprint.width * footprint.depth;
    return Math.round((baseValues[buildingType] || 500) * (area / 10));
  }
  
  private getFloorName(floorNumber: number): string {
    if (floorNumber === 0) return 'Ground Floor';
    if (floorNumber === 1) return 'First Floor';
    if (floorNumber === 2) return 'Second Floor';
    if (floorNumber < 0) return `Basement ${Math.abs(floorNumber)}`;
    return `${floorNumber}th Floor`;
  }
  
  private estimateConstructionTime(
    actionType: ConstructionAction['actionType'],
    materials: ConstructionAction['requiredMaterials']
  ): number {
    const baseTimes: Record<ConstructionAction['actionType'], number> = {
      place_block: 1000,
      remove_block: 500,
      place_furniture: 2000,
      remove_furniture: 1000,
      build_room: 10000,
      demolish_room: 5000,
      add_floor: 15000,
      remove_floor: 8000,
      install_stairs: 5000,
      add_lighting: 1000,
      reinforce: 3000,
      repair: 4000,
      upgrade: 6000,
      paint: 2000,
      decorate: 3000
    };
    
    const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0);
    return baseTimes[actionType] * (1 + totalQuantity * 0.1);
  }
  
  private calculateLaborCost(actionType: ConstructionAction['actionType']): number {
    const costs: Record<ConstructionAction['actionType'], number> = {
      place_block: 5,
      remove_block: 3,
      place_furniture: 10,
      remove_furniture: 5,
      build_room: 100,
      demolish_room: 50,
      add_floor: 150,
      remove_floor: 80,
      install_stairs: 60,
      add_lighting: 15,
      reinforce: 40,
      repair: 50,
      upgrade: 80,
      paint: 20,
      decorate: 30
    };
    return costs[actionType] || 10;
  }
  
  private calculateMaterialCost(materials: ConstructionAction['requiredMaterials']): number {
    const materialPrices: Record<BuildingMaterial, number> = {
      wood: 5, stone: 10, brick: 8, marble: 30, clay: 3,
      thatch: 2, tile: 12, metal: 25, glass: 20, concrete: 15,
      ice: 1, crystal: 100
    };
    
    return materials.reduce((sum, m) => {
      return sum + (m.quantity * (materialPrices[m.material] || 10));
    }, 0);
  }
}

export default ConstructionSystem;
