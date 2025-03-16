// Set environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.MONGO_URI_TEST = 'mongodb://127.0.0.1:27017/saas-db-test';
process.env.JWT_SECRET = 'testsecret';
process.env.JWT_REFRESH_SECRET = 'testrefreshsecret';

// Increase Jest timeout (if needed)
jest.setTimeout(60000);

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index'; 
import Business from '../models/Business';
import User from '../models/User';

describe('Business API Routes with Test Database', () => {
  let ownerId: string;
  let businessId: string;

  // Before all tests, connect to the test DB, clear collections, and create a dummy owner
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
    // Clear existing data
    await Business.deleteMany({});
    await User.deleteMany({});

    // Create a dummy user to be the owner
    const testOwner = new User({
      email: 'owner@test.com',
      password: 'hashedpassword', // Password value is not important for these tests
      name: 'Test Owner',
      role: 'admin'
    });
    await testOwner.save();
    ownerId = testOwner._id.toString();
  });

  // After all tests, clear data and disconnect from the DB
  afterAll(async () => {
    await Business.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  describe('POST /api/v1/business', () => {
    it('should create a new business', async () => {
      const res = await request(app)
        .post('/api/v1/business')
        .send({
          name: 'Test Business',
          owner: ownerId,
          industry: 'Tech',
          businessType: 'b2b',
          platform: 'Web',
          supportSize: 'Large',
          supportChannels: ['email', 'phone'],
          websiteTraffic: '10000',
          monthlyConversations: '500',
          goals: ['increase sales', 'improve support'],
          subscriptionPlan: 'pro',
          aiIntegrations: { website: true, whatsapp: false, api: true, integrationDetails: {} },
          analytics: { totalTickets: 100, resolvedTickets: 90, avgResponseTime: 5, customerSatisfaction: 80 }
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('_id');
      businessId = res.body.data._id;
    });
  });

  describe('GET /api/v1/business', () => {
    it('should fetch all businesses with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/business?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      // Ensure at least one business is returned
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/business/:id', () => {
    it('should fetch a business by id', async () => {
      const res = await request(app)
        .get(`/api/v1/business/${businessId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('_id', businessId);
    });

    it('should return 404 for a non-existent business', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/v1/business/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Business not found');
    });
  });

  describe('PUT /api/v1/business/:id', () => {
    it('should update business details', async () => {
      const res = await request(app)
        .put(`/api/v1/business/${businessId}`)
        .send({ name: 'Updated Business Name' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Updated Business Name');
    });
  });

  describe('DELETE /api/v1/business/:id', () => {
    it('should delete a business', async () => {
      const res = await request(app)
        .delete(`/api/v1/business/${businessId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Business deleted successfully');
    });
  });
});
