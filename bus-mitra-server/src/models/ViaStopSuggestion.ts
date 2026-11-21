import mongoose, { Schema, Document } from 'mongoose';

export interface IViaStopSuggestion extends Document {
  id: string;
  timetableId: string; // Specific bus/trip ID - each bus can have different via stops
  routeId: string;
  fromStandName: string;
  toStandName: string;
  stopName: string;
  position: number; // 0 = immediately after From, 1 = after first intermediate stop, etc.
  submittedBy?: string; // Optional: user/email or anonymous
  reason: 'travelled' | 'regular_user' | 'know_route' | 'other'; // How user knows this stop
  notes?: string; // Additional information
  status: 'pending' | 'verified' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const ViaStopSuggestionSchema = new Schema<IViaStopSuggestion>(
  {
    id: { type: String, required: true, unique: true, index: true },
    timetableId: { type: String, required: true, index: true }, // Specific bus/trip
    routeId: { type: String, required: true, index: true },
    fromStandName: { type: String, required: true, trim: true, index: true },
    toStandName: { type: String, required: true, trim: true, index: true },
    stopName: { type: String, required: true, trim: true, index: true },
    position: { type: Number, required: true, default: 0 },
    submittedBy: { type: String, trim: true },
    reason: {
      type: String,
      enum: ['travelled', 'regular_user', 'know_route', 'other'],
      default: 'know_route',
    },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String, trim: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'via_stop_suggestions',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const ViaStopSuggestionModel = mongoose.model<IViaStopSuggestion>(
  'ViaStopSuggestion',
  ViaStopSuggestionSchema,
  'via_stop_suggestions'
);
