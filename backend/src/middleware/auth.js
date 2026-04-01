const authenticate = (req, res, next) => {
    req.user = { id: 'a0000001-0000-0000-0000-000000000001', role: 'manager', name: 'Demo User' };
    next();
};

const authorize = (...roles) => {
    return (req, res, next) => {
        next();
    };
};

module.exports = { authenticate, authorize };
