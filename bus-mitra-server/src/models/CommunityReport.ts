import mongoose, { Schema, Document } from 'mongoose';

export type QuestionSetType = 'at_stop' | 'on_bus' | 'general';

export interface ICommunityReport extends Document {
  id: string;
  contributorId: string;
  location?: {
    latitude: number;
    longitude: number;
    nearestStand: string;
    distanceMeters: number;
  };
  questionSetType: QuestionSetType;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes?: string;
  pointsAwarded: number;
  bonusPoints: number;
  bonusCredited: boolean;
  createdAt: string;
  updatedAt: string;
}

const CommunityReportSchema = new Schema<ICommunityReport>(
  {
    id: { type: String, required: true, unique: true, index: true },
    contributorId: { type: String, required: true, index: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      nearestStand: { type: String },
      distanceMeters: { type: Number },
    },
    questionSetType: {
      type: String,
      enum: ['at_stop', 'on_bus', 'general'],
      required: true,
    },
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    adminNotes: { type: String, trim: true },
    pointsAwarded: { type: Number, default: 10 },
    bonusPoints: { type: Number, default: 20 },
    bonusCredited: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'community_reports',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const CommunityReportModel = mongoose.model<ICommunityReport>('CommunityReport', CommunityReportSchema, 'community_reports');
