const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errors = error.details.map(err => ({ field: err.path.join('.'), message: err.message }));
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        req.body = value;
        next();
    };
};

// Common schemas can go here
const schemas = {
    login: Joi.object({
        email: Joi.string().email().optional(),
        phone: Joi.string().optional(),
        password: Joi.string().required()
    }).or('email', 'phone')
};

module.exports = { validate, schemas };
