import { Transaction } from '../models.js';
import { AnomalyRulesService } from '../services/AnomalyRulesService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class AnomalyDetectionStrategy implements AuditStrategy {
  public readonly name = 'Anomaly & Duplicate Auditor';
  public readonly description =
    'Detects transactions exceeding thresholds and duplicate records';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 2 - Implement this strategy.
    const rules = await AnomalyRulesService.getRules();
    const outliers = transactions.filter(
    (transaction) => Math.abs(transaction.amount) > rules.maxTransactionAmount
);

  const duplicateMap = new Map<string, Transaction[]>();

for (const transaction of transactions) {
    const key = `${transaction.date}|${transaction.category}|${transaction.description}|${transaction.amount}`;

    const group = duplicateMap.get(key) ?? [];
    group.push(transaction);
    duplicateMap.set(key, group);
}

const duplicateSets = Array.from(duplicateMap.values()).filter(
    (group) => group.length > 1
);

  const flaggedTransactions = transactions.filter(
    (transaction) => rules.flaggedStatuses.includes(transaction.status)
);
  const anomalousTransactions = new Set<Transaction>();

for (const transaction of outliers) {
    anomalousTransactions.add(transaction);
}

for (const transaction of flaggedTransactions) {
    anomalousTransactions.add(transaction);
}

for (const group of duplicateSets) {
    for (const transaction of group) {
        anomalousTransactions.add(transaction);
    }
}

const anomalousCount = anomalousTransactions.size;

const anomalyPercentage =
    transactions.length === 0
        ? 0
        : (anomalousCount / transactions.length) * 100;

       const totalFlaggedValue = Array.from(anomalousTransactions).reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0
);
    // 1. Call AnomalyRulesService.getRules() asynchronously.
    // 2. Scan transactions to find outliers (expenses exceeding rules.maxTransactionAmount).
    // 3. Scan to identify duplicates (transactions sharing the exact same date, category, description, and amount).
    // 4. Identify transactions having a status that matches any in rules.flaggedStatuses.
    // 5. Calculate total flagged value and anomaly rates.
    // 6. Format and return a text-based audit report of anomalies, duplicate sets, and totals.

    return `Anomaly Report:

OUTLIER TRANSACTIONS:
${outliers.length > 0
    ? outliers
        .map((transaction) => JSON.stringify(transaction))
        .join('\n')
    : 'None'}

DUPLICATE TRANSACTION SETS:
${duplicateSets.length > 0
    ? duplicateSets
        .map(
            (group, index) =>
                `Set ${index + 1}:\n${group
                    .map((transaction) => `  ${JSON.stringify(transaction)}`)
                    .join('\n')}`
        )
        .join('\n')
    : 'None'}

FLAGGED STATUS TRANSACTIONS:
${flaggedTransactions.length > 0
    ? flaggedTransactions
        .map((transaction) => JSON.stringify(transaction))
        .join('\n')
    : 'None'}

SUMMARY:
- Total Transactions: ${transactions.length}
- Total Anomalous Transactions: ${anomalousCount}
- Anomaly Percentage: ${anomalyPercentage.toFixed(2)}%
- Total Flagged Value: ${totalFlaggedValue.toFixed(2)}
- Duplicate Sets: ${duplicateSets.length}`;
  }
}
