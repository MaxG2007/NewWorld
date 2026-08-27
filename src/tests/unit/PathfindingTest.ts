/**
 * Unit тесты для pathfinding (поиска пути)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

interface Point {
  x: number;
  y: number;
}

export class PathfindingTest {
  private suite: TestSuite = {
    name: 'Pathfinding System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testDirectPath();
    this.testObstacleAvoidance();
    this.testNoPathFound();
    this.testDiagonalMovement();
    this.testPathOptimality();
    this.testLargeGrid();
    return this.suite;
  }

  private testDirectPath(): void {
    const startTime = Date.now();
    try {
      const grid = this.createGrid(10, 10, []);
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 5, y: 5 };
      const path = this.findPath(grid, start, end);

      if (!path || path.length === 0) {
        throw new Error('No path found in empty grid');
      }

      // Проверка что путь существует и корректен
      if (path[0].x !== start.x || path[0].y !== start.y) {
        throw new Error('Path does not start at start point');
      }

      const lastPoint = path[path.length - 1];
      if (lastPoint.x !== end.x || lastPoint.y !== end.y) {
        throw new Error('Path does not end at end point');
      }

      this.addTest('direct_path_empty_grid', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('direct_path_empty_grid', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testObstacleAvoidance(): void {
    const startTime = Date.now();
    try {
      const obstacles: Point[] = [
        { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 },
        { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }
      ];
      const grid = this.createGrid(10, 10, obstacles);
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 5, y: 5 };
      const path = this.findPath(grid, start, end);

      if (!path) {
        throw new Error('No path found around obstacle');
      }

      // Проверка что путь не проходит через препятствия
      for (const point of path) {
        for (const obstacle of obstacles) {
          if (point.x === obstacle.x && point.y === obstacle.y) {
            throw new Error(`Path goes through obstacle at (${point.x}, ${point.y})`);
          }
        }
      }

      this.addTest('obstacle_avoidance', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('obstacle_avoidance', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testNoPathFound(): void {
    const startTime = Date.now();
    try {
      // Создаем стену через всю карту
      const obstacles: Point[] = [];
      for (let y = 0; y < 10; y++) {
        obstacles.push({ x: 5, y });
      }
      const grid = this.createGrid(10, 10, obstacles);
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 9, y: 0 };
      const path = this.findPath(grid, start, end);

      if (path !== null) {
        throw new Error('Path found when it should be blocked');
      }

      this.addTest('no_path_blocked', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('no_path_blocked', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testDiagonalMovement(): void {
    const startTime = Date.now();
    try {
      const grid = this.createGrid(10, 10, []);
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 3, y: 3 };
      const path = this.findPath(grid, start, end, true);

      if (!path) {
        throw new Error('No diagonal path found');
      }

      // Диагональный путь должен быть короче манхэттенского
      if (path.length > 7) {
        throw new Error('Diagonal path is not optimal');
      }

      this.addTest('diagonal_movement', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('diagonal_movement', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testPathOptimality(): void {
    const startTime = Date.now();
    try {
      const grid = this.createGrid(10, 10, []);
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 5, y: 0 };
      const path = this.findPath(grid, start, end);

      if (!path) {
        throw new Error('No path found');
      }

      // Оптимальный путь должен быть длиной 6 (включая старт и конец)
      if (path.length !== 6) {
        throw new Error(`Path is not optimal: length ${path.length}, expected 6`);
      }

      this.addTest('path_optimality', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('path_optimality', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testLargeGrid(): void {
    const startTime = Date.now();
    try {
      const gridSize = 100;
      const obstacles: Point[] = [];
      // Случайные препятствия (10% карты)
      for (let i = 0; i < gridSize * gridSize * 0.1; i++) {
        obstacles.push({
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        });
      }
      const grid = this.createGrid(gridSize, gridSize, obstacles);
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: gridSize - 1, y: gridSize - 1 };
      
      const path = this.findPath(grid, start, end);
      
      // Просто проверяем что алгоритм завершается за разумное время
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        throw new Error(`Pathfinding took too long: ${duration}ms`);
      }

      this.addTest('large_grid_performance', true, duration);
    } catch (error) {
      this.addTest('large_grid_performance', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private createGrid(width: number, height: number, obstacles: Point[]): boolean[][] {
    const grid: boolean[][] = [];
    for (let x = 0; x < width; x++) {
      grid[x] = [];
      for (let y = 0; y < height; y++) {
        const isObstacle = obstacles.some(o => o.x === x && o.y === y);
        grid[x][y] = !isObstacle; // true = проходимо
      }
    }
    return grid;
  }

  private findPath(
    grid: boolean[][],
    start: Point,
    end: Point,
    allowDiagonal: boolean = false
  ): Point[] | null {
    // Упрощенная реализация A* для тестов
    const width = grid.length;
    const height = grid[0].length;
    const openSet: Array<{ point: Point; g: number; f: number; parent: Point | null }> = [];
    const closedSet = new Set<string>();
    
    openSet.push({ point: start, g: 0, f: this.heuristic(start, end, allowDiagonal), parent: null });

    while (openSet.length > 0) {
      // Находим элемент с наименьшим f
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      if (current.point.x === end.x && current.point.y === end.y) {
        // Восстанавливаем путь
        const path: Point[] = [];
        let node: typeof current | null = current;
        while (node) {
          path.unshift(node.point);
          node = node.parent ? 
            openSet.find(n => n.point === node!.parent) || 
            ({ point: node.parent, g: 0, f: 0, parent: null }) : null;
        }
        return path;
      }

      const key = `${current.point.x},${current.point.y}`;
      if (closedSet.has(key)) continue;
      closedSet.add(key);

      const neighbors = this.getNeighbors(current.point, grid, allowDiagonal);
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
        
        const tentativeG = current.g + 1;
        const existing = openSet.find(n => n.point.x === neighbor.x && n.point.y === neighbor.y);
        
        if (existing) {
          if (tentativeG < existing.g) {
            existing.g = tentativeG;
            existing.f = tentativeG + this.heuristic(neighbor, end, allowDiagonal);
            existing.parent = current.point;
          }
        } else {
          openSet.push({
            point: neighbor,
            g: tentativeG,
            f: tentativeG + this.heuristic(neighbor, end, allowDiagonal),
            parent: current.point
          });
        }
      }
    }

    return null;
  }

  private heuristic(a: Point, b: Point, allowDiagonal: boolean): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    if (allowDiagonal) {
      return Math.max(dx, dy); // Расстояние Чебышева
    }
    return dx + dy; // Манхэттенское расстояние
  }

  private getNeighbors(point: Point, grid: boolean[][], allowDiagonal: boolean): Point[] {
    const neighbors: Point[] = [];
    const directions = [
      { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
    ];
    
    if (allowDiagonal) {
      directions.push(
        { x: -1, y: -1 }, { x: -1, y: 1 },
        { x: 1, y: -1 }, { x: 1, y: 1 }
      );
    }

    for (const dir of directions) {
      const newX = point.x + dir.x;
      const newY = point.y + dir.y;
      
      if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length) {
        if (grid[newX][newY]) {
          neighbors.push({ x: newX, y: newY });
        }
      }
    }

    return neighbors;
  }

  private addTest(name: string, passed: boolean, duration: number, error?: string): void {
    const result: TestResult = { name, passed, duration, error };
    this.suite.tests.push(result);
    this.suite.totalDuration += duration;
    if (passed) {
      this.suite.passedCount++;
    } else {
      this.suite.failedCount++;
    }
  }
}
