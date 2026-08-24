import { Scene } from '../../core/Scene';

/**
 * Main Menu Scene
 */
export class MenuScene extends Scene {
  public enter(): void {
    console.log('MenuScene: entered');
  }

  public exit(): void {
    console.log('MenuScene: exited');
  }

  public update(_deltaTime: number): void {
    // Update menu logic
  }

  public render(): void {
    console.log('MenuScene: rendering');
  }

  public onNewWorld(): void {
    this.sceneManager.loadScene('newWorld');
  }

  public onLoadWorld(): void {
    this.sceneManager.loadScene('loadWorld');
  }

  public onSettings(): void {
    this.sceneManager.loadScene('settings');
  }

  public onDebug(): void {
    this.sceneManager.loadScene('debug');
  }
}
