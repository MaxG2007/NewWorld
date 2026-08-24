import { Scene } from '../../core/Scene';

/**
 * Debug Scene - Development tools and information
 */
export class DebugScene extends Scene {
  public enter(): void {
    console.log('DebugScene: entered');
  }

  public exit(): void {
    console.log('DebugScene: exited');
  }

  public update(_deltaTime: number): void {
    // Update debug logic
  }

  public render(): void {
    console.log('DebugScene: rendering');
  }

  public onBack(): void {
    this.sceneManager.loadScene('menu');
  }
}
