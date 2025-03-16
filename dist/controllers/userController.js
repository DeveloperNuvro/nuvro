"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.deleteUser = exports.editUser = exports.fetchUserById = exports.fetchAllUsers = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const redis_1 = __importDefault(require("../config/redis"));
const token_1 = require("../utils/token");
const response_1 = require("../utils/response");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = async (req, res, _next) => {
    try {
        // Destructure user details from the request body
        const { email, password, name, role, businessId } = req.body;
        // Validate required fields
        if (!email || !password || !name || !role) {
            return (0, response_1.sendError)(res, 400, 'All fields are required');
        }
        // Validate role
        if (!['admin', 'business'].includes(role)) {
            return (0, response_1.sendError)(res, 400, 'Invalid role');
        }
        // Validate eamil format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return (0, response_1.sendError)(res, 400, 'Invalid email format');
        }
        // Check if a user with the same email already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return (0, response_1.sendError)(res, 400, 'Email already in use');
        }
        // Hash the user's password for security
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create a new user in the database
        const user = new User_1.default({
            email,
            password: hashedPassword,
            name,
            role,
            businessId,
        });
        await user.save();
        //get user by id without password field
        const newUser = await User_1.default.findById(user._id).select('-password');
        // Send success response
        return (0, response_1.sendSuccess)(res, 201, 'User registered successfully', newUser);
    }
    catch (error) {
        // Handle errors and send error response
        console.error('Error registering user:', error);
        return (0, response_1.sendError)(res, 500, 'Error registering user', error?.message || 'Unknown error');
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res, _next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, response_1.sendError)(res, 400, 'Email and password required');
        }
        const user = await User_1.default.findOne({ email });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return (0, response_1.sendError)(res, 401, 'Invalid credentials');
        }
        const accessToken = (0, token_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, token_1.generateRefreshToken)(user.id);
        return (0, response_1.sendSuccess)(res, 200, 'User logged in successfully', { accessToken, refreshToken });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error logging in', error);
    }
};
exports.loginUser = loginUser;
const logoutUser = async (req, res, _next) => {
    try {
        res.clearCookie('refreshToken');
        return (0, response_1.sendSuccess)(res, 200, 'User logged out successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error logging out', error);
    }
};
exports.logoutUser = logoutUser;
const fetchAllUsers = async (req, res, _next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const cacheKey = `users-page-${page}`;
        const cachedData = await redis_1.default.get(cacheKey);
        if (cachedData) {
            return (0, response_1.sendSuccess)(res, 200, 'Fetched users from cache', JSON.parse(cachedData));
        }
        const users = await User_1.default.find().skip((page - 1) * limit).limit(limit);
        await redis_1.default.set(cacheKey, JSON.stringify(users), { EX: 300 });
        return (0, response_1.sendSuccess)(res, 200, 'Fetched users successfully', users);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error fetching users', error);
    }
};
exports.fetchAllUsers = fetchAllUsers;
const fetchUserById = async (req, res, _next) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(id);
        if (!user) {
            return (0, response_1.sendError)(res, 404, 'User not found');
        }
        return (0, response_1.sendSuccess)(res, 200, 'User fetched successfully', user);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error fetching user', error);
    }
};
exports.fetchUserById = fetchUserById;
const editUser = async (req, res, _next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await User_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!user) {
            return (0, response_1.sendError)(res, 404, 'User not found');
        }
        return (0, response_1.sendSuccess)(res, 200, 'User updated successfully', user);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error updating user', error);
    }
};
exports.editUser = editUser;
const deleteUser = async (req, res, _next) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findByIdAndDelete(id);
        if (!user) {
            return (0, response_1.sendError)(res, 404, 'User not found');
        }
        return (0, response_1.sendSuccess)(res, 200, 'User deleted successfully');
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, 'Error deleting user', error);
    }
};
exports.deleteUser = deleteUser;
const refreshAccessToken = async (req, res, _next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return (0, response_1.sendError)(res, 401, 'Refresh token not provided');
        }
        // Verify the refresh token; catch errors specific to JWT verification.
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        }
        catch (err) {
            // If verification fails, return a 403 error.
            return (0, response_1.sendError)(res, 403, 'Invalid refresh token', err.message);
        }
        // Find the user associated with the refresh token.
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            return (0, response_1.sendError)(res, 404, 'User not found');
        }
        // Generate a new access token.
        const newAccessToken = (0, token_1.generateAccessToken)(user.id, user.role);
        return (0, response_1.sendSuccess)(res, 200, 'New access token generated successfully', { accessToken: newAccessToken });
    }
    catch (error) {
        console.error('Error refreshing access token:', error);
        return (0, response_1.sendError)(res, 500, 'Error refreshing access token', error.message || 'Unknown error');
    }
};
exports.refreshAccessToken = refreshAccessToken;
