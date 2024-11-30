export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  question: string;
  amount: number;
  price: number;
  date: string;
}

export interface TradingButtonsProps {
  probability: number;
}

export interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  probability: number;
  onTrade: (type: 'buy' | 'sell', amount: string) => void;
}

export interface TradeConfirmationProps {
  type: 'buy' | 'sell';
  probability: number;
}

export interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}
