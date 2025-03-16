"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { createClient } from 'redis';
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const redisClient = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379',
// });
// redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
// redisClient.connect().then(() => console.log('✅ Redis Connected'));
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    username: 'default',
    password: 'Li6e4dfBBu5EEu4IEkW228xbL1lvGT8n',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 13313
    }
});
redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
redisClient.connect().then(() => console.log('✅ Redis Connected'));
exports.default = redisClient;
