/**
 * Этап 12: FAMILY + GENEALOGY
 * Система генеалогического древа
 */

import { Family } from './Family';

interface GenealogyNode {
  familyId: string;
  parents: string[]; // Family IDs
  children: string[]; // Family IDs
  depth: number;
}

export class GenealogyTree {
  private families: Map<string, Family> = new Map();
  private nodes: Map<string, GenealogyNode> = new Map();

  addFamily(family: Family): void {
    this.families.set(family.id, family);
    
    if (!this.nodes.has(family.id)) {
      this.nodes.set(family.id, {
        familyId: family.id,
        parents: [],
        children: [],
        depth: 0,
      });
    }

    // Link to parent family
    if (family.parentFamilyId) {
      const parentNode = this.nodes.get(family.parentFamilyId) || {
        familyId: family.parentFamilyId,
        parents: [],
        children: [],
        depth: 0,
      };
      
      if (!parentNode.children.includes(family.id)) {
        parentNode.children.push(family.id);
      }
      
      this.nodes.set(family.parentFamilyId, parentNode);
      
      const currentNode = this.nodes.get(family.id)!;
      if (!currentNode.parents.includes(family.parentFamilyId)) {
        currentNode.parents.push(family.parentFamilyId);
      }
      this.nodes.set(family.id, currentNode);
    }
  }

  getFamily(familyId: string): Family | undefined {
    return this.families.get(familyId);
  }

  getParentFamilies(familyId: string): string[] {
    const node = this.nodes.get(familyId);
    return node ? node.parents : [];
  }

  getChildFamilies(familyId: string): string[] {
    const node = this.nodes.get(familyId);
    return node ? node.children : [];
  }

  getAncestors(familyId: string, maxDepth: number = 10): string[] {
    const ancestors: string[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: familyId, depth: 0 }];

    while (queue.length > 0 && ancestors.length < maxDepth) {
      const current = queue.shift()!;
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const node = this.nodes.get(current.id);
      if (!node) continue;

      for (const parentId of node.parents) {
        if (!visited.has(parentId)) {
          ancestors.push(parentId);
          if (current.depth + 1 < maxDepth) {
            queue.push({ id: parentId, depth: current.depth + 1 });
          }
        }
      }
    }

    return ancestors;
  }

  getDescendants(familyId: string, maxDepth: number = 10): string[] {
    const descendants: string[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: familyId, depth: 0 }];

    while (queue.length > 0 && descendants.length < maxDepth) {
      const current = queue.shift()!;
      
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const node = this.nodes.get(current.id);
      if (!node) continue;

      for (const childId of node.children) {
        if (!visited.has(childId)) {
          descendants.push(childId);
          if (current.depth + 1 < maxDepth) {
            queue.push({ id: childId, depth: current.depth + 1 });
          }
        }
      }
    }

    return descendants;
  }

  findCommonAncestor(familyId1: string, familyId2: string): string | null {
    const ancestors1 = new Set(this.getAncestors(familyId1, 20));
    const ancestors2 = this.getAncestors(familyId2, 20);

    for (const ancestor of ancestors2) {
      if (ancestors1.has(ancestor)) {
        return ancestor;
      }
    }

    return null;
  }

  getRelationshipDegree(familyId1: string, familyId2: string): number {
    const commonAncestor = this.findCommonAncestor(familyId1, familyId2);
    if (!commonAncestor) return -1; // No relation

    const ancestors1 = this.getAncestors(familyId1, 20);
    const ancestors2 = this.getAncestors(familyId2, 20);

    const depth1 = ancestors1.indexOf(commonAncestor) + 1;
    const depth2 = ancestors2.indexOf(commonAncestor) + 1;

    return depth1 + depth2;
  }

  getAllFamilies(): Family[] {
    return Array.from(this.families.values());
  }

  getDynastyHead(familyId: string): string | null {
    const ancestors = this.getAncestors(familyId, 100);
    if (ancestors.length === 0) return familyId;
    
    // Find the oldest ancestor
    let head = ancestors[ancestors.length - 1];
    let hasParent = true;
    
    while (hasParent) {
      const node = this.nodes.get(head);
      if (!node || node.parents.length === 0) {
        hasParent = false;
      } else {
        head = node.parents[0];
      }
    }
    
    return head;
  }

  serialize(): any {
    return {
      families: Array.from(this.families.entries()).map(([id, family]) => ({
        id,
        data: family.serialize(),
      })),
      nodes: Array.from(this.nodes.entries()),
    };
  }

  static deserialize(data: any): GenealogyTree {
    const tree = new GenealogyTree();
    
    for (const { id, data: familyData } of data.families) {
      const family = Family.deserialize(familyData);
      tree.families.set(id, family);
    }
    
    for (const [id, node] of data.nodes) {
      tree.nodes.set(id, node);
    }
    
    return tree;
  }
}
