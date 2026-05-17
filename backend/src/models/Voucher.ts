import mongoose, { Schema, Document, Model } from 'mongoose';

export type VoucherType = 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'CONTRA';
export type VoucherStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export interface IVoucherEntry {
  account: mongoose.Types.ObjectId;
  dr: number;
  cr: number;
  narration?: string;
}

export interface IVoucher extends Document {
  _id: mongoose.Types.ObjectId;
  voucherNumber: string;
  date: Date;
  type: VoucherType;
  department: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  bill?: mongoose.Types.ObjectId;
  entries: IVoucherEntry[];
  narration?: string;
  status: VoucherStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const voucherEntrySchema = new Schema<IVoucherEntry>(
  {
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    dr: { type: Number, default: 0, min: 0 },
    cr: { type: Number, default: 0, min: 0 },
    narration: { type: String },
  },
  { _id: false }
);

const voucherSchema = new Schema<IVoucher>(
  {
    voucherNumber: { type: String, unique: true, required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    type: {
      type: String,
      enum: ['PAYMENT', 'RECEIPT', 'JOURNAL', 'CONTRA'],
      required: true,
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    bill: { type: Schema.Types.ObjectId, ref: 'Bill' },
    entries: [voucherEntrySchema],
    narration: { type: String },
    status: {
      type: String,
      enum: ['DRAFT', 'POSTED', 'CANCELLED'],
      default: 'DRAFT',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Basic validation for double entry: total Dr must equal total Cr (at schema level might be tricky, so we'll do it in pre-save or controller)
voucherSchema.pre('save', function (next) {
  let totalDr = 0;
  let totalCr = 0;
  this.entries.forEach(entry => {
    totalDr += entry.dr || 0;
    totalCr += entry.cr || 0;
  });

  // Small epsilon for floating point issues
  if (Math.abs(totalDr - totalCr) > 0.01) {
    return next(new Error('Total Debit must be equal to Total Credit'));
  }
  next();
});

voucherSchema.index({ department: 1, date: -1 });

const Voucher: Model<IVoucher> = mongoose.model<IVoucher>('Voucher', voucherSchema);
export default Voucher;
