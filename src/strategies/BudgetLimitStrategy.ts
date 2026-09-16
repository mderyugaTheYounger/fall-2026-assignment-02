import { Transaction } from '../models.js';
import { BudgetService } from '../services/BudgetService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class BudgetLimitStrategy implements AuditStrategy {
  public readonly name = 'Budget Limit Auditor';
  public readonly description =
    'Checks category spending against monthly budget limits';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 1 - Implement this strategy.
    // 1. Call BudgetService.getCategoryBudgets() asynchronously.
    const budget = await BudgetService.getCategoryBudgets();
    // 2. Group expenses (amounts < 0) by category and compute total spending for each category.
    const spendingByCategory: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.amount < 0) {
        const category = tx.category;
        spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(tx.amount);
      }
    }
    // 3. Compare spending against the fetched limits.
    // 4. Identify overages (categories where spending exceeds the budget).
    const overages: { category: string; limit: number; actual: number; overage: number }[] = [];
    for (const [category, spending] of Object.entries(spendingByCategory)) {
      const limit = budget[category];
      if (limit !== undefined && spending > limit) {
        overages.push({
          category,
          limit,
          actual: spending,
          overage: spending - limit
        });
      }
    }
    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages,
    // and lists of transactions causing the overage.
    if (overages.length === 0) {
      return `${this.name}\n${this.description}\n\nAll categories are within their budget limits.`;
    }

    const lines: string[] = [
      this.name,
      this.description,
      '',
      `Found ${overages.length} categor${overages.length === 1 ? 'y' : 'ies'} over budget:`,
      '',
    ];

    for (const { category, limit, actual, overage } of overages) {
      const overagePercent = (overage / limit) * 100;

      lines.push(`Category: ${category}`);
      lines.push(`  Limit:    $${limit.toFixed(2)}`);
      lines.push(`  Actual:   $${actual.toFixed(2)}`);
      lines.push(`  Overage:  $${overage.toFixed(2)} (${overagePercent.toFixed(1)}% over)`);
      lines.push('  Transactions contributing to overage:');

      const contributingTxs = transactions.filter(
        (tx) => tx.category === category && tx.amount < 0,
      );
      for (const tx of contributingTxs) {
        lines.push(
          `    - ${tx.date} | ${tx.description} | $${Math.abs(tx.amount).toFixed(2)}`,
        );
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}