import mongoose, { Schema, Document } from 'mongoose';

export type TenderInteractionStatus = 'VIEWED' | 'APPLIED' | 'IGNORED';

export interface ITenderInteraction extends Document {
  user: mongoose.Types.ObjectId;
  tender: mongoose.Types.ObjectId;
  status: TenderInteractionStatus;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tenderInteractionSchema = new Schema<ITenderInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tender: { type: Schema.Types.ObjectId, ref: 'Tender', required: true, index: true },
    status: {
      type: String,
      enum: ['VIEWED', 'APPLIED', 'IGNORED'],
      default: 'VIEWED',
    },
    isBookmarked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure one interaction record per user-tender pair
tenderInteractionSchema.index({ user: 1, tender: 1 }, { unique: true });

const TenderInteraction = mongoose.model<ITenderInteraction>('TenderInteraction', tenderInteractionSchema);
export default TenderInteraction;
