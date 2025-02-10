const express = require('express');
const EquipmentController = require('../controllers/equipmentController.js'); 
const authenticateToken = require('../middleware/authenticateToken.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройка хранилища для загрузки изображений оборудования
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/equipment');
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

router.post('/', authenticateToken, upload.single('photo'), EquipmentController.create);
router.get('/', EquipmentController.findAll);
router.get('/supplier/:supplierId', EquipmentController.findBySupplier);
router.get('/:id', EquipmentController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), EquipmentController.update);
router.delete('/:id', authenticateToken, EquipmentController.delete);

module.exports = router;
