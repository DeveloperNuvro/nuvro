import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  industry: string;
  businessType: 'b2b' | 'b2c' | 'ecommerce-store' | 'other';
  platform: string;
  supportSize: string;
  supportChannels: string[];
  websiteTraffic: string;
  monthlyConversations: string;
  goals: string[];
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  aiIntegrations: { 
    website: boolean; 
    whatsapp: boolean; 
    api: boolean; 
    integrationDetails?: Record<string, any>;
  };
  analytics: {
    totalTickets: number;
    resolvedTickets: number;
    avgResponseTime: number;
    customerSatisfaction: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    industry: { type: String, required: true },
    businessType: { type: String, enum: ['b2b', 'b2c', 'ecommerce-store', 'other'], required: true },
    platform: { type: String, required: true },
    supportSize: { type: String, required: true },
    supportChannels: { type: [String], required: true },
    websiteTraffic: { type: String, required: true },
    monthlyConversations: { type: String, required: true },
    goals: { type: [String], required: true },
    subscriptionPlan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },

    // AI Integration Tracking
    aiIntegrations: {
      website: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      api: { type: Boolean, default: false },
      integrationDetails: { type: Schema.Types.Mixed }, // Store API keys, tokens, etc.
    },

    // Analytics Tracking
    analytics: {
      totalTickets: { type: Number, default: 0 },
      resolvedTickets: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
      customerSatisfaction: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>('Business', BusinessSchema);

