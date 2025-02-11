const { Equipment, Supplier } = require('../models/models');
const fs = require('fs');
const path = require('path');

class EquipmentController {
    
    async create(req, res) {
        try {
            const { name, model, description, price, serialNumber } = req.body;
            const supplierId = req.user.supplierId;

            if (!supplierId) {
                return res.status(403).json({ message: 'Нет прав для создания оборудования' });
            }

            const supplier = await Supplier.findByPk(supplierId);
            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }

            const equipment = await Equipment.create({
                name,
                model,
                description,
                price,
                serialNumber,
                supplierId,
                photo: req.file ? `/uploads/equipment/${req.file.filename}` : null,
            });

            res.status(201).json(equipment);
        } catch (error) {
            console.error('Ошибка при создании оборудования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async findOne(req, res) {
        try {
            const equipment = await Equipment.findByPk(req.params.id, {
                include: [{ model: Supplier }],
            });
            if (!equipment) {
                return res.status(404).json({ message: 'Оборудование не найдено' });
            }
            res.json(equipment);
        } catch (error) {
            console.error('Ошибка при получении оборудования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async findAll(req, res) {
        try {
            const equipments = await Equipment.findAll({
                include: [{ model: Supplier }],
            });
            res.json(equipments);
        } catch (error) {
            console.error('Ошибка при получении списка оборудования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async update(req, res) {
        try {
            const { name, description, price } = req.body;
            const equipmentId = req.params.id;

            const equipment = await Equipment.findByPk(equipmentId);
            if (!equipment) {
                return res.status(404).json({ message: 'Оборудование не найдено' });
            }

            let updatedData = { name, description, price };

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/equipment');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const photoPath = `/uploads/equipment/${equipmentId}_${req.file.originalname}`;
                const filePath = path.join(uploadDir, `${equipmentId}_${req.file.originalname}`);

                fs.writeFileSync(filePath, fs.readFileSync(req.file.path));
                updatedData.photo = photoPath;
            }

            await equipment.update(updatedData);

            res.json(equipment);
        } catch (error) {
            console.error('Ошибка при обновлении оборудования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async delete(req, res) {
        try {
            const equipment = await Equipment.findByPk(req.params.id);
            if (!equipment) {
                return res.status(404).json({ message: 'Оборудование не найдено' });
            }

            await equipment.destroy();

            res.status(200).json({ message: 'Оборудование успешно удалено' });
        } catch (error) {
            console.error('Ошибка при удалении оборудования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async findBySupplier(req, res) {
        try {
            const { supplierId } = req.params;

            const supplier = await Supplier.findByPk(supplierId);
            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }

            const equipments = await Equipment.findAll({ where: { supplierId } });

            res.json(equipments);
        } catch (error) {
            console.error('Ошибка при получении оборудования поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new EquipmentController();
