/**
 * Базовый интерфейс для всех сущностей игры
 */
export interface BaseEntity {
  id: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Ссылка на другую сущность
 */
export interface EntityRef<T extends string = string> {
  type: T;
  id: string;
}
