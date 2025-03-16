import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import redisClient from '../config/redis';
import { generateAccessToken, generateRefreshToken } from '../utils/token';
import { sendSuccess, sendError } from '../utils/response';
import jwt from 'jsonwebtoken';

export const registerUser = async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
  try {
    // Destructure user details from the request body
    const { email, password, name, role, businessId } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return sendError(res, 400, 'All fields are required');
    }

    // Validate role
    if (!['admin', 'business'].includes(role)) {
      return sendError(res, 400, 'Invalid role'); 
    }

    // Validate eamil format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already in use');
    }

    // Hash the user's password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      businessId,
    });

    await user.save();
    
    //get user by id without password field
    const newUser
    = await User.findById(user._id).select('-password');  
    
    // Send success response
    return sendSuccess(res, 201, 'User registered successfully', newUser);
  } catch (error: any) {
    // Handle errors and send error response
    console.error('Error registering user:', error);
    return sendError(res, 500, 'Error registering user', error?.message || 'Unknown error');
  }
};

export const loginUser = async (req: Request, res: Response, _next: NextFunction) : Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Email and password required');
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return sendSuccess(res, 200, 'User logged in successfully', { accessToken, refreshToken });
  } catch (error) {
    return sendError(res, 500, 'Error logging in', error);
  }
};

export const logoutUser = async (req: Request, res: Response, _next: NextFunction) : Promise<any> => {
  try {
    res.clearCookie('refreshToken');
    return sendSuccess(res, 200, 'User logged out successfully');
  } catch (error) {
    return sendError(res, 500, 'Error logging out', error);
  }
};

export const fetchAllUsers = async (req: Request, res: Response, _next: NextFunction) : Promise<any> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const cacheKey = `users-page-${page}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return sendSuccess(res, 200, 'Fetched users from cache', JSON.parse(cachedData));
    }

    const users = await User.find().skip((page - 1) * limit).limit(limit);
    await redisClient.set(cacheKey, JSON.stringify(users), { EX: 300 });

    return sendSuccess(res, 200, 'Fetched users successfully', users);
  } catch (error) {
    return sendError(res, 500, 'Error fetching users', error);
  }
};

export const fetchUserById = async (req: Request, res: Response, _next: NextFunction) : Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (error) {
    return sendError(res, 500, 'Error fetching user', error);
  }
};

export const editUser = async (req: Request, res: Response, _next: NextFunction) : Promise<any> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User updated successfully', user);
  } catch (error) {
    return sendError(res, 500, 'Error updating user', error);
  }
};

export const deleteUser = async (req: Request, res: Response, _next: NextFunction) : Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    return sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    return sendError(res, 500, 'Error deleting user', error);
  }
};


export const refreshAccessToken = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<any> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, 401, 'Refresh token not provided');
    }
    
    // Verify the refresh token; catch errors specific to JWT verification.
    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      );
    } catch (err: any) {
      // If verification fails, return a 403 error.
      return sendError(res, 403, 'Invalid refresh token', err.message);
    }
    
    // Find the user associated with the refresh token.
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    
    // Generate a new access token.
    const newAccessToken = generateAccessToken(user.id, user.role);
    return sendSuccess(res, 200, 'New access token generated successfully', { accessToken: newAccessToken });
  } catch (error: any) {
    console.error('Error refreshing access token:', error);
    return sendError(res, 500, 'Error refreshing access token', error.message || 'Unknown error');
  }
};
