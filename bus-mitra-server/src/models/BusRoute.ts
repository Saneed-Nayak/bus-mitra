import mongoose, { Schema, Document } from 'mongoose';

export interface IBusRoute extends Document {
  id: string;
  fromStandId: string;
  fromStandName: string;
  toStandId: string;
  toStandName: string;
  status: 'Published' | 'Draft' | 'Inactive';
  distanceKm?: number;
  durationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

const BusRouteSchema = new Schema<IBusRoute>(
  {
    id: { type: String, required: true, unique: true, index: true },
    fromStandId: { type: String, required: true, index: true },
    fromStandName: { type: String, required: true, trim: true, index: true },
    toStandId: { type: String, required: true, index: true },
    toStandName: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: ['Published', 'Draft', 'Inactive'], default: 'Published', index: true },
    distanceKm: { type: Number },
    durationMinutes: { type: Number },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'bus_routes',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const BusRouteModel = mongoose.model<IBusRoute>('BusRoute', BusRouteSchema, 'bus_routes');
