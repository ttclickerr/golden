import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  Building2, 
  Gamepad2, 
  MousePointer, 
  Gift, 
  Star,
  Clock,
  Filter,
  ArrowUpCircle
} from 'lucide-react';
import { formatNumber } from '@/lib/gameData';

const formatCurrency = (amount: number) => {
  return `$${formatNumber(amount)}`;
};

export interface Transaction {
  id: string;
  type: 'click' | 'passive' | 'investment' | 'business' | 'casino' | 'level_bonus' | 'achievement';
  amount: number;
  description: string;
  timestamp: Date;
  source?: string;
  details?: any;
}

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const TRANSACTION_ICONS = {
  click: MousePointer,
  passive: TrendingUp,
  investment: ArrowUpCircle,
  business: Building2,
  casino: Gamepad2,
  level_bonus: Gift,
  achievement: Star
};

const TRANSACTION_COLORS = {
  click: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  passive: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  investment: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  business: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  casino: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  level_bonus: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  achievement: 'bg-violet-500/10 text-violet-300 border-violet-500/20'
};

const TRANSACTION_LABELS = {
  click: 'Click',
  passive: 'Passive Income',
  investment: 'Investment',
  business: 'Business',
  casino: 'Casino',
  level_bonus: 'Level Bonus',
  achievement: 'Achievement'
};

export function TransactionHistory({ isOpen, onClose, transactions }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<string>('all');
  const [sortedTransactions, setSortedTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    let filtered = transactions;
    
    if (filter !== 'all') {
      filtered = transactions.filter(t => t.type === filter);
    }
    
    // Sort by time (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setSortedTransactions(filtered);
  }, [transactions, filter]);

  // Отдельный эффект для сброса страницы только при смене фильтра
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Вычисляем данные для пагинации
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes}м назад`;
    if (hours < 24) return `${hours}ч назад`;
    return `${days}д назад`;
  };

  const getTotalByType = (type: string) => {
    return transactions
      .filter(t => type === 'all' || t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const filterOptions = [
    { value: 'all', label: 'All Transactions', total: getTotalByType('all') },
    { value: 'passive', label: 'Passive Income', total: getTotalByType('passive') },
    { value: 'click', label: 'Clicks', total: getTotalByType('click') },
    { value: 'investment', label: 'Investments', total: getTotalByType('investment') },
    { value: 'business', label: 'Business', total: getTotalByType('business') },
    { value: 'casino', label: 'Casino', total: getTotalByType('casino') },
    { value: 'level_bonus', label: 'Bonuses', total: getTotalByType('level_bonus') }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] bg-gradient-to-br from-gray-900/98 via-blue-900/95 to-purple-900/95 border border-blue-500/30 text-white backdrop-blur-xl shadow-2xl shadow-blue-500/20 flex flex-col">
        <DialogHeader className="pb-2 border-b border-blue-500/20">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            <div className="p-1 bg-blue-500/20 rounded border border-blue-400/30">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            Transaction History
            <div className="ml-auto bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded text-xs">
              {sortedTransactions.length}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Список транзакций */}
        <ScrollArea className="flex-1 h-full">
          <div className="space-y-0 pl-0 pr-2">
            {sortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
                    <Clock className="w-8 h-8 text-blue-400/70" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <p className="text-gray-400 font-medium">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-1">Start playing to see income history</p>
              </div>
            ) : (
              currentTransactions.map((transaction) => {
                const IconComponent = TRANSACTION_ICONS[transaction.type];
                const colorClass = TRANSACTION_COLORS[transaction.type];
                const isInvestmentWithDetails = transaction.type === 'investment' && transaction.details;
                return (
                  <div
                    key={transaction.id}
                    className="group relative px-0 py-0.5 hover:bg-gray-800/20 transition-colors"
                  >
                    {/* Ultra-compact row - everything in one line */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded flex items-center justify-center ${colorClass}`}>
                          <IconComponent className="w-2 h-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-300 truncate">
                            {transaction.description}
                          </span>
                          {isInvestmentWithDetails && (
                            <div className="text-[10px] text-blue-300/80 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                              <span>Asset: <b>{transaction.details.name}</b></span>
                              <span>Price: <b>${transaction.details.price}</b></span>
                              <span>Qty: <b>{transaction.details.quantity}</b></span>
                              <span>Type: <b>{transaction.details.operationType === 'buy' ? 'Buy' : 'Sell'}</b></span>
                              <span className="text-gray-400">{new Date(transaction.details.date).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className={`font-bold ml-2 ${
                          transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Компактная пагинация */}
        {totalPages > 1 && (
          <div className="border-t border-gray-700/30 pt-2 mt-2">
            <div className="flex justify-between items-center text-xs">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                ←
              </button>
              
              <div className="flex items-center gap-1 text-gray-400">
                <span>{currentPage}</span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Minimalist statistics */}
        <div className="border-t border-gray-700/30 pt-2 mt-2">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Total operations: {sortedTransactions.length}</span>
            <span className="text-emerald-400 font-mono">
              {formatCurrency(getTotalByType('all')).replace('$', '').replace(',', '')}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Хук для управления историей транзакций (только в памяти)
export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // УБИРАЕМ ПОЛНОСТЬЮ ЗАГРУЗКУ ИЗ localStorage
  // История транзакций теперь существует только в текущей сессии

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    const updatedTransactions = [newTransaction, ...transactions.slice(0, 499)];
    setTransactions(updatedTransactions);
    // DO NOT SAVE to localStorage - memory only
    console.log('✅ Added transaction to session history:', transaction.type);
    console.log('📊 Current transaction count:', updatedTransactions.length);
  };

  const clearHistory = () => {
    console.log('🧹 clearHistory called');
    setTransactions([]);
    localStorage.removeItem('game-transactions');
    localStorage.removeItem('transaction-history');
    // Set flag that history was cleared
    localStorage.setItem('transactions-cleared', Date.now().toString());
    console.log('🧹 All transaction keys removed');
  };

  return {
    transactions,
    addTransaction,
    clearHistory
  };
}