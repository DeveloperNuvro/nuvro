// import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// const redisClient = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379',
// });

// redisClient.on('error', (err) => console.error('❌ Redis Error:', err));

// redisClient.connect().then(() => console.log('✅ Redis Connected'));




import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: 'Li6e4dfBBu5EEu4IEkW228xbL1lvGT8n',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 13313
    }
});

redisClient.on('error', (err) => console.error('❌ Redis Error:', err));

redisClient.connect().then(() => console.log('✅ Redis Connected'));


export default redisClient;