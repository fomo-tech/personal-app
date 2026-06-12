import mongoose, { Schema } from 'mongoose';

export interface IGoldHolding {
  goldType: string;
  quantity: number; // in "chỉ" (1 lượng = 10 chỉ)
  purchasePrice: number; // VND per "chỉ"
  purchaseDate: Date;
  currentPrice: number; // VND per "chỉ"
  note: string;
  createdAt: Date;
}

const GoldHoldingSchema: Schema = new Schema<IGoldHolding>({
  goldType: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, default: 0 },
  purchasePrice: { type: Number, required: true, default: 0 },
  purchaseDate: { type: Date, required: true, default: Date.now },
  currentPrice: { type: Number, required: true, default: 0 },
  note: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const GoldHolding = mongoose.models.GoldHolding || mongoose.model<IGoldHolding>('GoldHolding', GoldHoldingSchema);
