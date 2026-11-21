import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  id: string;
  type:
    | 'timetable_update'
    | 'route_added'
    | 'suggestion_received'
    | 'suggestion_approved'
    | 'depot_updated'
    | 'stand_added'
    | 'timetable_published';
  title: string;
  description: string;
  timestamp: string;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'activity_logs',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const ActivityLogModel = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema, 'activity_logs');
