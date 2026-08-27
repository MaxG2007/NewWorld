/**
 * Asset Pipeline Manager for Mega Pixel World
 * Этап 35 — Pixel Art + Asset Pipeline
 * 
 * Управление загрузкой, кэшированием и обработкой ассетов.
 * Графика не блокирует Game Core.
 */

import { 
  BaseAsset,
  AssetCategory,
  AssetPipelineConfig,
  AssetPack,
  AssetLoadState,
  LoadStatus,
  CharacterSprite,
  TerrainTile,
  BuildingSprite,
  ItemSprite,
  AnimationClip,
  MINIMAL_ASSET_PACK,
  BASE_RACES,
  BASE_TERRAIN,
  BASE_WEAPONS
} from './types/AssetTypes';

export class AssetPipelineManager {
  private config: AssetPipelineConfig;
  private loadedAssets: Map<string, any> = new Map();
  private loadStates: Map<string, AssetLoadState> = new Map();
  private assetPacks: Map<string, AssetPack> = new Map();
  private spriteSheets: Map<string, HTMLImageElement> = new Map();
  private onLoadCompleteCallbacks: (() => void)[] = [];
  
  constructor(config?: Partial<AssetPipelineConfig>) {
    this.config = {
      basePath: '/assets/',
      categories: ['sprites', 'tiles', 'characters', 'items', 'buildings', 'effects', 'ui'],
      defaultFormat: 'png',
      compressionEnabled: true,
      spriteSheetEnabled: true,
      maxTextureSize: 2048,
      generateMipmaps: false,
      ...config
    };
    
    // Регистрируем минимальный пак
    this.registerAssetPack(MINIMAL_ASSET_PACK);
  }
  
  // ============================================
  // РЕГИСТРАЦИЯ И ЗАГРУЗКА
  // ============================================
  
  public registerAssetPack(pack: AssetPack): void {
    this.assetPacks.set(pack.id, pack);
    console.log(`[AssetPipeline] Registered pack: ${pack.name} v${pack.version}`);
  }
  
  public async loadAsset(asset: BaseAsset): Promise<any> {
    const assetId = asset.id;
    
    // Проверяем кэш
    if (this.loadedAssets.has(assetId)) {
      return this.loadedAssets.get(assetId);
    }
    
    // Начинаем загрузку
    this.updateLoadState(assetId, 'loading', 0);
    
    try {
      let loadedData: any;
      
      switch (asset.category) {
        case 'characters':
          loadedData = await this.loadCharacterAsset(asset);
          break;
        case 'tiles':
          loadedData = await this.loadTileAsset(asset);
          break;
        case 'buildings':
          loadedData = await this.loadBuildingAsset(asset);
          break;
        case 'items':
          loadedData = await this.loadItemAsset(asset);
          break;
        case 'effects':
          loadedData = await this.loadEffectAsset(asset);
          break;
        case 'ui':
          loadedData = await this.loadUIAsset(asset);
          break;
        default:
          loadedData = await this.loadGenericAsset(asset);
      }
      
      // Кэшируем
      this.loadedAssets.set(assetId, loadedData);
      this.updateLoadState(assetId, 'loaded', 100);
      
      console.log(`[AssetPipeline] Loaded: ${asset.name} (${asset.category})`);
      return loadedData;
      
    } catch (error) {
      this.updateLoadState(assetId, 'error', 0, String(error));
      console.error(`[AssetPipeline] Failed to load ${asset.name}:`, error);
      
      // Возвращаем placeholder для некритичных ассетов
      return this.createPlaceholder(asset);
    }
  }
  
  public async loadAllAssets(assets: BaseAsset[]): Promise<void> {
    const total = assets.length;
    let loaded = 0;
    
    const loadPromises = assets.map(async (asset) => {
      try {
        await this.loadAsset(asset);
        loaded++;
        this.reportProgress(loaded / total);
      } catch (error) {
        // Продолжаем загрузку остальных
        loaded++;
      }
    });
    
    await Promise.all(loadPromises);
    this.notifyLoadComplete();
  }
  
  // ============================================
  // СПЕЦИАЛИЗИРОВАННЫЕ ЗАГРУЗЧИКИ
  // ============================================
  
  private async loadCharacterAsset(asset: BaseAsset): Promise<HTMLImageElement | CanvasRenderingContext2D> {
    const charAsset = asset as CharacterSprite;
    
    // Для персонажей используем послойную загрузку
    if (charAsset.layers && charAsset.layers.length > 0) {
      return this.loadLayeredCharacter(charAsset);
    }
    
    return this.loadImageAsset(asset.path);
  }
  
  private async loadLayeredCharacter(character: CharacterSprite): Promise<CanvasRenderingContext2D> {
    const canvas = document.createElement('canvas');
    canvas.width = character.width;
    canvas.height = character.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create character canvas context');
    }
    
    // Загружаем каждый слой
    for (const layer of character.layers) {
      const layerPath = `${character.path}/${layer}.${this.config.defaultFormat}`;
      try {
        const layerImage = await this.loadImageAsset(layerPath);
        ctx.drawImage(layerImage, 0, 0);
      } catch (error) {
        console.warn(`Layer ${layer} not found, using placeholder`);
      }
    }
    
    return ctx;
  }
  
  private async loadTileAsset(asset: BaseAsset): Promise<HTMLImageElement> {
    const tile = asset as TerrainTile;
    
    // Поддержка анимированных тайлов
    if (tile.animated) {
      return this.loadAnimatedTile(tile);
    }
    
    // Авто-тайлинг через connectsTo
    if (tile.connectsTo && tile.connectsTo.length > 0) {
      return this.loadAutoTile(tile);
    }
    
    return this.loadImageAsset(asset.path);
  }
  
  private async loadAnimatedTile(tile: TerrainTile): Promise<HTMLImageElement> {
    // Загружаем все кадры анимации
    const frameCount = 4; // Стандартное количество кадров
    const frames: HTMLImageElement[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const framePath = `${tile.path}_frame${i}.${this.config.defaultFormat}`;
      frames.push(await this.loadImageAsset(framePath));
    }
    
    // Возвращаем первый кадр как основной (анимация обрабатывается отдельно)
    return frames[0];
  }
  
  private async loadAutoTile(tile: TerrainTile): Promise<HTMLImageElement> {
    // Загружаем тайлы для авто-тайлинга
    const variants = [
      'center', 'top', 'bottom', 'left', 'right',
      'top-left', 'top-right', 'bottom-left', 'bottom-right'
    ];
    
    const images: Map<string, HTMLImageElement> = new Map();
    
    for (const variant of variants) {
      const variantPath = `${tile.path}_${variant}.${this.config.defaultFormat}`;
      try {
        images.set(variant, await this.loadImageAsset(variantPath));
      } catch (error) {
        // Используем дефолтный если вариант не найден
      }
    }
    
    return images.get('center') || this.loadImageAsset(tile.path);
  }
  
  private async loadBuildingAsset(asset: BaseAsset): Promise<HTMLImageElement> {
    const building = asset as BuildingSprite;
    
    // Поддержка интерьеров
    if (building.interiors) {
      await this.loadBuildingInterior(building);
    }
    
    // Поддержка повреждённых версий
    if (building.damaged) {
      await this.loadDamagedVariant(building);
    }
    
    return this.loadImageAsset(asset.path);
  }
  
  private async loadBuildingInterior(building: BuildingSprite): Promise<void> {
    const interiorPath = `${building.path}/interior.${this.config.defaultFormat}`;
    try {
      await this.loadImageAsset(interiorPath);
    } catch (error) {
      console.warn(`Interior not found for ${building.name}`);
    }
  }
  
  private async loadDamagedVariant(building: BuildingSprite): Promise<void> {
    const damagedPath = `${building.path}_damaged.${this.config.defaultFormat}`;
    try {
      await this.loadImageAsset(damagedPath);
    } catch (error) {
      console.warn(`Damaged variant not found for ${building.name}`);
    }
  }
  
  private async loadItemAsset(asset: BaseAsset): Promise<HTMLImageElement> {
    const item = asset as ItemSprite;
    
    // Генерация иконки для предмета
    if (item.iconSize) {
      return this.generateItemIcon(item);
    }
    
    return this.loadImageAsset(asset.path);
  }
  
  private async generateItemIcon(item: ItemSprite): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas');
    canvas.width = item.iconSize;
    canvas.height = item.iconSize;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create item icon context');
    }
    
    // Цвет по редкости
    const rarityColors: Record<string, string> = {
      common: '#a0a0a0',
      uncommon: '#50ff50',
      rare: '#5050ff',
      epic: '#ff50ff',
      legendary: '#ffaa00'
    };
    
    const color = rarityColors[item.rarity] || '#ffffff';
    
    // Рисуем простую иконку
    ctx.fillStyle = color;
    ctx.fillRect(2, 2, item.iconSize - 4, item.iconSize - 4);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, item.iconSize - 4, item.iconSize - 4);
    
    // Добавляем символ типа предмета
    ctx.fillStyle = '#000000';
    ctx.font = `${Math.floor(item.iconSize / 2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const symbols: Record<string, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      consumable: '🍖',
      material: '🪵',
      tool: '🔨',
      key: '🗝️',
      book: '📕',
      artifact: '💎'
    };
    
    const symbol = symbols[item.itemType] || '📦';
    ctx.fillText(symbol, item.iconSize / 2, item.iconSize / 2);
    
    // Создаём изображение из canvas
    return new Promise((resolve) => {
      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => resolve(img);
    });
  }
  
  public async loadEffectAsset(asset: BaseAsset): Promise<HTMLImageElement> {
    // Эффекты могут быть многокадровыми
    const frameCount = asset.tags.includes('particle') ? 8 : 4;
    const frames: HTMLImageElement[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      const framePath = `${asset.path}_frame${i}.${this.config.defaultFormat}`;
      try {
        frames.push(await this.loadImageAsset(framePath));
      } catch (error) {
        // Если кадров меньше, используем последний доступный
        if (frames.length > 0) {
          frames.push(frames[frames.length - 1]);
        }
      }
    }
    
    return frames[0] || this.createPlaceholder(asset);
  }
  
  private async loadUIAsset(asset: BaseAsset): Promise<HTMLImageElement> {
    // UI элементы могут использовать nine-slice
    return this.loadImageAsset(asset.path);
  }
  
  private async loadGenericAsset(asset: BaseAsset): Promise<any> {
    return this.loadImageAsset(asset.path);
  }
  
  // ============================================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================
  
  private async loadImageAsset(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = `${this.config.basePath}${path}`;
    });
  }
  
  private createPlaceholder(asset: BaseAsset): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = asset.width || 32;
    canvas.height = asset.height || 32;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create placeholder context');
    }
    
    // Розово-чёрная шахматка для отсутствующих ассетов
    const size = 8;
    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {
        ctx.fillStyle = ((x + y) / size) % 2 === 0 ? '#ff00ff' : '#000000';
        ctx.fillRect(x, y, size, size);
      }
    }
    
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }
  
  private updateLoadState(
    assetId: string, 
    status: LoadStatus, 
    progress: number, 
    error?: string
  ): void {
    this.loadStates.set(assetId, { assetId, status, progress, error });
  }
  
  private reportProgress(progress: number): void {
    console.log(`[AssetPipeline] Loading progress: ${(progress * 100).toFixed(1)}%`);
  }
  
  private notifyLoadComplete(): void {
    this.onLoadCompleteCallbacks.forEach(cb => cb());
    console.log('[AssetPipeline] All assets loaded');
  }
  
  public onLoadComplete(callback: () => void): void {
    this.onLoadCompleteCallbacks.push(callback);
  }
  
  // ============================================
  // ДОСТУП К АССЕТАМ
  // ============================================
  
  public getAsset<T extends BaseAsset>(assetId: string): T | undefined {
    return this.loadedAssets.get(assetId);
  }
  
  public getAssetsByCategory(category: AssetCategory): BaseAsset[] {
    const result: BaseAsset[] = [];
    this.loadedAssets.forEach((asset, _id) => {
      if (asset.category === category) {
        result.push(asset);
      }
    });
    return result;
  }
  
  public getAssetPack(packId: string): AssetPack | undefined {
    return this.assetPacks.get(packId);
  }
  
  public getLoadState(assetId: string): AssetLoadState | undefined {
    return this.loadStates.get(assetId);
  }
  
  public getAllLoadStates(): Map<string, AssetLoadState> {
    return new Map(this.loadStates);
  }
  
  // ============================================
  // МИНИМАЛЬНЫЙ НАБОР ДЛЯ ЭТАПА 35
  // ============================================
  
  public async loadMinimalAssetPack(): Promise<void> {
    console.log('[AssetPipeline] Loading minimal asset pack...');
    
    // Player base
    await this.loadAsset({
      id: 'player-base-human',
      name: 'Human Player Base',
      category: 'characters',
      format: 'png',
      path: 'characters/human_base.png',
      width: 32,
      height: 32,
      tags: ['player', 'human', 'base'],
      version: 1
    } as CharacterSprite);
    
    // 3-5 рас
    for (const race of BASE_RACES.slice(0, 3)) {
      await this.loadAsset({
        id: `race-${race}`,
        name: `${race} race sprite`,
        category: 'characters',
        format: 'png',
        path: `characters/${race}.png`,
        width: 32,
        height: 32,
        tags: ['race', race],
        version: 1
      } as CharacterSprite);
    }
    
    // Несколько наборов одежды
    await this.loadAsset({
      id: 'clothing-casual',
      name: 'Casual Clothing',
      category: 'characters',
      format: 'png',
      path: 'characters/clothing_casual.png',
      width: 32,
      height: 32,
      tags: ['clothing', 'casual'],
      version: 1
    });
    
    // Terrain tiles
    for (const terrain of BASE_TERRAIN) {
      await this.loadAsset({
        id: `terrain-${terrain}`,
        name: `${terrain} tile`,
        category: 'tiles',
        format: 'png',
        path: `tiles/${terrain}.png`,
        width: 32,
        height: 32,
        tags: ['terrain', terrain],
        version: 1,
        walkable: terrain !== 'water' && terrain !== 'mountain'
      } as TerrainTile);
    }
    
    // Деревья
    await this.loadAsset({
      id: 'tree-oak',
      name: 'Oak Tree',
      category: 'tiles',
      format: 'png',
      path: 'tiles/tree_oak.png',
      width: 32,
      height: 48,
      tags: ['tree', 'vegetation'],
      version: 1
    });
    
    // Здания
    await this.loadAsset({
      id: 'building-house',
      name: 'House',
      category: 'buildings',
      format: 'png',
      path: 'buildings/house.png',
      width: 64,
      height: 64,
      tags: ['building', 'house'],
      version: 1
    });
    
    // Оружие
    for (const weapon of BASE_WEAPONS.slice(0, 4)) {
      await this.loadAsset({
        id: `weapon-${weapon}`,
        name: `${weapon} weapon`,
        category: 'items',
        format: 'png',
        path: `items/${weapon}.png`,
        width: 16,
        height: 16,
        tags: ['weapon', weapon],
        version: 1
      });
    }
    
    // NPC placeholders
    await this.loadAsset({
      id: 'npc-placeholder',
      name: 'NPC Placeholder',
      category: 'characters',
      format: 'png',
      path: 'characters/npc_placeholder.png',
      width: 32,
      height: 32,
      tags: ['npc', 'placeholder'],
      version: 1
    });
    
    console.log('[AssetPipeline] Minimal asset pack loaded');
  }
  
  // ============================================
  // SPRITE SHEET GENERATION
  // ============================================
  
  public async generateSpriteSheet(
    assets: BaseAsset[],
    sheetName: string
  ): Promise<HTMLImageElement> {
    if (!this.config.spriteSheetEnabled) {
      throw new Error('Sprite sheets are disabled in config');
    }
    
    const maxWidth = this.config.maxTextureSize;
    const maxHeight = this.config.maxTextureSize;
    
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create sprite sheet context');
    }
    
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    
    for (const asset of assets) {
      const imageData = this.loadedAssets.get(asset.id);
      
      if (!imageData) {
        console.warn(`Asset ${asset.id} not loaded, skipping for sprite sheet`);
        continue;
      }
      
      const img = imageData instanceof HTMLImageElement ? imageData : null;
      
      if (img) {
        if (x + asset.width > maxWidth) {
          x = 0;
          y += rowHeight;
          rowHeight = 0;
        }
        
        if (y + asset.height > maxHeight) {
          console.warn('Sprite sheet full, some assets may not fit');
          break;
        }
        
        ctx.drawImage(img, x, y);
        x += asset.width + 2; // 2px padding
        rowHeight = Math.max(rowHeight, asset.height);
      }
    }
    
    return new Promise((resolve) => {
      const sheet = new Image();
      sheet.src = canvas.toDataURL();
      sheet.onload = () => {
        this.spriteSheets.set(sheetName, sheet);
        resolve(sheet);
      };
    });
  }
  
  public getSpriteSheet(name: string): HTMLImageElement | undefined {
    return this.spriteSheets.get(name);
  }
  
  // ============================================
  // АНИМАЦИИ
  // ============================================
  
  public async loadAnimation(animation: AnimationClip): Promise<HTMLImageElement[]> {
    const frames: HTMLImageElement[] = [];
    
    for (const assetId of animation.assetIds) {
      const asset = this.loadedAssets.get(assetId);
      if (asset) {
        frames.push(asset);
      }
    }
    
    return frames;
  }
  
  public playAnimation(
    ctx: CanvasRenderingContext2D,
    frames: HTMLImageElement[],
    x: number,
    y: number,
    fps: number,
    loop: boolean
  ): void {
    const frameDuration = 1000 / fps;
    let currentFrame = 0;
    let lastTime = 0;
    
    const animate = (timestamp: number) => {
      if (timestamp - lastTime >= frameDuration) {
        ctx.clearRect(x, y, frames[0].width, frames[0].height);
        ctx.drawImage(frames[currentFrame], x, y);
        
        currentFrame = (currentFrame + 1) % frames.length;
        
        if (!loop && currentFrame === 0) {
          return;
        }
        
        lastTime = timestamp;
      }
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
  
  // ============================================
  // УТИЛИТЫ
  // ============================================
  
  public clearCache(): void {
    this.loadedAssets.clear();
    this.loadStates.clear();
    this.spriteSheets.clear();
    console.log('[AssetPipeline] Cache cleared');
  }
  
  public getMemoryUsage(): number {
    let totalSize = 0;
    
    this.loadedAssets.forEach((asset) => {
      if (asset instanceof HTMLImageElement) {
        totalSize += asset.width * asset.height * 4; // RGBA bytes
      }
    });
    
    return totalSize;
  }
  
  public getStats(): {
    loadedCount: number;
    packCount: number;
    memoryUsage: number;
    pendingCount: number;
    errorCount: number;
  } {
    let pendingCount = 0;
    let errorCount = 0;
    
    this.loadStates.forEach((state) => {
      if (state.status === 'pending' || state.status === 'loading') {
        pendingCount++;
      } else if (state.status === 'error') {
        errorCount++;
      }
    });
    
    return {
      loadedCount: this.loadedAssets.size,
      packCount: this.assetPacks.size,
      memoryUsage: this.getMemoryUsage(),
      pendingCount,
      errorCount
    };
  }
}

// Экспорт singleton instance
export const assetPipeline = new AssetPipelineManager();
