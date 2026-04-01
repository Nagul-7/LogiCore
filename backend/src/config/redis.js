const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 20) {
                return new Error('Redis max retries reached');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connected'));

async function testRedisConnection() {
    try {
        if (!redisClient.isOpen) await redisClient.connect();
        await redisClient.ping();
        return true;
    } catch (err) {
        console.error('Redis connection test error', err);
        return false;
    }
}

module.exports = { redisClient, testRedisConnection };
