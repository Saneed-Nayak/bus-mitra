import mongoose, { Schema, Document } from 'mongoose';

export type BusType = string;

export interface ITimetable extends Document {
  id: string;
  routeId: string;
  fromStandName: string;
  toStandName: string;
  busName: string;
  busType: BusType;
  departureTime: string;
  departureMinutes: number;
  arrivalTime?: string;
  status: 'Published' | 'Draft';
  via?: string;
  viaStops?: string[];
  frequency?: string;
  createdAt: string;
  updatedAt: string;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    id: { type: String, required: true, unique: true, index: true },
    routeId: { type: String, required: true, index: true },
    fromStandName: { type: String, required: true, trim: true, index: true },
    toStandName: { type: String, required: true, trim: true, index: true },
    busName: { type: String, required: true, trim: true },
    busType: { type: String, required: true, trim: true, index: true },
    departureTime: { type: String, required: true },
    departureMinutes: { type: Number, required: true, index: true },
    arrivalTime: { type: String },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published', index: true },
    via: { type: String, trim: true },
    viaStops: { type: [String], default: undefined },
    frequency: { type: String, default: 'Daily' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'timetables',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

// Compound indexes for high-speed timetable queries
TimetableSchema.index({ fromStandName: 1, toStandName: 1, status: 1 });
TimetableSchema.index({ fromStandName: 1, toStandName: 1, departureMinutes: 1 });

export const TimetableModel = mongoose.model<ITimetable>('Timetable', TimetableSchema, 'timetables');
