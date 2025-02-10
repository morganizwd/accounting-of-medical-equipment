const { Supplier, Equipment, SupplierReview, User, sequelize } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

class SupplierController {
    // Регистрация поставщика
    async registration(req, res) {
        try {
            const {
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                password,
                address,
            } = req.body;

            const existingSupplier = await Supplier.findOne({ where: { email } });
            if (existingSupplier) {
                return res.status(400).json({ message: 'Поставщик с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const supplier = await Supplier.create({
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                password: passwordHash,
                address,
                logo: req.file ? `/uploads/supplier/${req.file.filename}` : null,
            });

            res.status(201).json(supplier);
        } catch (error) {
            console.error('Ошибка при регистрации поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход поставщика
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const supplier = await Supplier.findOne({ where: { email } });
            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }

            const isMatch = await bcrypt.compare(password, supplier.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { supplierId: supplier.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({ token, user: supplier });
        } catch (error) {
            console.error('Ошибка при входе поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Аутентификация поставщика
    async auth(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const supplier = await Supplier.findByPk(decoded.supplierId);

            res.json(supplier);
        } catch (error) {
            console.error('Ошибка при аутентификации поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение информации о поставщике по ID
    async findOne(req, res) {
        try {
            const { id } = req.params;

            const supplier = await Supplier.findByPk(id, {
                include: [
                    { model: Equipment },
                    {
                        model: SupplierReview,
                        include: [{ model: User, attributes: ['firstName', 'lastName'] }]
                    },
                ],
            });

            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }

            res.json(supplier);
        } catch (error) {
            console.error('Ошибка при получении поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка поставщиков с фильтрами и вычисляемой средней оценкой
    async findAll(req, res) {
        try {
            const { companyName, address, averageRating, limit, offset } = req.query;

            const whereConditions = {};
            if (companyName) {
                whereConditions.companyName = { [Op.iLike]: `%${companyName}%` };
            }
            if (address) {
                whereConditions.address = { [Op.iLike]: `%${address}%` };
            }

            let havingConditions = null;
            if (averageRating) {
                havingConditions = sequelize.where(
                    sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('SupplierReviews.rating')), 1),
                    {
                        [Op.gte]: parseFloat(averageRating)
                    }
                );
            }

            const { rows, count } = await Supplier.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: SupplierReview,
                        attributes: [],
                    },
                ],
                attributes: {
                    include: [
                        [
                            sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('SupplierReviews.rating')), 1),
                            'averageRating'
                        ],
                        [
                            sequelize.fn('COUNT', sequelize.col('SupplierReviews.id')),
                            'reviewCount'
                        ],
                    ],
                },
                group: ['Supplier.id'],
                having: havingConditions,
                order: [['companyName', 'ASC']],
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
                subQuery: false,
            });

            res.json({
                suppliers: rows,
                total: count.length,
            });
        } catch (error) {
            console.error('Ошибка при получении списка поставщиков:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление информации о поставщике
    async update(req, res) {
        try {
            const {
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                password,
                address,
            } = req.body;
            const supplierId = req.params.id;

            const supplier = await Supplier.findByPk(supplierId);
            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }

            let updatedData = {
                companyName,
                contactPerson,
                registrationNumber,
                phone,
                description,
                email,
                address,
            };
            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/supplier');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const logoPath = `/uploads/supplier/${supplierId}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${supplierId}_${req.file.originalname}`), fs.readFileSync(req.file.path));
                updatedData.logo = logoPath;
            }

            await supplier.update(updatedData);

            res.json(supplier);
        } catch (error) {
            console.error('Ошибка при обновлении поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление поставщика
    async delete(req, res) {
        try {
            const supplier = await Supplier.findByPk(req.params.id);
            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }

            await supplier.destroy();

            res.status(200).json({ message: 'Поставщик успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new SupplierController();
