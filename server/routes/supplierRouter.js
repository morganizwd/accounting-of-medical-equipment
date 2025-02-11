const express = require('express');
const SupplierController = require('../controllers/supplierController');
const authenticateToken = require('../middleware/authenticateToken');
const OrderController = require('../controllers/orderController'); 
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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

router.get('/orders', authenticateToken, OrderController.getSupplierOrders);

router.post('/registration', upload.single('logo'), SupplierController.registration);

router.post('/login', SupplierController.login);

router.get('/auth', authenticateToken, SupplierController.auth);

router.get('/', SupplierController.findAll);

router.get('/:id', SupplierController.findOne);

router.put('/:id', authenticateToken, upload.single('logo'), SupplierController.update);

router.delete('/:id', authenticateToken, SupplierController.delete);

module.exports = router;
