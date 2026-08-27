/**
 * Procedural Asset Generator for Mega Pixel World
 * Этап 35 — Pixel Art + Asset Pipeline
 * 
 * Генерация procedural-ассетов для заполнения пробелов до появления художественных спрайтов.
 * Графика не блокирует Game Core.
 */

import { 
  RaceType,
  TerrainType,
  BuildingType,
  WeaponType,
  ItemType
} from './types/AssetTypes';

export class ProceduralAssetGenerator {
  
  // ============================================
  // ГЕНЕРАЦИЯ СПРАЙТОВ ПЕРСОНАЖЕЙ
  // ============================================
  
  public generateCharacterSprite(
    race: RaceType,
    _gender: 'male' | 'female',
    canvasSize: number = 32
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create character sprite context');
    }
    
    // Цвета для разных рас
    const raceColors: Record<RaceType, { skin: string; hair: string; clothes: string }> = {
      human: { skin: '#ffdbac', hair: '#8b4513', clothes: '#4a6fa5' },
      elf: { skin: '#f0e0d0', hair: '#c0c0c0', clothes: '#2d5016' },
      dwarf: { skin: '#d4a574', hair: '#8b0000', clothes: '#8b4513' },
      orc: { skin: '#4a7c23', hair: '#1a1a1a', clothes: '#8b0000' },
      halfling: { skin: '#ffcd94', hair: '#da8a04', clothes: '#1e4d2b' }
    };
    
    const colors = raceColors[race];
    
    // Тело
    ctx.fillStyle = colors.skin;
    ctx.fillRect(canvasSize / 4, canvasSize / 3, canvasSize / 2, canvasSize / 3);
    
    // Голова
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 4, canvasSize / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Волосы
    ctx.fillStyle = colors.hair;
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 4 - 2, canvasSize / 6, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Одежда
    ctx.fillStyle = colors.clothes;
    ctx.fillRect(canvasSize / 4, canvasSize / 2, canvasSize / 2, canvasSize / 6);
    
    // Глаза
    ctx.fillStyle = '#000000';
    const eyeY = canvasSize / 4;
    const eyeOffset = canvasSize / 8;
    ctx.fillRect(canvasSize / 2 - eyeOffset - 1, eyeY - 1, 2, 2);
    ctx.fillRect(canvasSize / 2 + eyeOffset - 1, eyeY - 1, 2, 2);
    
    return this.canvasToImage(canvas);
  }
  
  // ============================================
  // ГЕНЕРАЦИЯ TERRAIN TILES
  // ============================================
  
  public generateTerrainTile(
    terrainType: TerrainType,
    tileSize: number = 32,
    variant: number = 0
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create terrain tile context');
    }
    
    // Базовые цвета для типов местности
    const terrainColors: Record<TerrainType, string[]> = {
      grass: ['#4a7c23', '#5a8c33', '#3a6c13'],
      forest: ['#1e4d2b', '#2d5016', '#0f3d0f'],
      desert: ['#e6c88a', '#dcc080', '#d4b878'],
      snow: ['#ffffff', '#f0f0f0', '#e8e8e8'],
      water: ['#4a90d9', '#5aa0e9', '#3a80c9'],
      mountain: ['#8b8b8b', '#7b7b7b', '#9b9b9b'],
      swamp: ['#3d4d2b', '#2d3d1b', '#4d5d3b'],
      cliff: ['#6b6b5b', '#5b5b4b', '#7b7b6b'],
      sand: ['#f4e4bc', '#ecdcc4', '#e4d4bc'],
      rock: ['#5a5a5a', '#4a4a4a', '#6a6a6a']
    };
    
    const colors = terrainColors[terrainType];
    const baseColor = colors[variant % colors.length];
    
    // Заполняем базовым цветом
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, tileSize, tileSize);
    
    // Добавляем детали в зависимости от типа
    switch (terrainType) {
      case 'grass':
        this.addGrassDetails(ctx, tileSize, variant);
        break;
      case 'forest':
        this.addForestDetails(ctx, tileSize, variant);
        break;
      case 'desert':
      case 'sand':
        this.addDesertDetails(ctx, tileSize, variant);
        break;
      case 'snow':
        this.addSnowDetails(ctx, tileSize, variant);
        break;
      case 'water':
        this.addWaterDetails(ctx, tileSize, variant);
        break;
      case 'mountain':
      case 'rock':
      case 'cliff':
        this.addRockDetails(ctx, tileSize, variant);
        break;
      case 'swamp':
        this.addSwampDetails(ctx, tileSize, variant);
        break;
    }
    
    return this.canvasToImage(canvas);
  }
  
  private addGrassDetails(ctx: CanvasRenderingContext2D, size: number, variant: number): void {
    ctx.fillStyle = '#3a6c13';
    const seed = variant * 100;
    for (let i = 0; i < 8; i++) {
      const x = ((seed + i * 17) % size);
      const y = ((seed + i * 23) % size);
      ctx.fillRect(x, y, 2, 4);
    }
  }
  
  private addForestDetails(ctx: CanvasRenderingContext2D, size: number, variant: number): void {
    ctx.fillStyle = '#0f3d0f';
    const seed = variant * 100;
    for (let i = 0; i < 5; i++) {
      const x = ((seed + i * 19) % (size - 4)) + 2;
      const y = ((seed + i * 29) % (size - 4)) + 2;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  private addDesertDetails(ctx: CanvasRenderingContext2D, size: number, variant: number): void {
    ctx.fillStyle = '#c4b068';
    const seed = variant * 100;
    for (let i = 0; i < 6; i++) {
      const x = ((seed + i * 13) % (size - 2));
      const y = ((seed + i * 31) % (size - 2));
      ctx.fillRect(x, y, 1, 1);
    }
  }
  
  private addSnowDetails(ctx: CanvasRenderingContext2D, size: number, variant: number): void {
    ctx.fillStyle = '#ffffff';
    const seed = variant * 100;
    for (let i = 0; i < 10; i++) {
      const x = ((seed + i * 11) % (size - 2)) + 1;
      const y = ((seed + i * 37) % (size - 2)) + 1;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  private addWaterDetails(ctx: CanvasRenderingContext2D, size: number, variant: number): void {
    ctx.fillStyle = '#6ab0f9';
    ctx.globalAlpha = 0.5;
    const seed = variant * 100;
    for (let i = 0; i < 4; i++) {
      const x = ((seed + i * 23) % (size - 8)) + 4;
      const y = ((seed + i * 17) % (size - 2)) + 1;
      ctx.fillRect(x, y, 6, 1);
    }
    ctx.globalAlpha = 1.0;
  }
  
  private addRockDetails(ctx: CanvasRenderingContext2D, size: number, variant: number): void {
    ctx.fillStyle = '#3a3a3a';
    const seed = variant * 100;
    for (let i = 0; i < 4; i++) {
      const x = ((seed + i * 29) % (size - 6)) + 3;
      const y = ((seed + i * 19) % (size - 6)) + 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 4, y + 2);
      ctx.lineTo(x + 2, y + 5);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  private addSwampDetails(ctx: CanvasRenderingContext2D, size: number, variant: number): void {
    ctx.fillStyle = '#1a2d1b';
    ctx.globalAlpha = 0.7;
    const seed = variant * 100;
    for (let i = 0; i < 3; i++) {
      const x = ((seed + i * 31) % (size - 8)) + 4;
      const y = ((seed + i * 13) % (size - 8)) + 4;
      ctx.beginPath();
      ctx.ellipse(x, y, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
  
  // ============================================
  // ГЕНЕРАЦИЯ ДЕРЕВЬЕВ
  // ============================================
  
  public generateTreeSprite(
    size: 'small' | 'medium' | 'large' = 'medium',
    canvasSize: number = 32
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize * 1.5;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create tree sprite context');
    }
    
    const scale = size === 'small' ? 0.6 : size === 'large' ? 1.2 : 1.0;
    const centerX = canvasSize / 2;
    const trunkHeight = canvasSize * 0.4 * scale;
    const canopyRadius = canvasSize * 0.4 * scale;
    
    // Ствол
    ctx.fillStyle = '#5d4037';
    const trunkWidth = canvasSize * 0.15 * scale;
    ctx.fillRect(centerX - trunkWidth / 2, canvasSize - trunkHeight, trunkWidth, trunkHeight);
    
    // Крона
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(centerX, canvasSize * 0.4 * scale, canopyRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Детали кроны
    ctx.fillStyle = '#388e3c';
    ctx.beginPath();
    ctx.arc(centerX - canopyRadius * 0.3, canvasSize * 0.35 * scale, canopyRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + canopyRadius * 0.3, canvasSize * 0.35 * scale, canopyRadius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    return this.canvasToImage(canvas);
  }
  
  // ============================================
  // ГЕНЕРАЦИЯ ЗДАНИЙ
  // ============================================
  
  public generateBuildingSprite(
    _buildingType: BuildingType,
    style: string = 'medieval',
    size: { width: number; height: number } = { width: 64, height: 64 }
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create building sprite context');
    }
    
    // Цвета по стилю
    const styleColors: Record<string, { wall: string; roof: string; door: string }> = {
      medieval: { wall: '#c4a574', roof: '#8b4513', door: '#5d4037' },
      oriental: { wall: '#e8d4b8', roof: '#2d5016', door: '#8b4513' },
      dwarven: { wall: '#8b8b8b', roof: '#5a5a5a', door: '#3d3d3d' }
    };
    
    const colors = styleColors[style] || styleColors.medieval;
    
    // Стены
    ctx.fillStyle = colors.wall;
    ctx.fillRect(8, size.height / 2, size.width - 16, size.height / 2 - 8);
    
    // Крыша
    ctx.fillStyle = colors.roof;
    ctx.beginPath();
    ctx.moveTo(4, size.height / 2);
    ctx.lineTo(size.width / 2, 8);
    ctx.lineTo(size.width - 4, size.height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Дверь
    ctx.fillStyle = colors.door;
    const doorWidth = size.width * 0.15;
    const doorHeight = size.height * 0.25;
    ctx.fillRect(size.width / 2 - doorWidth / 2, size.height - doorHeight - 4, doorWidth, doorHeight);
    
    // Окна
    ctx.fillStyle = '#87ceeb';
    const windowSize = size.width * 0.1;
    ctx.fillRect(size.width * 0.25, size.height * 0.6, windowSize, windowSize);
    ctx.fillRect(size.width * 0.65, size.height * 0.6, windowSize, windowSize);
    
    return this.canvasToImage(canvas);
  }
  
  // ============================================
  // ГЕНЕРАЦИЯ ПРЕДМЕТОВ И ОРУЖИЯ
  // ============================================
  
  public generateItemSprite(
    itemType: ItemType,
    weaponType?: WeaponType,
    iconSize: number = 16
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = iconSize;
    canvas.height = iconSize;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create item sprite context');
    }
    
    // Фон
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, iconSize, iconSize);
    
    // Рамка
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, iconSize, iconSize);
    
    // Символ предмета
    ctx.fillStyle = this.getItemColor(itemType, weaponType);
    ctx.font = `${Math.floor(iconSize * 0.7)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const symbol = this.getItemSymbol(itemType, weaponType);
    ctx.fillText(symbol, iconSize / 2, iconSize / 2 + 1);
    
    return this.canvasToImage(canvas);
  }
  
  private getItemColor(itemType: ItemType, _weaponType?: WeaponType): string {
    if (itemType === 'weapon') {
      return '#ff6b6b';
    }
    if (itemType === 'armor') {
      return '#4ecdc4';
    }
    if (itemType === 'consumable') {
      return '#ffe66d';
    }
    if (itemType === 'material') {
      return '#95e1d3';
    }
    if (itemType === 'tool') {
      return '#f38181';
    }
    if (itemType === 'key') {
      return '#aa96da';
    }
    if (itemType === 'book') {
      return '#fcbad3';
    }
    if (itemType === 'artifact') {
      return '#ffd93d';
    }
    return '#ffffff';
  }
  
  private getItemSymbol(itemType: ItemType, weaponType?: WeaponType): string {
    if (itemType === 'weapon' && weaponType) {
      const symbols: Record<WeaponType, string> = {
        sword: '⚔️',
        axe: '🪓',
        spear: '🔱',
        bow: '🏹',
        staff: '🪄',
        dagger: '🗡️',
        mace: '🛡️',
        crossbow: '🎯'
      };
      return symbols[weaponType] || '⚔️';
    }
    
    const symbols: Record<ItemType, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      consumable: '🍖',
      material: '🪵',
      tool: '🔨',
      key: '🗝️',
      book: '📕',
      artifact: '💎'
    };
    
    return symbols[itemType] || '📦';
  }
  
  // ============================================
  // NPC PLACEHOLDERS
  // ============================================
  
  public generateNPCPlaceholder(
    profession: string,
    color: string = '#00ff00',
    size: number = 32
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create NPC placeholder context');
    }
    
    // Простой силуэт
    ctx.fillStyle = color;
    
    // Тело
    ctx.fillRect(size / 4, size / 3, size / 2, size / 3);
    
    // Голова
    ctx.beginPath();
    ctx.arc(size / 2, size / 4, size / 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Первая буква профессии
    ctx.fillStyle = '#000000';
    ctx.font = `${Math.floor(size / 3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(profession[0].toUpperCase(), size / 2, size / 2);
    
    return this.canvasToImage(canvas);
  }
  
  // ============================================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================
  
  private canvasToImage(canvas: HTMLCanvasElement): HTMLImageElement {
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    return img;
  }
  
  // ============================================
  // ГЕНЕРАЦИЯ МИНИМАЛЬНОГО НАБОРА
  // ============================================
  
  public generateMinimalAssetPack(): Map<string, HTMLImageElement> {
    const assets = new Map<string, HTMLImageElement>();
    
    // Player base
    assets.set('player-base-human', this.generateCharacterSprite('human', 'male'));
    
    // 3 расы
    assets.set('race-human', this.generateCharacterSprite('human', 'male'));
    assets.set('race-elf', this.generateCharacterSprite('elf', 'male'));
    assets.set('race-dwarf', this.generateCharacterSprite('dwarf', 'male'));
    
    // Terrain tiles
    const terrains: TerrainType[] = ['grass', 'forest', 'desert', 'snow', 'water', 'mountain'];
    terrains.forEach((terrain, i) => {
      assets.set(`terrain-${terrain}`, this.generateTerrainTile(terrain, 32, i));
    });
    
    // Дерево
    assets.set('tree-oak', this.generateTreeSprite('large', 32));
    
    // Здание
    assets.set('building-house', this.generateBuildingSprite('house', 'medieval', { width: 64, height: 64 }));
    
    // Оружие
    const weapons: WeaponType[] = ['sword', 'axe', 'spear', 'bow'];
    weapons.forEach((weapon) => {
      assets.set(`weapon-${weapon}`, this.generateItemSprite('weapon', weapon, 16));
    });
    
    // NPC placeholder
    assets.set('npc-placeholder', this.generateNPCPlaceholder('generic', '#00ff00'));
    
    return assets;
  }
}

// Экспорт singleton instance
export const proceduralGenerator = new ProceduralAssetGenerator();
