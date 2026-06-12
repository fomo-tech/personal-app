import mongoose, { Schema } from 'mongoose';

export interface ITransaction {
  accountId: mongoose.Types.ObjectId;
  toAccountId?: mongoose.Types.ObjectId;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  date: Date;
  description: string;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema<ITransaction>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  toAccountId: { type: Schema.Types.ObjectId, ref: 'Account', required: false },
  type: { 
    type: String, 
    required: true, 
    enum: ['income', 'expense', 'transfer'] 
  },
  amount: { type: Number, required: true },
  category: { type: String, required: true, trim: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
