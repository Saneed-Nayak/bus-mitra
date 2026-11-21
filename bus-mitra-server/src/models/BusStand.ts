import mongoose, { Schema, Document } from 'mongoose';

export interface IBusStand extends Document {
  id: string;
  name: string;
  kannadaName?: string;
  district: string;
  status: 'Active' | 'Inactive';
  isPopular?: boolean;
  code?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

const BusStandSchema = new Schema<IBusStand>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    kannadaName: { type: String, trim: true },
    district: { type: String, required: true, trim: true, index: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
    isPopular: { type: Boolean, default: false, index: true },
    code: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'bus_stands',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const BusStandModel = mongoose.model<IBusStand>('BusStand', BusStandSchema, 'bus_stands');
