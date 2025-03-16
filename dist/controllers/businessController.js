"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBusinessById = exports.fetchAllBusiness = exports.deleteBusiness = exports.editBusinessById = exports.createBusiness = void 0;
const Business_1 = __importDefault(require("../models/Business"));
const redis_1 = __importDefault(require("../config/redis"));
const response_1 = require("../utils/response");
// Create a new business
const createBusiness = async (req, res, _next) => {
    try {
        const { name, owner, industry, businessType, platform, supportSize, supportChannels, websiteTraffic, monthlyConversations, goals, subscriptionPlan, aiIntegrations, analytics } = req.body;
        // Validate required fields
        if (!name || !owner || !industry || !businessType || !platform || !supportSize || !supportChannels || !websiteTraffic || !monthlyConversations || !goals) {
            return (0, response_1.sendError)(res, 400, 'Missing required business fields');
        }
        // Create a new business
        const business = new Business_1.default({
            name,
            owner,
            industry,
            businessType,
            platform,
            supportSize,
            supportChannels,
            websiteTraffic,
            monthlyConversations,
            goals,
            subscriptionPlan: subscriptionPlan || 'free',
            aiIntegrations: aiIntegrations || { website: false, whatsapp: false, api: false },
            analytics: analytics || { totalTickets: 0, resolvedTickets: 0, avgResponseTime: 0, customerSatisfaction: 0 }
        });
        await business.save();
        return (0, response_1.sendSuccess)(res, 201, 'Business created successfully', business);
    }
    catch (error) {
        console.error('Error creating business:', error);
        return (0, response_1.sendError)(res, 500, 'Error creating business', error.message || 'Unknown error');
    }
};
exports.createBusiness = createBusiness;
// Edit business by ID
const editBusinessById = async (req, res, _next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const business = await Business_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!business) {
            return (0, response_1.sendError)(res, 404, 'Business not found');
        }
        // Optionally, you might clear related cache keys here
        return (0, response_1.sendSuccess)(res, 200, 'Business updated successfully', business);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error updating business', error.message || 'Unknown error');
    }
};
exports.editBusinessById = editBusinessById;
// Delete business by ID
const deleteBusiness = async (req, res, _next) => {
    try {
        const { id } = req.params;
        const business = await Business_1.default.findByIdAndDelete(id);
        if (!business) {
            return (0, response_1.sendError)(res, 404, 'Business not found');
        }
        return (0, response_1.sendSuccess)(res, 200, 'Business deleted successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error deleting business', error.message || 'Unknown error');
    }
};
exports.deleteBusiness = deleteBusiness;
// Fetch all businesses with pagination and caching
const fetchAllBusiness = async (req, res, _next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const cacheKey = `businesses-page-${page}`;
        // Check if cached data exists
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            return (0, response_1.sendSuccess)(res, 200, 'Fetched businesses from cache', JSON.parse(cachedData));
        }
        // Fetch from database
        const businesses = await Business_1.default.find().skip((page - 1) * limit).limit(limit);
        // Cache the result for 5 minutes
        await redis_1.default.set(cacheKey, JSON.stringify(businesses), { EX: 300 });
        return (0, response_1.sendSuccess)(res, 200, 'Fetched businesses successfully', businesses);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error fetching businesses', error.message || 'Unknown error');
    }
};
exports.fetchAllBusiness = fetchAllBusiness;
// Fetch a business by ID
const fetchBusinessById = async (req, res, _next) => {
    try {
        const { id } = req.params;
        const business = await Business_1.default.findById(id);
        if (!business) {
            return (0, response_1.sendError)(res, 404, 'Business not found');
        }
        return (0, response_1.sendSuccess)(res, 200, 'Business fetched successfully', business);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error fetching business', error.message || 'Unknown error');
    }
};
exports.fetchBusinessById = fetchBusinessById;
