import mongoose, { Schema, Document } from 'mongoose';

export interface IDepotContact extends Document {
  id: string;
  depotName: string;
  district: string;
  phoneNumber: string;
  altPhone?: string;
  address?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

const DepotContactSchema = new Schema<IDepotContact>(
  {
    id: { type: String, required: true, unique: true, index: true },
    depotName: { type: String, required: true, trim: true, index: true },
    district: { type: String, required: true, trim: true, index: true },
    phoneNumber: { type: String, required: true, trim: true },
    altPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'depot_contacts',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const DepotContactModel = mongoose.model<IDepotContact>('DepotContact', DepotContactSchema, 'depot_contacts');
