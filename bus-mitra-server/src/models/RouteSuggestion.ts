import mongoose, { Schema, Document } from 'mongoose';

export interface IRouteSuggestion extends Document {
  id: string;
  fromStandName: string;
  toStandName: string;
  preferredTime?: string;
  message?: string;
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected';
  adminNotes?: string;
  approvedRouteId?: string;
  createdAt: string;
  updatedAt: string;
}

const RouteSuggestionSchema = new Schema<IRouteSuggestion>(
  {
    id: { type: String, required: true, unique: true, index: true },
    fromStandName: { type: String, required: true, trim: true, index: true },
    toStandName: { type: String, required: true, trim: true, index: true },
    preferredTime: { type: String, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    adminNotes: { type: String, trim: true },
    approvedRouteId: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'route_suggestions',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const RouteSuggestionModel = mongoose.model<IRouteSuggestion>('RouteSuggestion', RouteSuggestionSchema, 'route_suggestions');
