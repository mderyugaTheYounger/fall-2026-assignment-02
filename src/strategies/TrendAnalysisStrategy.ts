import { Transaction } from '../models.js';
import { HistoricalDataService } from '../services/HistoricalDataService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TrendAnalysisStrategy implements AuditStrategy {
  public readonly name = 'Historical Trend Auditor';
  public readonly description =
    'Compares current monthly category spending against historical averages';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 3 - Implement this strategy.
    // 1. Call HistoricalDataService.getHistoricalAverages() asynchronously.
    const historicalAverage = await HistoricalDataService.getHistoricalAverages();
    
    // 2. Group current expenses (amount < 0) by category and compute category totals.
    const currentTotal: Record<string, number> = {};

    for (const tx of transactions){
      if (tx.amount < 0){
        const category = tx.category;
        const spend = Math.abs(tx.amount);
        currentTotal[category] = (currentTotal[category] ?? 0) + spend;
      }
    }

    // 3. For each category, compare current total spending against the historical average.
    const comparisons: { category: string; current: number; historical: number; variance: number }[] = [];

    for (const category of Object.keys(currentTotal)){
      const current = currentTotal[category];
      const historical = historicalAverage[category] ?? 0;

      // 4. Calculate the rate of change / variance percentage: ((current - historical) / historical) * 100.
      let variance: number;
      if (historical === 0){
        variance = current === 0 ? 0 : 100;
      } else {
        variance = ((current - historical) / historical) * 100;
      }

      comparisons.push({ category, current, historical, variance });
    }

    // 5. Highlight any category with a variance exceeding +/- 20%.
    const growthCategories = comparisons.filter((c) => c.variance > 20);
    const savingsCategories = comparisons.filter((c) => c.variance < -20);

    // 6. Format and return a text-based audit report detailing comparison metrics.
    let report = 'Historical Trend Audit Report\n';
    report += '================================\n\n';

    report += `${'Category'.padEnd(20)} ${'Current'.padEnd(11)}${'Historical'.padEnd(11)}% Change\n`;
    report += '--------------------------------------------------------\n';

    for (const c of comparisons){
      report += `${c.category.padEnd(20)} $${c.current.toFixed(2).padEnd(10)} $${c.historical.toFixed(2).padEnd(10)} ${c.variance.toFixed(1)}%\n`;
    }

    report += '\nSignificant Growth Categories:\n';
    if (growthCategories.length === 0) {
      report += 'None\n';
    } else {
      for (const c of growthCategories) {
        report += `${c.category}: +${c.variance.toFixed(1)}%\n`;
      }
    }

    report += '\nSignificant Savings Categories:\n';
    if (savingsCategories.length === 0) {
      report += 'None\n';
    } else {
      for (const c of savingsCategories) {
        report += `${c.category}: ${c.variance.toFixed(1)}%\n`;
      }
    }

    return report;
  }
}
