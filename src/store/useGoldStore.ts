import { create } from 'zustand';

export interface GoldHoldingData {
  _id?: string;
  goldType: string;
  quantity: number; // in "chỉ"
  purchasePrice: number; // VND per "chỉ"
  purchaseDate: string;
  currentPrice: number; // VND per "chỉ"
  note: string;
}

interface GoldState {
  goldHoldings: GoldHoldingData[];
  loading: boolean;
  error: string | null;
  fetchGoldHoldings: () => Promise<void>;
  addGoldHolding: (gold: Omit<GoldHoldingData, '_id'>) => Promise<void>;
  updateGoldHolding: (id: string, gold: Partial<GoldHoldingData>) => Promise<void>;
  deleteGoldHolding: (id: string) => Promise<void>;
}

export const useGoldStore = create<GoldState>((set, get) => ({
  goldHoldings: [],
  loading: false,
  error: null,

  fetchGoldHoldings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/gold');
      if (!res.ok) throw new Error('Failed to fetch gold holdings');
      const data = await res.json();
      set({ goldHoldings: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addGoldHolding: async (gold) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gold),
      });
      if (!res.ok) throw new Error('Failed to add gold holding');
      await get().fetchGoldHoldings();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateGoldHolding: async (id, gold) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/gold?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gold),
      });
      if (!res.ok) throw new Error('Failed to update gold holding');
      await get().fetchGoldHoldings();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  deleteGoldHolding: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/gold?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete gold holding');
      await get().fetchGoldHoldings();
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
