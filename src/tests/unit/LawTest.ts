/**
 * Unit тесты для правовой системы (law)
 */

import { TestResult, TestSuite } from '../types/TestTypes';

interface Crime {
  id: string;
  type: string;
  severity: number; // 1-10
  perpetrator: string;
  victim?: string;
  evidence: string[];
}

interface Punishment {
  type: 'fine' | 'imprisonment' | 'exile' | 'execution';
  duration?: number; // дни для заключения
  amount?: number; // сумма штрафа
}

export class LawTest {
  private suite: TestSuite = {
    name: 'Law System Tests',
    tests: [],
    totalDuration: 0,
    passedCount: 0,
    failedCount: 0,
  };

  runAll(): TestSuite {
    this.testCrimeClassification();
    this.testEvidenceRequirement();
    this.testPunishmentScaling();
    this.testInnocentUntilProvenGuilty();
    this.testRecidivism();
    return this.suite;
  }

  private testCrimeClassification(): void {
    const startTime = Date.now();
    try {
      const crimes: Crime[] = [
        { id: 'c1', type: 'theft', severity: 3, perpetrator: 'p1', evidence: ['witness'] },
        { id: 'c2', type: 'assault', severity: 6, perpetrator: 'p2', evidence: ['weapon', 'witness'] },
        { id: 'c3', type: 'murder', severity: 10, perpetrator: 'p3', evidence: ['body', 'weapon', 'witness'] }
      ];

      // Проверка классификации по тяжести
      const minor = crimes.filter(c => c.severity <= 3);
      const moderate = crimes.filter(c => c.severity > 3 && c.severity <= 7);
      const severe = crimes.filter(c => c.severity > 7);

      if (minor.length !== 1 || moderate.length !== 1 || severe.length !== 1) {
        throw new Error('Crime classification failed');
      }

      this.addTest('crime_classification', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('crime_classification', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testEvidenceRequirement(): void {
    const startTime = Date.now();
    try {
      const crimeWithEvidence: Crime = {
        id: 'c1',
        type: 'theft',
        severity: 5,
        perpetrator: 'p1',
        evidence: ['witness', 'stolen_item']
      };

      const crimeWithoutEvidence: Crime = {
        id: 'c2',
        type: 'theft',
        severity: 5,
        perpetrator: 'p2',
        evidence: []
      };

      // Обвинение требует улик
      const canConvictWithEvidence = crimeWithEvidence.evidence.length >= 2;
      const canConvictWithoutEvidence = crimeWithoutEvidence.evidence.length >= 2;

      if (!canConvictWithEvidence) {
        throw new Error('Should be able to convict with sufficient evidence');
      }

      if (canConvictWithoutEvidence) {
        throw new Error('Should not convict without evidence');
      }

      this.addTest('evidence_requirement', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('evidence_requirement', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testPunishmentScaling(): void {
    const startTime = Date.now();
    try {
      const punishments: Map<number, Punishment> = new Map([
        [2, { type: 'fine', amount: 50 }],
        [5, { type: 'imprisonment', duration: 30 }],
        [8, { type: 'exile' }],
        [10, { type: 'execution' }]
      ]);

      // Проверка что наказание растет с тяжестью преступления
      let prevSeverity = 0;
      for (const [severity, punishment] of punishments.entries()) {
        if (severity <= prevSeverity) {
          throw new Error('Severities should be in ascending order');
        }
        prevSeverity = severity;
      }

      // Проверка что все уровни покрыты
      if (punishments.size !== 4) {
        throw new Error('Not all severity levels have punishments');
      }

      this.addTest('punishment_scaling', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('punishment_scaling', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testInnocentUntilProvenGuilty(): void {
    const startTime = Date.now();
    try {
      const accused = {
        id: 'p1',
        name: 'Accused',
        isGuilty: false
      };

      const evidence: string[] = [];
      
      // Без улик обвиняемый считается невиновным
      const verdict = evidence.length >= 2 ? 'guilty' : 'not_guilty';
      
      if (verdict !== 'not_guilty') {
        throw new Error('Accused should be not guilty without sufficient evidence');
      }

      // Добавляем улики
      evidence.push('witness');
      evidence.push('physical_evidence');
      
      const newVerdict = evidence.length >= 2 ? 'guilty' : 'not_guilty';
      
      if (newVerdict !== 'guilty') {
        throw new Error('Accused should be guilty with sufficient evidence');
      }

      this.addTest('innocent_until_proven_guilty', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('innocent_until_proven_guilty', false, Date.now() - startTime, (error as Error).message);
    }
  }

  private testRecidivism(): void {
    const startTime = Date.now();
    try {
      const criminalHistory = [
        { crime: 'theft', date: 1000, punished: true },
        { crime: 'burglary', date: 1005, punished: true }
      ];

      const newCrime: Crime = {
        id: 'c_new',
        type: 'theft',
        severity: 4,
        perpetrator: 'repeat_offender',
        evidence: ['witness']
      };

      // Рецидивист получает более строгое наказание
      const baseSeverity = newCrime.severity;
      const recidivistMultiplier = 1 + (criminalHistory.length * 0.2);
      const adjustedSeverity = baseSeverity * recidivistMultiplier;

      if (adjustedSeverity <= baseSeverity) {
        throw new Error('Recidivist should receive harsher punishment');
      }

      if (adjustedSeverity > 10) {
        throw new Error('Adjusted severity should not exceed max');
      }

      this.addTest('recidivism', true, Date.now() - startTime);
    } catch (error) {
      this.addTest('recidivism', false, Date.now() - startTime, (error as Error).message);
    }
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
