const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Нет токена, доступ запрещён' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded.userId) {
            return res.status(403).json({ message: 'Токен недействителен или отсутствует userId' });
        }

        req.user = { userId: decoded.userId };
        next();
    });
};

module.exports = authenticateUser;
