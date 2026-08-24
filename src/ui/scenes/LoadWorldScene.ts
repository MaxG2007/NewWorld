import { Scene } from '../../core/Scene';

/**
 * Load World Scene - Select saved game
 */
export class LoadWorldScene extends Scene {
  public enter(): void {
    console.log('LoadWorldScene: entered');
  }

  public exit(): void {
    console.log('LoadWorldScene: exited');
  }

  public update(_deltaTime: number): void {
    // Update load world logic
  }

  public render(): void {
    console.log('LoadWorldScene: rendering');
  }

  public onLoadSave(saveId: string): void {
    console.log(`Loading save: ${saveId}`);
  }

  public onBack(): void {
    this.sceneManager.loadScene('menu');
  }
}
