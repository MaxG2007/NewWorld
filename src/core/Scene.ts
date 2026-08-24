import { SceneManager } from './SceneManager';

/**
 * Base Scene interface for all game scenes
 */
export abstract class Scene {
  protected sceneManager: SceneManager;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  public abstract enter(): void;
  public abstract exit(): void;
  public abstract update(deltaTime: number): void;
  public abstract render(): void;
}
