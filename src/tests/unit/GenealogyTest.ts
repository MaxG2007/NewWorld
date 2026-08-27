/**
 * Unit тесты для генеалогии (genealogy)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

interface Person {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  deathYear?: number;
  parents: string[];
  children: string[];
  spouse?: string;
}

export class GenealogyTest {
  private suite: TestSuite = {
    name: 'Genealogy System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  private people: Map<string, Person> = new Map();

  runAll(): TestSuite {
    this.people.clear();
    this.testParentChildRelationship();
    this.testIncestPrevention();
    this.testInheritance();
    this.testFamilyTreeDepth();
    this.testGenerations();
    return this.suite;
  }

  private testParentChildRelationship(): void {
    const startTime = Date.now();
    try {
      this.people.clear();
      
      const father: Person = {
        id: 'p1', name: 'Father', gender: 'male',
        birthYear: 1000, parents: [], children: ['p3']
      };
      const mother: Person = {
        id: 'p2', name: 'Mother', gender: 'female',
        birthYear: 1002, parents: [], children: ['p3']
      };
      const child: Person = {
        id: 'p3', name: 'Child', gender: 'male',
        birthYear: 1025, parents: ['p1', 'p2'], children: []
      };

      this.people.set(father.id, father);
      this.people.set(mother.id, mother);
      this.people.set(child.id, child);

      // Проверка что родители указаны корректно
      if (child.parents.length !== 2) {
        throw new Error('Child should have 2 parents');
      }

      // Проверка что дети указаны у родителей
      if (father.children.length !== 1 || mother.children.length !== 1) {
        throw new Error('Parents should have 1 child each');
      }

      this.addTest('parent_child_relationship', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('parent_child_relationship', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testIncestPrevention(): void {
    const startTime = Date.now();
    try {
      this.people.clear();

      // Создаем семью
      const parent1: Person = {
        id: 'p1', name: 'Parent1', gender: 'male',
        birthYear: 1000, parents: [], children: ['p2', 'p3']
      };
      const parent2: Person = {
        id: 'p2', name: 'Parent2', gender: 'female',
        birthYear: 1002, parents: [], children: []
      };
      const sibling1: Person = {
        id: 'p3', name: 'Sibling1', gender: 'male',
        birthYear: 1025, parents: ['p1', 'p2'], children: []
      };
      const sibling2: Person = {
        id: 'p4', name: 'Sibling2', gender: 'female',
        birthYear: 1027, parents: ['p1', 'p2'], children: []
      };

      this.people.set(parent1.id, parent1);
      this.people.set(parent2.id, parent2);
      this.people.set(sibling1.id, sibling1);
      this.people.set(sibling2.id, sibling2);

      // Проверка что брак между siblings запрещен
      const hasCommonParent = this.hasCommonAncestor(sibling1, sibling2, 2);
      if (!hasCommonParent) {
        throw new Error('Should detect common parents between siblings');
      }

      this.addTest('incest_prevention', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('incest_prevention', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testInheritance(): void {
    const startTime = Date.now();
    try {
      this.people.clear();

      const grandfather: Person = {
        id: 'p1', name: 'Grandfather', gender: 'male',
        birthYear: 980, deathYear: 1050, parents: [], children: ['p2']
      };
      const father: Person = {
        id: 'p2', name: 'Father', gender: 'male',
        birthYear: 1000, deathYear: 1060, parents: ['p1'], children: ['p3']
      };
      const son: Person = {
        id: 'p3', name: 'Son', gender: 'male',
        birthYear: 1025, parents: ['p2'], children: []
      };

      this.people.set(grandfather.id, grandfather);
      this.people.set(father.id, father);
      this.people.set(son.id, son);

      // Наследник после смерти отца - сын
      const heir = this.findHeir(father);
      if (heir?.id !== 'p3') {
        throw new Error('Son should be the heir');
      }

      this.addTest('inheritance_line', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('inheritance_line', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testFamilyTreeDepth(): void {
    const startTime = Date.now();
    try {
      this.people.clear();

      // Создаем дерево глубиной 5 поколений
      const generations: Person[] = [];
      for (let i = 0; i < 5; i++) {
        const person: Person = {
          id: `p${i}`,
          name: `Gen${i}`,
          gender: i % 2 === 0 ? 'male' : 'female',
          birthYear: 1000 + i * 25,
          parents: i > 0 ? [`p${i - 1}`] : [],
          children: i < 4 ? [`p${i + 1}`] : []
        };
        generations.push(person);
        this.people.set(person.id, person);
      }

      const depth = this.calculateTreeDepth(generations[4]);
      if (depth < 5) {
        throw new Error(`Expected tree depth >= 5, got ${depth}`);
      }

      this.addTest('family_tree_depth', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('family_tree_depth', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testGenerations(): void {
    const startTime = Date.now();
    try {
      this.people.clear();

      const grandparent: Person = {
        id: 'p1', name: 'Grandparent', gender: 'male',
        birthYear: 1000, parents: [], children: ['p2']
      };
      const parent: Person = {
        id: 'p2', name: 'Parent', gender: 'male',
        birthYear: 1025, parents: ['p1'], children: ['p3']
      };
      const child: Person = {
        id: 'p3', name: 'Child', gender: 'male',
        birthYear: 1050, parents: ['p2'], children: []
      };

      this.people.set(grandparent.id, grandparent);
      this.people.set(parent.id, parent);
      this.people.set(child.id, child);

      // Проверка разницы поколений
      const genDiff1 = this.getGenerationDifference(grandparent, child);
      const genDiff2 = this.getGenerationDifference(parent, child);

      if (genDiff1 !== 2) {
        throw new Error(`Expected 2 generations difference, got ${genDiff1}`);
      }
      if (genDiff2 !== 1) {
        throw new Error(`Expected 1 generation difference, got ${genDiff2}`);
      }

      this.addTest('generations_difference', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('generations_difference', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private hasCommonAncestor(p1: Person, p2: Person, maxDepth: number): boolean {
    const ancestors1 = this.getAncestors(p1, maxDepth);
    const ancestors2 = this.getAncestors(p2, maxDepth);
    return ancestors1.some(a => ancestors2.includes(a));
  }

  private getAncestors(person: Person, maxDepth: number): string[] {
    const ancestors: string[] = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: person.id, depth: 0 }];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= maxDepth) continue;
      
      const p = this.people.get(current.id);
      if (!p) continue;
      
      for (const parentId of p.parents) {
        if (!ancestors.includes(parentId)) {
          ancestors.push(parentId);
          queue.push({ id: parentId, depth: current.depth + 1 });
        }
      }
    }
    
    return ancestors;
  }

  private findHeir(person: Person): Person | null {
    if (person.children.length === 0) return null;
    // Первый ребенок (упрощенно)
    return this.people.get(person.children[0]) || null;
  }

  private calculateTreeDepth(person: Person): number {
    let maxDepth = 1;
    const queue: Array<{ id: string; depth: number }> = [{ id: person.id, depth: 1 }];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const p = this.people.get(current.id);
      if (!p) continue;
      
      for (const parentId of p.parents) {
        queue.push({ id: parentId, depth: current.depth + 1 });
        maxDepth = Math.max(maxDepth, current.depth + 1);
      }
    }
    
    return maxDepth;
  }

  private getGenerationDifference(p1: Person, p2: Person): number {
    const depth1 = this.calculateTreeDepth(p1);
    const depth2 = this.calculateTreeDepth(p2);
    return Math.abs(depth1 - depth2);
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
