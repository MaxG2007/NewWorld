import {
  RebirthData,
  MetaLegacy,
  LifecycleConfig
} from '../types/lifecycle';

/**
 * Система возрождения - создание нового персонажа после смерти
 */
export class RebirthSystem {
  
  private config: LifecycleConfig;
  
  constructor(config: LifecycleConfig) {
    this.config = config;
  }
  
  /**
   * Создать данные для нового рождения
   * Важно: НЕТ переноса силы, навыков, предметов!
   * Сохраняются только разрешенные мета-следы
   */
  createRebirthData(
    newCharacterId: string,
    previousMetaLegacy: MetaLegacy | null,
    worldState: any
  ): RebirthData {
    // Сгенерировать случайные параметры для нового персонажа
    const randomTraits = this.generateRandomTraits();
    const randomStartingLocation = this.generateRandomStartingLocation(worldState);
    const randomBackground = this.generateRandomBackground();
    
    // Подготовить сохраняемые мета-следы
    const metaLegacy = this.prepareMetaLegacy(previousMetaLegacy, this.config);
    
    // Определить начальные бонусы/малусы от наследия
    const { startingBonuses, startingMaluses } = this.calculateLegacyEffects(metaLegacy);
    
    return {
      newCharacterId,
      randomTraits,
      randomStartingLocation,
      randomBackground,
      metaLegacy,
      startingBonuses,
      startingMaluses
      // ВАЖНО: Здесь НЕТ характеристик, навыков, предметов, денег
      // Новый персонаж начинает с базовыми значениями по умолчанию
    };
  }
  
  /**
   * Сгенерировать случайные черты характера
   */
  private generateRandomTraits(): string[] {
    const traitPool = [
      'curious', 'brave', 'cautious', 'generous', 'greedy',
      'honest', 'deceptive', 'loyal', 'ambitious', 'content',
      'optimistic', 'pessimistic', 'patient', 'impulsive',
      'kind', 'cruel', 'wise', 'foolish', 'strong_willed',
      'weak_willed', 'charismatic', 'introverted', 'creative',
      'practical', 'spiritual', 'skeptical', 'hopeful'
    ];
    
    // Выбрать 3-5 случайных черт
    const count = 3 + Math.floor(Math.random() * 3);
    const traits: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * traitPool.length);
      const trait = traitPool[randomIndex];
      if (!traits.includes(trait)) {
        traits.push(trait);
      }
    }
    
    return traits;
  }
  
  /**
   * Сгенерировать случайную стартовую локацию
   */
  private generateRandomStartingLocation(worldState: any): { x: number; y: number; regionId: string } {
    // Получить список безопасных регионов для рождения
    const safeRegions = worldState.regions?.filter((r: any) => r.isSafeForBirth) || [];
    
    if (safeRegions.length > 0) {
      const region = safeRegions[Math.floor(Math.random() * safeRegions.length)];
      return {
        x: region.spawnPoint?.x || region.centerX || 0,
        y: region.spawnPoint?.y || region.centerY || 0,
        regionId: region.id
      };
    }
    
    // Если нет безопасных регионов, использовать дефолтную локацию
    return {
      x: 0,
      y: 0,
      regionId: 'default_starting_region'
    };
  }
  
  /**
   * Сгенерировать случайное происхождение
   */
  private generateRandomBackground(): string {
    const backgrounds = [
      'Простой крестьянин из небольшой деревни',
      'Городской ремесленник, ищущий лучшей жизни',
      'Бродячий торговец без дома',
      'Младший ребенок благородной семьи',
      'Сирота, выросший на улицах города',
      'Отшельник из далекого монастыря',
      'Бывший солдат, ищущий покоя',
      'Странствующий ученый в поисках знаний',
      'Охотник из лесного поселения',
      'Рыбак из прибрежной деревни',
      'Шахтер из горного клана',
      'Пастух с бескрайних равнин'
    ];
    
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }
  
  /**
   * Подготовить мета-следы для сохранения
   */
  private prepareMetaLegacy(previous: MetaLegacy | null, config: LifecycleConfig): MetaLegacy {
    const defaultLegacy: MetaLegacy = {
      familyHistory: {
        familyName: 'Unknown',
        generation: 1,
        notableAncestors: [],
        familyReputation: 0
      },
      worldChronicleEntries: [],
      familyLegend: {
        legendType: 'mysterious',
        legendStrength: 0,
        bonuses: [],
        maluses: []
      },
      unlockedWorldKnowledge: {
        mapRegions: [],
        discoveredSecrets: [],
        knownRecipes: [],
        learnedLanguages: []
      }
    };
    
    if (!previous) {
      return defaultLegacy;
    }
    
    // Обновить поколение семьи
    const newGeneration = previous.familyHistory.generation + 1;
    
    // Применить затухание репутации со временем
    const decayedReputation = Math.floor(
      previous.familyHistory.familyReputation * (1 - config.legacyDecayRate)
    );
    
    // Ограничить максимальное поколение
    if (newGeneration > config.maxFamilyGeneration) {
      // Сбросить некоторые старые записи
      return {
        ...previous,
        familyHistory: {
          ...previous.familyHistory,
          generation: config.maxFamilyGeneration,
          familyReputation: decayedReputation,
          notableAncestors: previous.familyHistory.notableAncestors.slice(-5) // Хранить только последних 5
        },
        worldChronicleEntries: previous.worldChronicleEntries.slice(-20), // Хранить только последние 20 записей
        familyLegend: {
          ...previous.familyLegend,
          legendStrength: Math.max(0, previous.familyLegend.legendStrength - 5)
        }
      };
    }
    
    return {
      ...previous,
      familyHistory: {
        ...previous.familyHistory,
        generation: newGeneration,
        familyReputation: decayedReputation
      }
    };
  }
  
  /**
   * Рассчитать эффекты наследия (бонусы/малусы)
   */
  private calculateLegacyEffects(metaLegacy: MetaLegacy): { 
    startingBonuses: string[]; 
    startingMaluses: string[];
  } {
    const bonuses: string[] = [];
    const maluses: string[] = [];
    
    // Бонусы от репутации семьи
    if (metaLegacy.familyHistory.familyReputation > 50) {
      bonuses.push('good_family_reputation');
    } else if (metaLegacy.familyHistory.familyReputation < -50) {
      maluses.push('bad_family_reputation');
    }
    
    // Бонусы от легенды семьи
    const legend = metaLegacy.familyLegend;
    if (legend.legendStrength > 30) {
      switch (legend.legendType) {
        case 'heroic':
          bonuses.push('heroic_ancestry');
          break;
        case 'noble':
          bonuses.push('noble_bloodline');
          break;
        case 'mysterious':
          bonuses.push('mysterious_heritage');
          break;
        case 'tragic':
          maluses.push('tragic_curse');
          break;
        case 'infamous':
          maluses.push('infamous_name');
          break;
      }
    }
    
    // Добавить явные бонусы/малусы из легенды
    bonuses.push(...legend.bonuses);
    maluses.push(...legend.maluses);
    
    // Бонусы от известных карт
    if (metaLegacy.unlockedWorldKnowledge.mapRegions.length > 3) {
      bonuses.push('well_traveled_family');
    }
    
    // Бонусы от известных рецептов
    if (metaLegacy.unlockedWorldKnowledge.knownRecipes.length > 5) {
      bonuses.push('family_secrets');
    }
    
    return { startingBonuses: bonuses, startingMaluses: maluses };
  }
  
  /**
   * Проверить возможность воскрешения (редкое событие)
   */
  canResurrect(character: any, context: {
    hasResurrectionItem?: boolean;
    nearbyTemple?: boolean;
    deityFavor?: number;
    ritualPerformed?: boolean;
  }): boolean {
    if (!this.config.allowResurrectionRituals) {
      return false;
    }
    
    // Воскрешение возможно только при выполнении всех условий
    return !!(
      context.ritualPerformed &&
      context.nearbyTemple &&
      (context.hasResurrectionItem || (context.deityFavor && context.deityFavor > 80))
    );
  }
  
  /**
   * Получить описание процесса возрождения для игрока
   */
  getRebirthNarrative(rebirthData: RebirthData): string {
    const lines: string[] = [];
    
    lines.push('═'.repeat(60));
    lines.push('НОВОЕ РОЖДЕНИЕ');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push(`📜 Происхождение: ${rebirthData.randomBackground}`);
    lines.push('');
    
    lines.push('✨ Черты характера:');
    rebirthData.randomTraits.forEach(trait => {
      lines.push(`  • ${this.formatTrait(trait)}`);
    });
    lines.push('');
    
    lines.push(`📍 Место рождения: Регион ${rebirthData.randomStartingLocation.regionId}`);
    lines.push(`   Координаты: (${rebirthData.randomStartingLocation.x}, ${rebirthData.randomStartingLocation.y})`);
    lines.push('');
    
    if (rebirthData.startingBonuses.length > 0) {
      lines.push('🎁 Наследие предков (бонусы):');
      rebirthData.startingBonuses.forEach(bonus => {
        lines.push(`  • ${this.formatBonus(bonus)}`);
      });
      lines.push('');
    }
    
    if (rebirthData.startingMaluses.length > 0) {
      lines.push('⚠️ Наследие предков (бремя):');
      rebirthData.startingMaluses.forEach(malus => {
        lines.push(`  • ${this.formatMalus(malus)}`);
      });
      lines.push('');
    }
    
    // Показать информацию о семье
    const family = rebirthData.metaLegacy.familyHistory;
    lines.push('👨‍👩‍👧‍👦 Семья:');
    lines.push(`  Род: ${family.familyName}`);
    lines.push(`  Поколение: ${family.generation}`);
    lines.push(`  Репутация: ${family.familyReputation}`);
    if (family.notableAncestors.length > 0) {
      lines.push(`  Известные предки: ${family.notableAncestors.join(', ')}`);
    }
    lines.push('');
    
    lines.push('⚠️ ВАЖНО:');
    lines.push('  Сила, навыки и предметы НЕ передаются.');
    lines.push('  Только история, репутация и знания мира остаются.');
    lines.push('═'.repeat(60));
    
    return lines.join('\n');
  }
  
  private formatTrait(trait: string): string {
    const traitNames: Record<string, string> = {
      'curious': 'Любопытный',
      'brave': 'Храбрый',
      'cautious': 'Осторожный',
      'generous': 'Щедрый',
      'greedy': 'Жадный',
      'honest': 'Честный',
      'deceptive': 'Лживый',
      'loyal': 'Верный',
      'ambitious': 'Амбициозный',
      'content': 'Довольный',
      'optimistic': 'Оптимист',
      'pessimistic': 'Пессимист',
      'patient': 'Терпеливый',
      'impulsive': 'Импульсивный',
      'kind': 'Добрый',
      'cruel': 'Жестокий',
      'wise': 'Мудрый',
      'foolish': 'Глупый',
      'strong_willed': 'Сильная воля',
      'weak_willed': 'Слабая воля',
      'charismatic': 'Харизматичный',
      'introverted': 'Интроверт',
      'creative': 'Креативный',
      'practical': 'Практичный',
      'spiritual': 'Духовный',
      'skeptical': 'Скептик',
      'hopeful': 'Надеющийся'
    };
    return traitNames[trait] || trait;
  }
  
  private formatBonus(bonus: string): string {
    const bonusNames: Record<string, string> = {
      'good_family_reputation': 'Хорошая репутация семьи',
      'heroic_ancestry': 'Героическое происхождение',
      'noble_bloodline': 'Благородная кровь',
      'mysterious_heritage': 'Таинственное наследие',
      'well_traveled_family': 'Путешественники в роду',
      'family_secrets': 'Семейные секреты'
    };
    return bonusNames[bonus] || bonus;
  }
  
  private formatMalus(malus: string): string {
    const malusNames: Record<string, string> = {
      'bad_family_reputation': 'Плохая репутация семьи',
      'tragic_curse': 'Родовое проклятие',
      'infamous_name': 'Позорное имя'
    };
    return malusNames[malus] || malus;
  }
}
