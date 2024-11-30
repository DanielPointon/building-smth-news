import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import { Question } from '../types/question';
import { Market, MarketsClient } from '../utils/MarketsClient';
import { Transaction } from 'types/trades';

interface UseTransactions {
  transactions: Transaction[];
}

export const useTransactions: () => UseTransactions = () => {
  const userId = useContext(UserContext);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const client = new MarketsClient();
      const trades = await client.getUserTrades(userId);

      const transactions: Transaction[] = [];

      let i = 0;
      for (const t of trades.trades) {
        i++;
        const market = await client.getMarket(t.market_id);

        transactions.push({
          id: i.toString(),
          type: t.side == "bid" ? "buy" : "sell",
          question: market.name,
          amount: t.quantity,
          price: t.price,
          date: t.time
        });
      }

      setTransactions(_prev => transactions);
    };

    fetchTransactions();
  }, []);

  return {
    transactions
  };
};

