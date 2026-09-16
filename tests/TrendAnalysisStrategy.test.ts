import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrendAnalysisStrategy } from '../src/strategies/TrendAnalysisStrategy.js';
import { HistoricalDataService } from '../src/services/HistoricalDataService.js';
import { Transaction } from '../src/models.js';

describe('TrendAnalysisStrategy (Feature 3)', () => {
  let strategy: TrendAnalysisStrategy;

  beforeEach(() => {
    strategy = new TrendAnalysisStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  
  // it('should compute correct spending variances against historical averages', async () => {
  //   const mockAverages = { Food: 200, Rent: 1000 };
  //   const spy = vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(mockAverages);
  
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -250.00, category: 'Food', description: 'Grocery', status: 'completed' }, // +25% change
  //     { id: '2', date: '2026-05-02', amount: -1000.00, category: 'Rent', description: 'Apartment', status: 'completed' }, // 0% change
  //   ];
  
  //   const result = await strategy.execute(testTransactions);
  
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('+25'); // growth detected
  //   expect(result).toContain('Food');
  // });

  it('should group current expenses by category and compute accurate totals', async() => {
    const mockAverages = { Entertainment: 100 };
    const spy = vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-09-13', amount: -50.00, category: 'Entertainment', description: 'Movie1', status: 'completed' },
      { id: '2', date: '2026-09-13', amount: -60.00, category: 'Entertainment', description: 'Movie2', status: 'completed' },
      { id: '3', date: '2026-09-13', amount: -70.00, category: 'Entertainment', description: 'Movie3', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('$180.00');
  });

  it('should calculate variance percentage from historical averages correctly', async() => {
    const mockAverages = { Entertainment: 100 };
    const spy = vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-09-13', amount: -200.00, category: 'Entertainment', description: 'Movies', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Entertainment');
    expect(result).toContain('100.0%');
  });

  it('should highlight categories exceeding positive/negative 20% variance threshold', async() => {
    const mockAverages = { Entertainment: 100, Dining: 100, Utilities: 100 };
    const spy = vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-09-13', amount: -200.00, category: 'Entertainment', description: 'Movies', status: 'completed' },
      { id: '2', date: '2026-09-13', amount: -60.00, category: 'Dining', description: 'Supermarket', status: 'completed' },
      { id: '3', date: '2026-09-13', amount: -105.00, category: 'Utilities', description: 'Electricity bill', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Entertainment: +100.0%');
    expect(result).toContain('Dining: -40.0%');

    expect(result).not.toContain('Utilities: +5.0%');
    expect(result).not.toContain('Utilities: 5.0%');
  });

  it('should handle categories present in current data but missing in historical benchmarks', async() => {
    const mockAverages = { Entertainment: 100 };
    const spy = vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-09-13', amount: -200.00, category: 'NewSubscription', description: 'Streaming service', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('NewSubscription');
    expect(result).toContain('100.0%');
  });

  it.todo(
    'should format historical vs current comparisons in a readable report',
  );
});
