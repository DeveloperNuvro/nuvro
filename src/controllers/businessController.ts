import { Request, Response, NextFunction } from 'express';
import Business from '../models/Business';
import redisClient from '../config/redis';
import { sendSuccess, sendError } from '../utils/response';

// Create a new business
export const createBusiness = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  try {
    const { name, owner, industry, businessType, platform, supportSize, supportChannels, websiteTraffic, monthlyConversations, goals, subscriptionPlan, aiIntegrations, analytics } = req.body;

    // Validate required fields
    if (!name || !owner || !industry || !businessType || !platform || !supportSize || !supportChannels || !websiteTraffic || !monthlyConversations || !goals) {
      return sendError(res, 400, 'Missing required business fields');
    }

    // Create a new business
    const business = new Business({
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

    return sendSuccess(res, 201, 'Business created successfully', business);
  } catch (error: any) {
    console.error('Error creating business:', error);
    return sendError(res, 500, 'Error creating business', error.message || 'Unknown error');
  }
};

// Edit business by ID
export const editBusinessById = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const business = await Business.findByIdAndUpdate(id, updates, { new: true });
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }
    // Optionally, you might clear related cache keys here
    return sendSuccess(res, 200, 'Business updated successfully', business);
  } catch (error: any) {
    return sendError(res, 500, 'Error updating business', error.message || 'Unknown error');
  }
};

// Delete business by ID
export const deleteBusiness = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const business = await Business.findByIdAndDelete(id);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }
    return sendSuccess(res, 200, 'Business deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Error deleting business', error.message || 'Unknown error');
  }
};

// Fetch all businesses with pagination and caching
export const fetchAllBusiness = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const cacheKey = `businesses-page-${page}`;

    // Check if cached data exists
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return sendSuccess(res, 200, 'Fetched businesses from cache', JSON.parse(cachedData));
    }

    // Fetch from database
    const businesses = await Business.find().skip((page - 1) * limit).limit(limit);
    // Cache the result for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(businesses), { EX: 300 });
    
    return sendSuccess(res, 200, 'Fetched businesses successfully', businesses);
  } catch (error: any) {
    return sendError(res, 500, 'Error fetching businesses', error.message || 'Unknown error');
  }
};

// Fetch a business by ID
export const fetchBusinessById = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    if (!business) {
      return sendError(res, 404, 'Business not found');
    }
    return sendSuccess(res, 200, 'Business fetched successfully', business);
  } catch (error: any) {
    return sendError(res, 500, 'Error fetching business', error.message || 'Unknown error');
  }
};
