const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        console.log('Decoded token:', decoded);

        if (decoded.userId) {
            req.user = { userId: decoded.userId };
        } else if (decoded.supplierId) {
            req.user = { supplierId: decoded.supplierId };
        } else {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        next();
    } catch (e) {
        console.error('Ошибка в authenticateToken middleware:', e);
        res.status(401).json({ message: 'Не авторизован' });
    }
};
