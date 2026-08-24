import { Scene } from '../../core/Scene';

/**
 * New World Creation Scene
 */
export class NewWorldScene extends Scene {
  public enter(): void {
    console.log('NewWorldScene: entered');
  }

  public exit(): void {
    console.log('NewWorldScene: exited');
  }

  public update(_deltaTime: number): void {
    // Update new world logic
  }

  public render(): void {
    console.log('NewWorldScene: rendering');
  }

  public onCreateWorld(): void {
    console.log('Creating new world...');
    // Navigate to game world
  }

  public onBack(): void {
    this.sceneManager.loadScene('menu');
  }
}
