import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getCustomRepository(Transaction);

    const transactions = transactionsRepository.find();

    const balance = transactions.reduce((
      (totalBalance: Balance, transaction: Transaction ) => {
        if (transaction.type === 'income') {
          totalBalance.total += transaction.value;
          totalBalance.income += transaction.value;
          return totalBalance;
        }
        totalBalance.total -= transaction.value;
        totalBalance.outcome += transaction.value;
        return totalBalance;
      },
    ),
    { income: 0, outcome: 0, total: 0 },
    );

    return balance;
  }
}

export default TransactionsRepository;
