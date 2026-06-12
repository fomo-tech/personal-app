import mongoose, { Schema } from 'mongoose';

export interface IAccount {
  name: string;
  type: 'cash' | 'bank' | 'e-wallet';
  balance: number;
  createdAt: Date;
}

const AccountSchema: Schema = new Schema<IAccount>({
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['cash', 'bank', 'e-wallet'],
    default: 'cash'
  },
  balance: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Account = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
