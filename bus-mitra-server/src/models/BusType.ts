import mongoose, { Schema, Document } from 'mongoose';

export interface IBusType extends Document {
  id: string;
  name: string;
  createdAt: string;
}

const BusTypeSchema = new Schema<IBusType>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, trim: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { collection: 'bus_types', versionKey: false }
);

export const BusTypeModel = mongoose.model<IBusType>('BusType', BusTypeSchema, 'bus_types');
