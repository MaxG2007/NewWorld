/**
 * Этап 12: FAMILY + GENEALOGY
 * Тесты для системы семей и генеалогии
 */

import { describe, it, expect } from 'vitest';
import { Family } from '../entities/family/Family';
import { GenealogyTree } from '../entities/family/GenealogyTree';
import { FamilyGenerator } from '../world/generation/FamilyGenerator';

describe('Family System', () => {
  it('should create a family with all required fields', () => {
    const family = new Family({
      id: 'test_family_1',
      name: 'Smith',
      cultureId: 'culture_human',
      socialClass: 'craftsman',
      profession: 'Blacksmith',
    });

    expect(family.id).toBe('test_family_1');
    expect(family.name).toBe('Smith');
    expect(family.socialClass).toBe('craftsman');
    expect(family.memberIds).toEqual([]);
    expect(family.assets).toEqual([]);
    expect(family.secrets).toEqual([]);
    expect(family.history).toEqual([]);
  });

  it('should add and remove members', () => {
    const family = new Family({
      id: 'test_family_2',
      name: 'Johnson',
      cultureId: 'culture_human',
    });

    family.addMember('npc_1');
    family.addMember('npc_2');
    
    expect(family.memberIds).toHaveLength(2);
    expect(family.memberIds).toContain('npc_1');

    family.removeMember('npc_1');
    expect(family.memberIds).toHaveLength(1);
    expect(family.memberIds).not.toContain('npc_1');
  });

  it('should calculate total wealth correctly', () => {
    const family = new Family({
      id: 'test_family_3',
      name: 'Williams',
      cultureId: 'culture_human',
    });

    family.addAsset({ type: 'money', name: 'gold', value: 1000 });
    family.addAsset({ type: 'land', name: 'farm', value: 5000 });
    family.addDebt({ creditor: 'bank', amount: 2000, interestRate: 0.05 });

    expect(family.getTotalWealth()).toBe(4000);
  });

  it('should serialize and deserialize correctly', () => {
    const original = new Family({
      id: 'test_family_4',
      name: 'Brown',
      cultureId: 'culture_human',
      socialClass: 'merchant',
    });

    original.addMember('npc_123');
    original.addAsset({ type: 'building', name: 'shop', value: 3000 });

    const serialized = original.serialize();
    const deserialized = Family.deserialize(serialized);

    expect(deserialized.id).toBe(original.id);
    expect(deserialized.name).toBe(original.name);
    expect(deserialized.memberIds).toEqual(original.memberIds);
    expect(deserialized.assets).toHaveLength(1);
  });

  it('should mark family as extinct when all members are removed', () => {
    const family = new Family({
      id: 'test_family_5',
      name: 'Davis',
      cultureId: 'culture_human',
    });

    family.addMember('npc_1');
    expect(family.isExtinct).toBe(false);

    family.removeMember('npc_1');
    expect(family.isExtinct).toBe(true);
  });
});

describe('Genealogy Tree', () => {
  it('should build family tree relationships', () => {
    const tree = new GenealogyTree();
    
    const grandparent = new Family({
      id: 'family_grand',
      name: 'Grand',
      cultureId: 'culture_human',
    });
    
    const parent = new Family({
      id: 'family_parent',
      name: 'Parent',
      cultureId: 'culture_human',
      parentFamilyId: 'family_grand',
    });
    
    const child = new Family({
      id: 'family_child',
      name: 'Child',
      cultureId: 'culture_human',
      parentFamilyId: 'family_parent',
    });

    tree.addFamily(grandparent);
    tree.addFamily(parent);
    tree.addFamily(child);

    const ancestors = tree.getAncestors('family_child', 10);
    expect(ancestors).toContain('family_parent');
    expect(ancestors).toContain('family_grand');

    const descendants = tree.getDescendants('family_grand', 10);
    expect(descendants).toContain('family_parent');
    expect(descendants).toContain('family_child');
  });

  it('should find common ancestor', () => {
    const tree = new GenealogyTree();
    
    const ancestor = new Family({
      id: 'family_ancestor',
      name: 'Ancestor',
      cultureId: 'culture_human',
    });
    
    const branch1 = new Family({
      id: 'family_branch1',
      name: 'Branch1',
      cultureId: 'culture_human',
      parentFamilyId: 'family_ancestor',
    });
    
    const branch2 = new Family({
      id: 'family_branch2',
      name: 'Branch2',
      cultureId: 'culture_human',
      parentFamilyId: 'family_ancestor',
    });

    tree.addFamily(ancestor);
    tree.addFamily(branch1);
    tree.addFamily(branch2);

    const commonAncestor = tree.findCommonAncestor('family_branch1', 'family_branch2');
    expect(commonAncestor).toBe('family_ancestor');
  });

  it('should calculate relationship degree', () => {
    const tree = new GenealogyTree();
    
    const root = new Family({
      id: 'family_root',
      name: 'Root',
      cultureId: 'culture_human',
    });
    
    const child1 = new Family({
      id: 'family_child1',
      name: 'Child1',
      cultureId: 'culture_human',
      parentFamilyId: 'family_root',
    });
    
    const child2 = new Family({
      id: 'family_child2',
      name: 'Child2',
      cultureId: 'culture_human',
      parentFamilyId: 'family_root',
    });

    tree.addFamily(root);
    tree.addFamily(child1);
    tree.addFamily(child2);

    const degree = tree.getRelationshipDegree('family_child1', 'family_child2');
    expect(degree).toBeGreaterThan(0);
  });
});

describe('Family Generator', () => {
  it('should generate thousands of families', () => {
    const generator = new FamilyGenerator({
      baseFamilySeed: 'test_seed_123',
      cultureId: 'culture_human',
      settlementId: 'settlement_1',
      socialClassDistribution: {
        nobility: 0.05,
        merchant: 0.15,
        craftsman: 0.25,
        peasant: 0.50,
        outcast: 0.05,
      },
    });

    const families = generator.generateFamilies(1000);
    
    expect(families).toHaveLength(1000);
    
    // Check variety of social classes
    const socialClasses = families.map((f: any) => f.socialClass);
    expect(socialClasses).toContain('nobility');
    expect(socialClasses).toContain('merchant');
    expect(socialClasses).toContain('craftsman');
    expect(socialClasses).toContain('peasant');
  });

  it('should generate families with assets and debts', () => {
    const generator = new FamilyGenerator({
      baseFamilySeed: 'test_seed_456',
      cultureId: 'culture_human',
      settlementId: 'settlement_2',
      socialClassDistribution: {
        nobility: 0.2,
        merchant: 0.3,
        craftsman: 0.3,
        peasant: 0.15,
        outcast: 0.05,
      },
    });

    const families = generator.generateFamilies(100);
    
    // Most families should have assets
    const familiesWithAssets = families.filter((f: any) => f.assets.length > 0);
    expect(familiesWithAssets.length).toBeGreaterThan(50);

    // Some should have debts
    const familiesWithDebts = families.filter((f: any) => f.debts.length > 0);
    expect(familiesWithDebts.length).toBeGreaterThan(0);
  });

  it('should generate family history events', () => {
    const generator = new FamilyGenerator({
      baseFamilySeed: 'test_seed_789',
      cultureId: 'culture_human',
      settlementId: 'settlement_3',
      socialClassDistribution: {
        nobility: 0.1,
        merchant: 0.2,
        craftsman: 0.3,
        peasant: 0.35,
        outcast: 0.05,
      },
    });

    const families = generator.generateFamilies(50);
    
    // Most families should have history
    const familiesWithHistory = families.filter((f: any) => f.history.length > 0);
    expect(familiesWithHistory.length).toBeGreaterThan(25);
  });

  it('should create dynasty relationships for nobility', () => {
    const generator = new FamilyGenerator({
      baseFamilySeed: 'test_seed_dynasty',
      cultureId: 'culture_human',
      settlementId: 'settlement_4',
      socialClassDistribution: {
        nobility: 0.3,
        merchant: 0.2,
        craftsman: 0.2,
        peasant: 0.25,
        outcast: 0.05,
      },
    });

    const families = generator.generateFamilies(200);
    const nobility = families.filter((f: any) => f.socialClass === 'nobility');
    
    expect(nobility.length).toBeGreaterThan(10);
    
    // Some nobility should have parent families
    const nobilityWithParents = nobility.filter(f => f.parentFamilyId);
    expect(nobilityWithParents.length).toBeGreaterThan(0);
  });

  it('should be deterministic with same seed', () => {
    const generator1 = new FamilyGenerator({
      baseFamilySeed: 'deterministic_seed',
      cultureId: 'culture_human',
      settlementId: 'settlement_5',
      socialClassDistribution: {
        nobility: 0.1,
        merchant: 0.2,
        craftsman: 0.3,
        peasant: 0.35,
        outcast: 0.05,
      },
    });

    const generator2 = new FamilyGenerator({
      baseFamilySeed: 'deterministic_seed',
      cultureId: 'culture_human',
      settlementId: 'settlement_5',
      socialClassDistribution: {
        nobility: 0.1,
        merchant: 0.2,
        craftsman: 0.3,
        peasant: 0.35,
        outcast: 0.05,
      },
    });

    const families1 = generator1.generateFamilies(100);
    const families2 = generator2.generateFamilies(100);

    expect(families1.length).toBe(families2.length);
    
    for (let i = 0; i < 10; i++) {
      expect(families1[i].name).toBe(families2[i].name);
      expect(families1[i].socialClass).toBe(families2[i].socialClass);
      expect(families1[i].assets.length).toBe(families2[i].assets.length);
    }
  });
});
