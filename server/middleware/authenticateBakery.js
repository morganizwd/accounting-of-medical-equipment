const jwt = require('jsonwebtoken');

const authenticateMetiz = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Нет токена, доступ запрещён' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded.metizId) {
            return res.status(403).json({ message: 'Токен недействителен или отсутствует metizId' });
        }

        req.user = { metizId: decoded.metizId };
        next();
    });
};

module.exports = authenticateMetiz;
