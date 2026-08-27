/**
 * Этап 31 — SOCIAL WORLD
 * 
 * Реализация социальных связей, отношений и организаций
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Типы отношений
// ============================================================================

export type RelationshipType = 
  | 'family'
  | 'romantic'
  | 'friendship'
  | 'professional'
  | 'rivalry'
  | 'business'
  | 'political'
  | 'religious'
  | 'criminal';

export type RelationshipSubtype =
  // Family
  | 'parent'
  | 'child'
  | 'sibling'
  | 'spouse'
  | 'ex_spouse'
  | 'grandparent'
  | 'grandchild'
  | 'aunt_uncle'
  | 'niece_nephew'
  | 'cousin'
  // Romantic
  | 'crush'
  | 'dating'
  | 'engaged'
  | 'married'
  | 'divorced'
  | 'lover'
  | 'ex_lover'
  // Friendship
  | 'acquaintance'
  | 'friend'
  | 'close_friend'
  | 'best_friend'
  | 'rival'
  | 'enemy'
  // Professional
  | 'colleague'
  | 'mentor'
  | 'apprentice'
  | 'master'
  | 'guild_member'
  | 'business_partner'
  // Political
  | 'ally'
  | 'supporter'
  | 'opponent'
  | 'liege'
  | 'vassal'
  // Religious
  | 'co_believer'
  | 'clergy'
  | 'follower'
  // Criminal
  | 'accomplice'
  | 'gang_member'
  | 'informant';

export interface RelationshipEvent {
  id: string;
  type: string;
  date: number;
  description: string;
  impact: number; // Изменение веса отношения
  participants: string[];
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  subtype: RelationshipSubtype;
  
  // Вес отношения от -100 (ненависть) до +100 (любовь/преданность)
  weight: number;
  
  // Уровень доверия (0-100)
  trust: number;
  
  // Участники отношения
  personA: string; // ID персонажа
  personB: string; // ID персонажа
  
  // История событий
  history: RelationshipEvent[];
  
  // Дата начала отношения
  startDate: number;
  
  // Дата окончания (если применимо)
  endDate?: number;
  
  // Статус (активно, завершено, приостановлено)
  status: 'active' | 'ended' | 'suspended';
  
  // Публичность (скрыто, известно близким, публично)
  visibility: 'hidden' | 'private' | 'public';
  
  // Дополнительные данные
  metadata: Record<string, any>;
}

// ============================================================================
// Социальные группы
// ============================================================================

export type GroupType = 
  | 'friend_group'
  | 'guild'
  | 'criminal_gang'
  | 'religious_order'
  | 'political_faction'
  | 'family'
  | 'military_unit'
  | 'trade_company'
  | 'academic_circle'
  | 'secret_society';

export interface GroupMember {
  id: string;
  characterId: string;
  rank: string;
  joinDate: number;
  leaveDate?: number;
  status: 'active' | 'inactive' | 'expelled' | 'deceased';
  contributions: number;
  reputation: number;
}

export interface GroupGoal {
  id: string;
  description: string;
  type: 'short_term' | 'long_term' | 'eternal';
  progress: number; // 0-100
  deadline?: number;
  completed: boolean;
  completedBy?: string;
  completedDate?: number;
}

export interface SocialGroup {
  id: string;
  name: string;
  type: GroupType;
  
  // Описание и цели
  description: string;
  goals: GroupGoal[];
  
  // Члены группы
  members: GroupMember[];
  
  // Лидерство
  leaderId?: string;
  council: string[]; // IDs совета
  
  // Ресурсы и влияние
  treasury: number;
  influence: number; // 0-100
  territory: string[]; // IDs территорий
  
  // Отношения с другими группами
  allies: string[]; // Group IDs
  enemies: string[]; // Group IDs
  neutral: string[]; // Group IDs
  
  // Правила и традиции
  rules: string[];
  traditions: string[];
  requirements: {
    entryFee?: number;
    minimumReputation?: number;
    requiredSkills?: string[];
    forbiddenTraits?: string[];
  };
  
  // Статус
  foundedDate: number;
  founderId: string;
  status: 'active' | 'disbanded' | 'underground' | 'war';
  
  // Репутация в мире
  publicReputation: number; // -100 до +100
  
  // Секреты группы
  secrets: string[];
  
  metadata: Record<string, any>;
}

// ============================================================================
// Специфические типы групп
// ============================================================================

export interface GuildData extends SocialGroup {
  type: 'guild';
  profession: string;
  tiers: string[]; // Уровни мастерства
  workshops: string[]; // IDs мастерских
  tradeSecrets: string[];
  qualityStandards: string[];
}

export interface CriminalGangData extends SocialGroup {
  type: 'criminal_gang';
  criminalActivities: string[];
  territory: string[]; // Контролируемые районы
  hideouts: string[]; // IDs убежищ
  contacts: {
    corruptOfficials: string[];
    informants: string[];
    fences: string[];
  };
  heatLevel: number; // Внимание властей 0-100
}

export interface PoliticalFactionData extends SocialGroup {
  type: 'political_faction';
  ideology: string;
  policies: string[];
  supportedLaws: string[];
  opposedLaws: string[];
  politicalPower: number; // 0-100
  seatsInCouncil: number;
  propagandaMethods: string[];
  scandals: Array<{
    description: string;
    date: number;
    impact: number;
    covered: boolean;
  }>;
}

export interface ReligiousOrderData extends SocialGroup {
  type: 'religious_order';
  deityId: string;
  vows: string[];
  rituals: string[];
  sacredTexts: string[];
  pilgrimageSites: string[];
  miracleCount: number;
  heresies: string[];
}

// ============================================================================
// Социальный граф
// ============================================================================

export interface SocialNode {
  id: string;
  type: 'character' | 'group';
  name: string;
}

export interface SocialEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: RelationshipType | 'membership' | 'leadership' | 'alliance' | 'conflict';
  weight: number;
  createdAt: number;
  updatedAt: number;
}

export class SocialGraph {
  private nodes: Map<string, SocialNode> = new Map();
  private edges: Map<string, SocialEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  
  // Добавление узла
  addNode(node: SocialNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
  }
  
  // Добавление ребра
  addEdge(edge: SocialEdge): void {
    this.edges.set(edge.id, edge);
    
    // Обновляем список смежности
    if (!this.adjacencyList.has(edge.source)) {
      this.adjacencyList.set(edge.source, new Set());
    }
    if (!this.adjacencyList.has(edge.target)) {
      this.adjacencyList.set(edge.target, new Set());
    }
    
    this.adjacencyList.get(edge.source)!.add(edge.target);
    this.adjacencyList.get(edge.target)!.add(edge.source);
  }
  
  // Получение всех связей узла
  getConnections(nodeId: string): SocialEdge[] {
    const connections: SocialEdge[] = [];
    const neighbors = this.adjacencyList.get(nodeId) || new Set();
    
    for (const neighborId of neighbors) {
      const edge = Array.from(this.edges.values()).find(
        e => (e.source === nodeId && e.target === neighborId) ||
             (e.source === neighborId && e.target === nodeId)
      );
      if (edge) {
        connections.push(edge);
      }
    }
    
    return connections;
  }
  
  // Получение пути между двумя узлами
  findPath(startId: string, endId: string): string[] | null {
    const visited = new Set<string>();
    const queue: Array<{ node: string; path: string[] }> = [{ node: startId, path: [startId] }];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      
      if (node === endId) {
        return path;
      }
      
      if (visited.has(node)) continue;
      visited.add(node);
      
      const neighbors = this.adjacencyList.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      }
    }
    
    return null;
  }
  
  // Вычисление центральности узла
  calculateCentrality(nodeId: string): number {
    const connections = this.getConnections(nodeId);
    return connections.length;
  }
  
  // Поиск кластеров (сообществ)
  findClusters(): SocialNode[][] {
    const visited = new Set<string>();
    const clusters: SocialNode[][] = [];
    
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const cluster: SocialNode[] = [];
        const queue = [nodeId];
        
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;
          
          visited.add(current);
          const node = this.nodes.get(current);
          if (node) cluster.push(node);
          
          const neighbors = this.adjacencyList.get(current) || new Set();
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          }
        }
        
        if (cluster.length > 0) {
          clusters.push(cluster);
        }
      }
    }
    
    return clusters;
  }
  
  // Удаление узла
  removeNode(nodeId: string): void {
    // Удаляем все связанные рёбра
    const edgesToRemove = Array.from(this.edges.values()).filter(
      e => e.source === nodeId || e.target === nodeId
    );
    
    for (const edge of edgesToRemove) {
      this.edges.delete(edge.id);
    }
    
    // Обновляем список смежности
    const neighbors = this.adjacencyList.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      this.adjacencyList.get(neighbor)?.delete(nodeId);
    }
    
    this.adjacencyList.delete(nodeId);
    this.nodes.delete(nodeId);
  }
  
  // Обновление веса ребра
  updateEdgeWeight(edgeId: string, newWeight: number): void {
    const edge = this.edges.get(edgeId);
    if (edge) {
      edge.weight = newWeight;
      edge.updatedAt = Date.now();
      this.edges.set(edgeId, edge);
    }
  }
  
  // Экспорт графа
  export(): { nodes: SocialNode[]; edges: SocialEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }
  
  // Импорт графа
  import(data: { nodes: SocialNode[]; edges: SocialEdge[] }): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    
    for (const node of data.nodes) {
      this.addNode(node);
    }
    
    for (const edge of data.edges) {
      this.addEdge(edge);
    }
  }
}

// ============================================================================
// Менеджер социальных отношений
// ============================================================================

export class SocialWorldManager {
  private relationships: Map<string, Relationship> = new Map();
  private groups: Map<string, SocialGroup> = new Map();
  private graph: SocialGraph = new SocialGraph();
  
  // Создание отношения между двумя персонажами
  createRelationship(
    personA: string,
    personB: string,
    type: RelationshipType,
    subtype: RelationshipSubtype,
    initialWeight: number = 0,
    initialTrust: number = 50
  ): Relationship {
    const relationship: Relationship = {
      id: uuidv4(),
      type,
      subtype,
      weight: initialWeight,
      trust: initialTrust,
      personA,
      personB,
      history: [],
      startDate: Date.now(),
      status: 'active',
      visibility: 'private',
      metadata: {}
    };
    
    this.relationships.set(relationship.id, relationship);
    
    // Добавляем в граф
    this.addToGraph(relationship);
    
    return relationship;
  }
  
  // Добавление события в историю отношений
  addRelationshipEvent(
    relationshipId: string,
    eventType: string,
    description: string,
    impact: number,
    participants: string[]
  ): void {
    const relationship = this.relationships.get(relationshipId);
    if (!relationship) return;
    
    const event: RelationshipEvent = {
      id: uuidv4(),
      type: eventType,
      date: Date.now(),
      description,
      impact,
      participants
    };
    
    relationship.history.push(event);
    relationship.weight = Math.max(-100, Math.min(100, relationship.weight + impact));
    relationship.trust = Math.max(0, Math.min(100, relationship.trust + Math.floor(impact / 2)));
    
    // Обновляем в графе
    this.updateGraphEdge(relationship);
  }
  
  // Завершение отношения
  endRelationship(relationshipId: string, reason?: string): void {
    const relationship = this.relationships.get(relationshipId);
    if (!relationship) return;
    
    relationship.status = 'ended';
    relationship.endDate = Date.now();
    
    if (reason) {
      this.addRelationshipEvent(relationshipId, 'ended', reason, 0, []);
    }
  }
  
  // Создание социальной группы
  createGroup(
    name: string,
    type: GroupType,
    founderId: string,
    description: string = ''
  ): SocialGroup {
    const group: SocialGroup = {
      id: uuidv4(),
      name,
      type,
      description,
      goals: [],
      members: [{
        id: uuidv4(),
        characterId: founderId,
        rank: 'founder',
        joinDate: Date.now(),
        status: 'active',
        contributions: 0,
        reputation: 100
      }],
      leaderId: founderId,
      council: [founderId],
      treasury: 0,
      influence: 10,
      territory: [],
      allies: [],
      enemies: [],
      neutral: [],
      rules: [],
      traditions: [],
      requirements: {},
      foundedDate: Date.now(),
      founderId,
      status: 'active',
      publicReputation: 0,
      secrets: [],
      metadata: {}
    };
    
    this.groups.set(group.id, group);
    
    // Добавляем лидера в граф как узел группы
    this.graph.addNode({
      id: group.id,
      type: 'group',
      name: group.name
    });
    
    return group;
  }
  
  // Вступление в группу
  joinGroup(groupId: string, characterId: string, rank: string = 'member'): void {
    const group = this.groups.get(groupId);
    if (!group) return;
    
    const member: GroupMember = {
      id: uuidv4(),
      characterId,
      rank,
      joinDate: Date.now(),
      status: 'active',
      contributions: 0,
      reputation: 50
    };
    
    group.members.push(member);
    
    // Добавляем связь членства в граф
    this.graph.addEdge({
      id: uuidv4(),
      source: characterId,
      target: groupId,
      type: 'membership',
      weight: 50,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
  
  // Покидание группы
  leaveGroup(groupId: string, characterId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;
    
    const memberIndex = group.members.findIndex(m => m.characterId === characterId);
    if (memberIndex === -1) return;
    
    const member = group.members[memberIndex];
    member.leaveDate = Date.now();
    member.status = 'inactive';
    
    // Если это лидер, нужно выбрать нового
    if (group.leaderId === characterId) {
      // Найти следующего по рангу
      const remainingMembers = group.members.filter(m => m.status === 'active' && m.characterId !== characterId);
      if (remainingMembers.length > 0) {
        const newLeader = remainingMembers.sort((a, b) => b.reputation - a.reputation)[0];
        group.leaderId = newLeader.characterId;
      } else {
        group.leaderId = undefined;
        group.status = 'disbanded';
      }
    }
    
    // Удалить из совета если был там
    group.council = group.council.filter(id => id !== characterId);
  }
  
  // Изгнание из группы
  expelMember(groupId: string, characterId: string, reason: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;
    
    const memberIndex = group.members.findIndex(m => m.characterId === characterId);
    if (memberIndex === -1) return;
    
    const member = group.members[memberIndex];
    member.leaveDate = Date.now();
    member.status = 'expelled';
    
    // Добавить событие в репутацию персонажа
    // (здесь могла бы быть интеграция с системой репутации)
  }
  
  // Получение всех отношений персонажа
  getCharacterRelationships(characterId: string): Relationship[] {
    return Array.from(this.relationships.values()).filter(
      r => (r.personA === characterId || r.personB === characterId) && r.status === 'active'
    );
  }
  
  // Получение отношения между двумя персонажами
  getRelationship(personA: string, personB: string): Relationship | undefined {
    return Array.from(this.relationships.values()).find(
      r => ((r.personA === personA && r.personB === personB) ||
            (r.personA === personB && r.personB === personA)) &&
           r.status === 'active'
    );
  }
  
  // Получение всех групп персонажа
  getCharacterGroups(characterId: string): SocialGroup[] {
    return Array.from(this.groups.values()).filter(
      g => g.members.some(m => m.characterId === characterId && m.status === 'active')
    );
  }
  
  // Распространение слуха через социальную сеть
  spreadRumor(originatorId: string, rumor: string, maxDepth: number = 5): string[] {
    const reachedCharacters = new Set<string>();
    const queue: Array<{ characterId: string; depth: number }> = [{ characterId: originatorId, depth: 0 }];
    
    while (queue.length > 0) {
      const { characterId, depth } = queue.shift()!;
      
      if (reachedCharacters.has(characterId) || depth > maxDepth) continue;
      reachedCharacters.add(characterId);
      
      // Получить всех связанных персонажей
      const relationships = this.getCharacterRelationships(characterId);
      for (const rel of relationships) {
        const otherPerson = rel.personA === characterId ? rel.personB : rel.personA;
        
        // Шанс передачи зависит от силы отношения и доверия
        const transmissionChance = (rel.weight + 100) / 200 * (rel.trust / 100);
        if (Math.random() < transmissionChance) {
          queue.push({ characterId: otherPerson, depth: depth + 1 });
        }
      }
      
      // Также через группы
      const groups = this.getCharacterGroups(characterId);
      for (const group of groups) {
        for (const member of group.members) {
          if (member.status === 'active' && !reachedCharacters.has(member.characterId)) {
            const transmissionChance = member.reputation / 100;
            if (Math.random() < transmissionChance) {
              queue.push({ characterId: member.characterId, depth: depth + 1 });
            }
          }
        }
      }
    }
    
    return Array.from(reachedCharacters);
  }
  
  // Расчет влияния на персонажа
  calculateInfluence(characterId: string): {
    socialStanding: number;
    networkSize: number;
    groupInfluences: Array<{ groupId: string; influence: number }>;
  } {
    const relationships = this.getCharacterRelationships(characterId);
    const groups = this.getCharacterGroups(characterId);
    
    // Социальный статус на основе отношений
    const positiveRelations = relationships.filter(r => r.weight > 0).length;
    const negativeRelations = relationships.filter(r => r.weight < 0).length;
    const socialStanding = Math.max(0, Math.min(100, 
      50 + (positiveRelations * 5) - (negativeRelations * 10)
    ));
    
    // Размер сети
    const networkSize = relationships.length + groups.length;
    
    // Влияние групп
    const groupInfluences = groups.map(g => ({
      groupId: g.id,
      influence: g.influence * (g.members.find(m => m.characterId === characterId)?.reputation || 50) / 100
    }));
    
    return {
      socialStanding,
      networkSize,
      groupInfluences
    };
  }
  
  // Поиск кратчайшего пути между персонажами
  findConnectionPath(personA: string, personB: string): string[] | null {
    return this.graph.findPath(personA, personB);
  }
  
  // Экспорт состояния
  export(): {
    relationships: Relationship[];
    groups: SocialGroup[];
    graph: { nodes: SocialNode[]; edges: SocialEdge[] };
  } {
    return {
      relationships: Array.from(this.relationships.values()),
      groups: Array.from(this.groups.values()),
      graph: this.graph.export()
    };
  }
  
  // Импорт состояния
  import(data: {
    relationships: Relationship[];
    groups: SocialGroup[];
    graph?: { nodes: SocialNode[]; edges: SocialEdge[] };
  }): void {
    this.relationships.clear();
    this.groups.clear();
    
    for (const rel of data.relationships) {
      this.relationships.set(rel.id, rel);
    }
    
    for (const group of data.groups) {
      this.groups.set(group.id, group);
    }
    
    if (data.graph) {
      this.graph.import(data.graph);
    } else {
      // Перестроить граф из данных
      this.rebuildGraph();
    }
  }
  
  // Перестройка графа из отношений и групп
  private rebuildGraph(): void {
    this.graph = new SocialGraph();
    
    // Добавить всех персонажей из отношений
    for (const rel of this.relationships.values()) {
      if (!this.graph['nodes'].has(rel.personA)) {
        this.graph.addNode({ id: rel.personA, type: 'character', name: rel.personA });
      }
      if (!this.graph['nodes'].has(rel.personB)) {
        this.graph.addNode({ id: rel.personB, type: 'character', name: rel.personB });
      }
      
      this.addToGraph(rel);
    }
    
    // Добавить группы
    for (const group of this.groups.values()) {
      this.graph.addNode({ id: group.id, type: 'group', name: group.name });
      
      for (const member of group.members) {
        if (member.status === 'active') {
          this.graph.addEdge({
            id: uuidv4(),
            source: member.characterId,
            target: group.id,
            type: 'membership',
            weight: member.reputation,
            createdAt: member.joinDate,
            updatedAt: Date.now()
          });
        }
      }
    }
  }
  
  private addToGraph(relationship: Relationship): void {
    // Добавить узлы если нет
    if (!this.graph['nodes'].has(relationship.personA)) {
      this.graph.addNode({ id: relationship.personA, type: 'character', name: relationship.personA });
    }
    if (!this.graph['nodes'].has(relationship.personB)) {
      this.graph.addNode({ id: relationship.personB, type: 'character', name: relationship.personB });
    }
    
    // Добавить ребро
    this.graph.addEdge({
      id: relationship.id,
      source: relationship.personA,
      target: relationship.personB,
      type: relationship.type,
      weight: relationship.weight,
      createdAt: relationship.startDate,
      updatedAt: Date.now()
    });
  }
  
  private updateGraphEdge(relationship: Relationship): void {
    const edge = this.graph['edges'].get(relationship.id);
    if (edge) {
      edge.weight = relationship.weight;
      edge.updatedAt = Date.now();
    }
  }
}

// ============================================================================
// Фабрика для создания предопределённых типов отношений
// ============================================================================

export class RelationshipFactory {
  private static manager: SocialWorldManager;
  
  static setManager(manager: SocialWorldManager): void {
    this.manager = manager;
  }
  
  // Семейные отношения
  static createParentChild(parentId: string, childId: string): Relationship {
    return this.manager.createRelationship(parentId, childId, 'family', 'parent', 80, 90);
  }
  
  static createSiblings(siblingA: string, siblingB: string): Relationship {
    return this.manager.createRelationship(siblingA, siblingB, 'family', 'sibling', 60, 70);
  }
  
  // Романтика
  static createMarriage(spouseA: string, spouseB: string): Relationship {
    const rel = this.manager.createRelationship(spouseA, spouseB, 'romantic', 'married', 90, 85);
    rel.visibility = 'public';
    return rel;
  }
  
  static createDivorce(relationshipId: string, reason: string): void {
    const rel = this.manager['relationships'].get(relationshipId);
    if (rel && rel.subtype === 'married') {
      rel.subtype = 'ex_spouse';
      rel.weight -= 50;
      rel.trust -= 40;
      this.manager.endRelationship(relationshipId, reason);
    }
  }
  
  // Дружба
  static createFriendship(personA: string, personB: string, closeness: 'acquaintance' | 'friend' | 'close_friend' | 'best_friend'): Relationship {
    const weights = { acquaintance: 20, friend: 50, close_friend: 75, best_friend: 90 };
    const trusts = { acquaintance: 30, friend: 60, close_friend: 80, best_friend: 95 };
    return this.manager.createRelationship(personA, personB, 'friendship', closeness, weights[closeness], trusts[closeness]);
  }
  
  // Вражда
  static createRivalry(personA: string, personB: string, intensity: 'rival' | 'enemy'): Relationship {
    const weights = { rival: -30, enemy: -80 };
    const trusts = { rival: 20, enemy: 5 };
    return this.manager.createRelationship(personA, personB, 'rivalry', intensity, weights[intensity], trusts[intensity]);
  }
  
  // Профессиональные
  static createMentorship(mentorId: string, apprenticeId: string): Relationship {
    return this.manager.createRelationship(mentorId, apprenticeId, 'professional', 'mentor', 60, 70);
  }
  
  static createColleagues(personA: string, personB: string): Relationship {
    return this.manager.createRelationship(personA, personB, 'professional', 'colleague', 40, 50);
  }
  
  // Политические
  static createAlliance(personA: string, personB: string): Relationship {
    return this.manager.createRelationship(personA, personB, 'political', 'ally', 70, 60);
  }
  
  static createLiegeVassal(liegeId: string, vassalId: string): Relationship {
    return this.manager.createRelationship(liegeId, vassalId, 'political', 'liege', 50, 40);
  }
}

// Экспорт менеджера по умолчанию
export const socialWorldManager = new SocialWorldManager();
RelationshipFactory.setManager(socialWorldManager);
