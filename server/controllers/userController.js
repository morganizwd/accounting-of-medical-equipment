const { User } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class UserController {
    async registration(req, res) {
        try {
            
            const { firstName, lastName, email, password, phone, birthDate, description } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            let photoPath = null;
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/users');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                photoPath = `/uploads/users/${Date.now()}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${Date.now()}_${req.file.originalname}`), req.file.buffer);
            }

            
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: passwordHash,
                phone,
                birthDate,
                description,
                photo: photoPath,
            });

            res.status(201).json(user);
        } catch (error) {
            console.error('Ошибка при регистрации пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );
            res.json({ token, userId: user.id });
        } catch (error) {
            console.error('Ошибка при входе пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async auth(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const user = await User.findByPk(decoded.userId);
            res.json(user);
        } catch (error) {
            console.error('Ошибка при аутентификации пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findOne(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json(user);
        } catch (error) {
            console.error('Ошибка при получении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async findAll(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            console.error('Ошибка при получении списка пользователей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const { firstName, lastName, email, password, phone, birthDate, description } = req.body;
            const userId = req.params.id;

            if (req.user.userId !== parseInt(userId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            let updatedData = { firstName, lastName, email, phone, birthDate, description };
            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/users');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const photoPath = `/uploads/users/${userId}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${userId}_${req.file.originalname}`), req.file.buffer);
                updatedData.photo = photoPath;
            }

            await user.update(updatedData);
            res.json(user);
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async delete(req, res) {
        try {
            const userId = req.params.id;

            if (req.user.userId !== parseInt(userId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            await user.destroy();
            res.status(200).json({ message: 'Пользователь успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new UserController();
