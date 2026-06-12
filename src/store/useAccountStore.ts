import { create } from 'zustand';

export interface AccountData {
  _id?: string;
  name: string;
  type: 'cash' | 'bank' | 'e-wallet';
  balance: number;
}

export interface TransactionData {
  _id?: string;
  accountId: string;
  toAccountId?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  date: string;
  description: string;
  accountName?: string;
  toAccountName?: string;
}

interface AccountState {
  accounts: AccountData[];
  transactions: TransactionData[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addAccount: (account: Omit<AccountData, '_id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<TransactionData, '_id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  transactions: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      set({ accounts: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      set({ transactions: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addAccount: async (account) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      if (!res.ok) throw new Error('Failed to add account');
      await get().fetchAccounts();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      await get().fetchAccounts();
      await get().fetchTransactions(); // Re-fetch because transaction may have been affected or references deleted
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!res.ok) throw new Error('Failed to add transaction');
      await get().fetchTransactions();
      await get().fetchAccounts(); // Update account balances
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete transaction');
      await get().fetchTransactions();
      await get().fetchAccounts(); // Re-fetch to sync account balances
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
