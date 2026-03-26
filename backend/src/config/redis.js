const { createClient } = require('redis');

/**
 * Redis client for LogiCore.
 * Used for: live trip state cache, JWT session storage, Socket.io pub-sub.
 */
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
    console.error('Redis client error:', err.message);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected');
});

/**
 * Test Redis connectivity.
 * @returns {Promise<boolean>}
 */
async function testRedisConnection() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        await redisClient.ping();
        return true;
    } catch (err) {
        console.error('Redis connection failed:', err.message);
        return false;
    }
}

/**
 * Connect to Redis (call once at startup).
 */
async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}

module.exports = { redisClient, testRedisConnection, connectRedis };
