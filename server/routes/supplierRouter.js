const express = require('express');
const SupplierController = require('../controllers/supplierController');
const authenticateToken = require('../middleware/authenticateToken');
const OrderController = require('../controllers/orderController'); // если используется для получения заказов поставщика
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройка хранилища для логотипов поставщиков
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/supplier');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Получение заказов поставщика (если OrderController адаптирован для работы с поставщиками)
router.get('/orders', authenticateToken, OrderController.getSupplierOrders);

// Регистрация поставщика (поле логотипа передаётся через поле "logo")
router.post('/registration', upload.single('logo'), SupplierController.registration);

// Вход поставщика
router.post('/login', SupplierController.login);

// Аутентификация поставщика
router.get('/auth', authenticateToken, SupplierController.auth);

// Получение списка поставщиков
router.get('/', SupplierController.findAll);

// Получение информации о поставщике по ID
router.get('/:id', SupplierController.findOne);

// Обновление данных поставщика
router.put('/:id', authenticateToken, upload.single('logo'), SupplierController.update);

// Удаление поставщика
router.delete('/:id', authenticateToken, SupplierController.delete);

module.exports = router;
