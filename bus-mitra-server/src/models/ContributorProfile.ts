import mongoose, { Schema, Document } from 'mongoose';

export interface IContributorProfile extends Document {
  id: string;
  totalPoints: number;
  reportCount: number;
  approvedCount: number;
  rejectedCount: number;
  lastContributedAt?: string;
  joinedAt: string;
}

const ContributorProfileSchema = new Schema<IContributorProfile>(
  {
    id: { type: String, required: true, unique: true, index: true },
    totalPoints: { type: Number, default: 0, index: true },
    reportCount: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    rejectedCount: { type: Number, default: 0 },
    lastContributedAt: { type: String },
    joinedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'contributor_profiles',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const ContributorProfileModel = mongoose.model<IContributorProfile>(
  'ContributorProfile',
  ContributorProfileSchema,
  'contributor_profiles'
);
