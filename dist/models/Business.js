"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BusinessSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
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
        integrationDetails: { type: mongoose_1.Schema.Types.Mixed }, // Store API keys, tokens, etc.
    },
    // Analytics Tracking
    analytics: {
        totalTickets: { type: Number, default: 0 },
        resolvedTickets: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 },
        customerSatisfaction: { type: Number, default: 0 },
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Business', BusinessSchema);
