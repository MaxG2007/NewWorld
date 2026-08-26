/**
 * Система развития навыков в детстве
 */

export interface ChildhoodSkills {
  strength: number;      // Сила
  intelligence: number;  // Интеллект
  dexterity: number;     // Ловкость
  speech: number;        // Речь/Красноречие
  observation: number;   // Наблюдательность
  sociability: number;   // Социальность
  crafting: number;      // Ремесленные навыки
  survival: number;      // Выживание
}

// Базовые значения навыков
export const BASE_SKILLS: ChildhoodSkills = {
  strength: 0,
  intelligence: 0,
  dexterity: 0,
  speech: 0,
  observation: 0,
  sociability: 0,
  crafting: 0,
  survival: 0,
};

// Максимальные значения навыков для ребенка (до применения множителей)
const MAX_CHILDHOOD_SKILL = 20;
const MIN_CHILDHOOD_SKILL = -10;

/**
 * Класс для управления развитием навыков
 */
export class SkillDevelopment {
  private skills: ChildhoodSkills;
  
  constructor(initialSkills?: Partial<ChildhoodSkills>) {
    this.skills = {
      ...BASE_SKILLS,
      ...initialSkills,
    };
  }
  
  /**
   * Добавить очки к навыку
   */
  addSkill(skill: keyof ChildhoodSkills, value: number): void {
    const currentValue = this.skills[skill];
    let newValue = currentValue + value;
    
    // Ограничиваем диапазон
    newValue = Math.max(MIN_CHILDHOOD_SKILL, Math.min(MAX_CHILDHOOD_SKILL, newValue));
    
    this.skills[skill] = Math.round(newValue * 10) / 10;
  }
  
  /**
   * Применить множитель роста навыков (зависит от возрастной стадии)
   */
  applyGrowthMultiplier(multiplier: number): void {
    (Object.keys(this.skills) as Array<keyof ChildhoodSkills>).forEach(skill => {
      const currentValue = this.skills[skill];
      if (currentValue !== 0) {
        this.skills[skill] = Math.round(currentValue * multiplier * 10) / 10;
      }
    });
  }
  
  /**
   * Получить текущие навыки
   */
  getSkills(): ChildhoodSkills {
    return { ...this.skills };
  }
  
  /**
   * Получить конкретный навык
   */
  getSkill(skill: keyof ChildhoodSkills): number {
    return this.skills[skill];
  }
  
  /**
   * Установить навык
   */
  setSkill(skill: keyof ChildhoodSkills, value: number): void {
    this.skills[skill] = Math.max(
      MIN_CHILDHOOD_SKILL,
      Math.min(MAX_CHILDHOOD_SKILL, value)
    );
  }
  
  /**
   * Применить эффекты события к навыкам
   */
  applyEventEffects(effects: Partial<ChildhoodSkills>): void {
    (Object.keys(effects) as Array<keyof ChildhoodSkills>).forEach(skill => {
      const value = effects[skill];
      if (value !== undefined && value !== 0) {
        this.addSkill(skill, value);
      }
    });
  }
  
  /**
   * Рассчитать общий уровень развития
   */
  getTotalDevelopment(): number {
    return Object.values(this.skills).reduce((sum, value) => sum + Math.abs(value), 0);
  }
  
  /**
   * Получить самый развитый навык
   */
  getHighestSkill(): { skill: keyof ChildhoodSkills; value: number } {
    let highest: keyof ChildhoodSkills = 'strength';
    let maxValue = this.skills.strength;
    
    (Object.keys(this.skills) as Array<keyof ChildhoodSkills>).forEach(skill => {
      if (this.skills[skill] > maxValue) {
        maxValue = this.skills[skill];
        highest = skill;
      }
    });
    
    return { skill: highest, value: maxValue };
  }
  
  /**
   * Получить самый слабый навык
   */
  getLowestSkill(): { skill: keyof ChildhoodSkills; value: number } {
    let lowest: keyof ChildhoodSkills = 'strength';
    let minValue = this.skills.strength;
    
    (Object.keys(this.skills) as Array<keyof ChildhoodSkills>).forEach(skill => {
      if (this.skills[skill] < minValue) {
        minValue = this.skills[skill];
        lowest = skill;
      }
    });
    
    return { skill: lowest, value: minValue };
  }
  
  /**
   * Сериализация
   */
  toJSON(): ChildhoodSkills {
    return this.getSkills();
  }
  
  /**
   * Десериализация
   */
  static fromJSON(data: ChildhoodSkills): SkillDevelopment {
    return new SkillDevelopment(data);
  }
  
  /**
   * Создать копию
   */
  clone(): SkillDevelopment {
    return new SkillDevelopment(this.skills);
  }
}

/**
 * Рассчитать бонусы от социального статуса семьи к навыкам
 */
export function calculateStatusBonuses(socialStatus: number): Partial<ChildhoodSkills> {
  const bonuses: Partial<ChildhoodSkills> = {};
  
  // Высокий статус: лучшее образование
  if (socialStatus >= 70) {
    bonuses.intelligence = 3;
    bonuses.speech = 2;
  } else if (socialStatus >= 40) {
    bonuses.intelligence = 1;
    bonuses.speech = 1;
  }
  
  // Низкий статус: больше выживания
  if (socialStatus <= 20) {
    bonuses.survival = 2;
    bonuses.strength = 1;
  } else if (socialStatus <= 40) {
    bonuses.survival = 1;
  }
  
  // Средний статус: баланс
  if (socialStatus > 40 && socialStatus < 70) {
    bonuses.sociability = 1;
    bonuses.crafting = 1;
  }
  
  return bonuses;
}

/**
 * Рассчитать бонусы от типа биома
 */
export function calculateBiomeBonuses(biome: string): Partial<ChildhoodSkills> {
  const bonuses: Partial<ChildhoodSkills> = {};
  
  switch (biome.toLowerCase()) {
    case 'forest':
    case 'jungle':
      bonuses.survival = 2;
      bonuses.observation = 1;
      break;
    case 'mountain':
      bonuses.strength = 2;
      bonuses.survival = 1;
      break;
    case 'plains':
    case 'field':
      bonuses.crafting = 1;
      bonuses.sociability = 1;
      break;
    case 'desert':
      bonuses.survival = 3;
      break;
    case 'tundra':
      bonuses.survival = 2;
      bonuses.strength = 1;
      break;
    case 'coast':
      bonuses.survival = 1;
      bonuses.observation = 1;
      break;
    case 'city':
    case 'settlement':
      bonuses.speech = 2;
      bonuses.sociability = 1;
      bonuses.crafting = 1;
      break;
    default:
      break;
  }
  
  return bonuses;
}

/**
 * Рассчитать расовые бонусы к навыкам
 */
export function calculateRaceBonuses(raceId: string): Partial<ChildhoodSkills> {
  // Бонусы определяются в зависимости от расы
  // Детали реализуются в системе рас
  const bonuses: Partial<ChildhoodSkills> = {};
  
  // Примерные бонусы (должны быть синхронизированы с Race.ts)
  switch (raceId.toLowerCase()) {
    case 'human':
      bonuses.speech = 1;
      bonuses.sociability = 1;
      break;
    case 'elf':
      bonuses.dexterity = 2;
      bonuses.observation = 1;
      break;
    case 'dwarf':
      bonuses.strength = 1;
      bonuses.crafting = 2;
      break;
    case 'orc':
      bonuses.strength = 2;
      bonuses.survival = 1;
      break;
    case 'hobbit':
      bonuses.dexterity = 1;
      bonuses.survival = 1;
      bonuses.sociability = 1;
      break;
    default:
      break;
  }
  
  return bonuses;
}
