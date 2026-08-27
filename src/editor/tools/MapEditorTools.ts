/**
 * MapEditorTools - Инструменты редактора карты
 * Этап 34: FULL WORLD EDITOR
 */

import {
  TerrainEdit,
  BiomeEdit,
  HeightEdit,
  WaterEdit,
  ResourceEdit,
  RoadEdit,
  BuildingEdit,
  RegionEdit,
  POIEdit,
} from '../types/WorldEditorTypes';

export class MapEditorTools {
  // ==================== ИНСТРУМЕНТ TERRAIN ====================

  editTerrain(
    x: number,
    y: number,
    newTerrain: string,
    getTerrain: (x: number, y: number) => string,
    setTerrain: (x: number, y: number, terrain: string) => void
  ): TerrainEdit[] {
    const edits: TerrainEdit[] = [];
    const oldTerrain = getTerrain(x, y);
    
    if (oldTerrain !== newTerrain) {
      setTerrain(x, y, newTerrain);
      edits.push({
        x,
        y,
        oldTerrain,
        newTerrain,
      });
    }
    
    return edits;
  }

  // ==================== ИНСТРУМЕНТ BIOME ====================

  editBiome(
    x: number,
    y: number,
    newBiome: string,
    getBiome: (x: number, y: number) => string,
    setBiome: (x: number, y: number, biome: string) => void
  ): BiomeEdit[] {
    const edits: BiomeEdit[] = [];
    const oldBiome = getBiome(x, y);
    
    if (oldBiome !== newBiome) {
      setBiome(x, y, newBiome);
      edits.push({
        x,
        y,
        oldBiome,
        newBiome,
      });
    }
    
    return edits;
  }

  // ==================== ИНСТРУМЕНТ HEIGHT ====================

  editHeight(
    x: number,
    y: number,
    delta: number,
    getHeight: (x: number, y: number) => number,
    setHeight: (x: number, y: number, height: number) => void
  ): HeightEdit[] {
    const edits: HeightEdit[] = [];
    const oldHeight = getHeight(x, y);
    const newHeight = Math.max(0, oldHeight + delta);
    
    if (oldHeight !== newHeight) {
      setHeight(x, y, newHeight);
      edits.push({
        x,
        y,
        oldHeight,
        newHeight,
      });
    }
    
    return edits;
  }

  // ==================== ИНСТРУМЕНТ WATER ====================

  editWaterLevel(
    x: number,
    y: number,
    newLevel: number,
    getWaterLevel: (x: number, y: number) => number,
    setWaterLevel: (x: number, y: number, level: number) => void
  ): WaterEdit[] {
    const edits: WaterEdit[] = [];
    const oldLevel = getWaterLevel(x, y);
    
    if (oldLevel !== newLevel) {
      setWaterLevel(x, y, newLevel);
      edits.push({
        x,
        y,
        oldWaterLevel: oldLevel,
        newWaterLevel: newLevel,
      });
    }
    
    return edits;
  }

  // ==================== ИНСТРУМЕНТ RESOURCES ====================

  editResource(
    x: number,
    y: number,
    resourceId: string,
    quantity: number,
    operation: 'add' | 'remove' | 'modify',
    getResource: (x: number, y: number, id: string) => number | null,
    setResource: (x: number, y: number, id: string, qty: number) => void
  ): ResourceEdit[] {
    const edits: ResourceEdit[] = [];
    const currentQty = getResource(x, y, resourceId) ?? 0;
    
    let newQuantity = quantity;
    if (operation === 'add') {
      newQuantity = currentQty + quantity;
    } else if (operation === 'remove') {
      newQuantity = Math.max(0, currentQty - quantity);
    }
    
    setResource(x, y, resourceId, newQuantity);
    
    edits.push({
      x,
      y,
      resourceId,
      quantity: newQuantity,
      operation,
    });
    
    return edits;
  }

  // ==================== ИНСТРУМЕНТ ROADS ====================

  createRoad(
    points: { x: number; y: number }[],
    roadType: string,
    placeRoad: (x: number, y: number, type: string) => void
  ): RoadEdit {
    for (const point of points) {
      placeRoad(point.x, point.y, roadType);
    }
    
    return {
      points,
      roadType,
      operation: 'create',
    };
  }

  deleteRoad(
    points: { x: number; y: number }[],
    removeRoad: (x: number, y: number) => void
  ): RoadEdit {
    for (const point of points) {
      removeRoad(point.x, point.y);
    }
    
    return {
      points,
      roadType: '',
      operation: 'delete',
    };
  }

  // ==================== ИНСТРУМЕНТ BUILDINGS ====================

  placeBuilding(
    x: number,
    y: number,
    buildingType: string,
    rotation: number,
    canPlace: (x: number, y: number, type: string) => boolean,
    placeBuildingFn: (x: number, y: number, type: string, rot: number) => void
  ): BuildingEdit | null {
    if (!canPlace(x, y, buildingType)) {
      return null;
    }
    
    placeBuildingFn(x, y, buildingType, rotation);
    
    return {
      position: { x, y },
      buildingType,
      rotation,
      operation: 'place',
    };
  }

  removeBuilding(
    x: number,
    y: number,
    removeBuildingFn: (x: number, y: number) => void
  ): BuildingEdit | null {
    removeBuildingFn(x, y);
    
    return {
      position: { x, y },
      buildingType: '',
      rotation: 0,
      operation: 'remove',
    };
  }

  // ==================== ИНСТРУМЕНТ REGIONS ====================

  createRegion(
    regionId: string,
    name: string,
    boundaries: { x: number; y: number }[],
    createRegionFn: (id: string, name: string, bounds: { x: number; y: number }[]) => void
  ): RegionEdit {
    createRegionFn(regionId, name, boundaries);
    
    return {
      regionId,
      name,
      boundaries,
      operation: 'create',
    };
  }

  modifyRegion(
    regionId: string,
    name: string,
    boundaries: { x: number; y: number }[],
    updateRegionFn: (id: string, name: string, bounds: { x: number; y: number }[]) => void
  ): RegionEdit {
    updateRegionFn(regionId, name, boundaries);
    
    return {
      regionId,
      name,
      boundaries,
      operation: 'modify',
    };
  }

  deleteRegion(
    regionId: string,
    deleteRegionFn: (id: string) => void
  ): RegionEdit {
    deleteRegionFn(regionId);
    
    return {
      regionId,
      name: '',
      boundaries: [],
      operation: 'delete',
    };
  }

  // ==================== ИНСТРУМЕНТ POI (Points of Interest) ====================

  createPOI(
    poiId: string,
    name: string,
    type: string,
    x: number,
    y: number,
    metadata: Record<string, unknown>,
    createPOIFn: (id: string, name: string, t: string, px: number, py: number, meta: Record<string, unknown>) => void
  ): POIEdit {
    createPOIFn(poiId, name, type, x, y, metadata);
    
    return {
      poiId,
      name,
      type,
      position: { x, y },
      metadata,
      operation: 'create',
    };
  }

  removePOI(
    poiId: string,
    removePOIFn: (id: string) => void
  ): POIEdit {
    removePOIFn(poiId);
    
    return {
      poiId,
      name: '',
      type: '',
      position: { x: 0, y: 0 },
      metadata: {},
      operation: 'remove',
    };
  }

  modifyPOI(
    poiId: string,
    name: string,
    type: string,
    x: number,
    y: number,
    metadata: Record<string, unknown>,
    updatePOIFn: (id: string, name: string, t: string, px: number, py: number, meta: Record<string, unknown>) => void
  ): POIEdit {
    updatePOIFn(poiId, name, type, x, y, metadata);
    
    return {
      poiId,
      name,
      type,
      position: { x, y },
      metadata,
      operation: 'modify',
    };
  }

  // ==================== УТИЛИТЫ ====================

  /**
   * Получить точки в радиусе кисти
   */
  getBrushPoints(
    centerX: number,
    centerY: number,
    radius: number,
    shape: 'circle' | 'square' | 'line',
    lineEnd?: { x: number; y: number }
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    if (shape === 'square') {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          points.push({ x: centerX + dx, y: centerY + dy });
        }
      }
    } else if (shape === 'circle') {
      const radiusSquared = radius * radius;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx * dx + dy * dy <= radiusSquared) {
            points.push({ x: centerX + dx, y: centerY + dy });
          }
        }
      }
    } else if (shape === 'line' && lineEnd) {
      // Алгоритм Брезенхема для линии
      let x0 = centerX;
      let y0 = centerY;
      const x1 = lineEnd.x;
      const y1 = lineEnd.y;
      
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      
      while (true) {
        points.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
      }
    }

    return points;
  }

  /**
   * Проверка границ карты
   */
  isValidPosition(x: number, y: number, maxX: number, maxY: number): boolean {
    return x >= 0 && x < maxX && y >= 0 && y < maxY;
  }
}

// Экспорт singleton экземпляра
export const mapEditorTools = new MapEditorTools();
