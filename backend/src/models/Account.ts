import mongoose, { Schema, Document, Model } from 'mongoose';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type AccountSubType = 'Bank Accounts' | 'Cash in Hand' | 'Sundry Debtors' | 'Sundry Creditors' | 'Duties & Taxes' | 'Direct Expenses' | 'Indirect Expenses' | 'Direct Incomes' | 'Indirect Incomes' | 'Capital Account' | 'Current Liabilities' | 'Fixed Assets' | 'Current Assets' | 'Investments';

export interface IAccount extends Document {
  _id: mongoose.Types.ObjectId;
  accountNumber: string;
  name: string;
  type: AccountType;
  subType: AccountSubType;
  department: mongoose.Types.ObjectId;
  referenceId?: mongoose.Types.ObjectId; // E.g., User ID for Contractors or Project ID
  currentBalance: number;
  openingBalance: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    accountNumber: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'],
      required: true,
    },
    subType: {
      type: String,
      required: true,
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    referenceId: { type: Schema.Types.ObjectId }, // Flexible ref (could be Project, User, etc.)
    currentBalance: { type: Number, default: 0 },
    openingBalance: { type: Number, default: 0 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes to fetch quickly by department and referenceId
accountSchema.index({ department: 1, type: 1 });
accountSchema.index({ referenceId: 1 });

const Account: Model<IAccount> = mongoose.model<IAccount>('Account', accountSchema);
export default Account;
