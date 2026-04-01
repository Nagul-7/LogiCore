const crypto = require('crypto');

const qrService = {
    generateTokenHash: (trip_id) => {
        // Dummy hash for demo
        return crypto.createHash('sha256').update(trip_id + Date.now().toString()).digest('hex');
    }
};

module.exports = qrService;
