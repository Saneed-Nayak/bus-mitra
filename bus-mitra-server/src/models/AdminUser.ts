import mongoose, { Schema, Document } from 'mongoose';

export type AdminRole = 'SuperAdmin' | 'OperationsAdmin' | 'DataAdmin';

export interface IAdminUser extends Document {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  designation: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['SuperAdmin', 'OperationsAdmin', 'DataAdmin'],
      default: 'OperationsAdmin',
      index: true,
    },
    designation: { type: String, required: true, trim: true },
    lastLoginAt: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: 'admin_users',
    versionKey: false,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const AdminUserModel = mongoose.model<IAdminUser>('AdminUser', AdminUserSchema, 'admin_users');
