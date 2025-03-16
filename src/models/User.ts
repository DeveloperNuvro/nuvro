import mongoose, { Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    role: 'admin' | 'business'
    name: string;
    businessId?: mongoose.Types.ObjectId; // If user is a company or support agent, link to business
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const UserSchema = new Schema<IUser>(
    {
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'business'], default: 'business' },
      name: { type: String, required: true },
      businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
      verified: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  
  export default mongoose.model<IUser>('User', UserSchema);
  