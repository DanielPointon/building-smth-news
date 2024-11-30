export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  question: string;
  amount: number;
  price: number;
  date: string;
}

export interface TradingButtonsProps {
  marketId: string;
  probability: number;
}

export interface TradingModalProps {
  marketId: string;
  isOpen: boolean;
  onClose: () => void;
  probability: number;
  onTrade: (type: 'buy' | 'sell', amount: number) => void;
}

export interface TradeConfirmationProps {
  type: 'buy' | 'sell';
  probability: number;
}

export interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}
