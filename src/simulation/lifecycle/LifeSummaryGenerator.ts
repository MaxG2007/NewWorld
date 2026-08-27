import {
  LifeSummary,
  LifeAchievement,
  LifeRelationship,
  CreatedObject,
  DiscoveredDungeon,
  ChronicleEntry,
  DeathCause
} from '../types/lifecycle';

/**
 * Генератор посмертного отчета о жизни персонажа
 */
export class LifeSummaryGenerator {
  
  /**
   * Сгенерировать полный посмертный отчет
   */
  generateLifeSummary(
    characterId: string,
    characterName: string,
    birthDate: number,
    deathDate: number,
    causeOfDeath: DeathCause,
    achievements: LifeAchievement[],
    relationships: LifeRelationship[],
    createdObjects: CreatedObject[],
    discoveredDungeons: DiscoveredDungeon[],
    chronicleEntries: ChronicleEntry[]
  ): LifeSummary {
    const ageAtDeath = Math.floor((deathDate - birthDate) / (365 * 24 * 60 * 60 * 1000));
    
    // Рассчитать оценку наследия
    const legacyScore = this.calculateLegacyScore(
      achievements,
      createdObjects,
      discoveredDungeons,
      chronicleEntries,
      relationships
    );
    
    // Найти тех, кто помнит умершего
    const rememberedBy = relationships
      .filter(r => r.strength > 20)
      .map(r => r.characterId);
    
    return {
      characterId,
      characterName,
      birthDate,
      deathDate,
      ageAtDeath,
      causeOfDeath,
      lifeStages: this.generateLifeStages(ageAtDeath),
      achievements,
      relationships,
      createdObjects,
      discoveredDungeons,
      chronicleEntries,
      legacyScore,
      rememberedBy
    };
  }
  
  /**
   * Рассчитать общую оценку наследия (0-100)
   */
  private calculateLegacyScore(
    achievements: LifeAchievement[],
    createdObjects: CreatedObject[],
    discoveredDungeons: DiscoveredDungeon[],
    chronicleEntries: ChronicleEntry[],
    relationships: LifeRelationship[]
  ): number {
    let score = 0;
    
    // Достижения (макс 30 баллов)
    const achievementScore = achievements.reduce((sum, a) => sum + a.importance * 3, 0);
    score += Math.min(30, achievementScore);
    
    // Созданные объекты (макс 20 баллов)
    const objectScore = createdObjects.filter(o => o.stillExists).length * 4;
    score += Math.min(20, objectScore);
    
    // Открытые подземелья (макс 15 баллов)
    const dungeonScore = discoveredDungeons.reduce((sum, d) => {
      return sum + (d.isPrimaryDiscoverer ? 5 : 2) + Math.min(3, d.depth);
    }, 0);
    score += Math.min(15, dungeonScore);
    
    // Записи в хронике (макс 25 баллов)
    const chronicleScore = chronicleEntries.reduce((sum, e) => {
      const impactValues = { minor: 2, notable: 5, significant: 10, legendary: 20 };
      return sum + (impactValues[e.impact] || 0);
    }, 0);
    score += Math.min(25, chronicleScore);
    
    // Отношения (макс 10 баллов)
    const relationshipScore = relationships.filter(r => r.strength > 50).length * 2;
    score += Math.min(10, relationshipScore);
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * Сгенерировать этапы жизни на основе возраста
   */
  private generateLifeStages(ageAtDeath: number): any[] {
    const stages: Array<{ age: number; stage: string; majorEvents: string[] }> = [];
    
    const stageDefinitions = [
      { maxAge: 3, stage: 'infancy' as const },
      { maxAge: 12, stage: 'childhood' as const },
      { maxAge: 18, stage: 'adolescence' as const },
      { maxAge: 40, stage: 'adulthood' as const },
      { maxAge: 60, stage: 'middle_age' as const },
      { maxAge: Infinity, stage: 'elderly' as const }
    ];
    
    for (const def of stageDefinitions) {
      if (ageAtDeath >= def.maxAge * 0.5) {
        stages.push({
          age: Math.min(ageAtDeath, def.maxAge),
          stage: def.stage,
          majorEvents: [] // Заполняется из данных персонажа
        });
      }
    }
    
    return stages;
  }
  
  /**
   * Форматировать посмертный отчет для отображения
   */
  formatLifeSummary(summary: LifeSummary): string {
    const lines: string[] = [];
    
    lines.push('═'.repeat(60));
    lines.push(`ПОСМЕРТНЫЙ ОТЧЕТ: ${summary.characterName}`);
    lines.push('═'.repeat(60));
    lines.push('');
    
    // Основная информация
    lines.push('📋 ОСНОВНАЯ ИНФОРМАЦИЯ');
    lines.push(`  Возраст: ${summary.ageAtDeath} лет`);
    lines.push(`  Причина смерти: ${summary.causeOfDeath.description}`);
    lines.push(`  Оценка наследия: ${summary.legacyScore}/100`);
    lines.push('');
    
    // Достижения
    if (summary.achievements.length > 0) {
      lines.push('🏆 ДОСТИЖЕНИЯ');
      summary.achievements.forEach(a => {
        lines.push(`  • ${a.title}: ${a.description}`);
      });
      lines.push('');
    }
    
    // Отношения
    const closeRelationships = summary.relationships.filter(r => r.strength > 50);
    if (closeRelationships.length > 0) {
      lines.push('❤️ БЛИЗКИЕ ОТНОШЕНИЯ');
      closeRelationships.forEach(r => {
        lines.push(`  • ${r.characterName} (${r.relationshipType}): ${r.summary}`);
      });
      lines.push('');
    }
    
    // Созданные объекты
    const existingObjects = summary.createdObjects.filter(o => o.stillExists);
    if (existingObjects.length > 0) {
      lines.push('🏗️ СОЗДАННЫЕ ОБЪЕКТЫ');
      existingObjects.forEach(o => {
        lines.push(`  • ${o.name} (${o.type}): ${o.description}`);
      });
      lines.push('');
    }
    
    // Открытые подземелья
    if (summary.discoveredDungeons.length > 0) {
      lines.push('🗺️ ОТКРЫТЫЕ ПОДЗЕМЕЛЬЯ');
      summary.discoveredDungeons.forEach(d => {
        const marker = d.isPrimaryDiscoverer ? '⭐' : '📍';
        lines.push(`  ${marker} ${d.name} (глубина: ${d.depth})`);
      });
      lines.push('');
    }
    
    // Записи в хронике
    if (summary.chronicleEntries.length > 0) {
      lines.push('📜 ЗАПИСИ В ХРОНИКЕ');
      summary.chronicleEntries.forEach(e => {
        lines.push(`  [${e.impact.toUpperCase()}] ${e.title}`);
      });
      lines.push('');
    }
    
    // Память
    if (summary.rememberedBy.length > 0) {
      lines.push('💭 ПОМНЯТ:');
      lines.push(`  ${summary.rememberedBy.length} персонажей хранят память о ${summary.characterName}`);
      lines.push('');
    }
    
    lines.push('═'.repeat(60));
    
    return lines.join('\n');
  }
}
