const express = require('express');
const OrderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Создание заказа
router.post('/', authenticateToken, OrderController.createOrder);

// Получение заказов пользователя
router.get('/', authenticateToken, OrderController.getUserOrders);

// Получение конкретного заказа по ID
router.get('/:id', authenticateToken, OrderController.getOrderById);

// Обновление статуса заказа
router.put('/:id/status', authenticateToken, OrderController.updateOrderStatus);

// Обновление времени выполнения заказа (только для поставщика)
router.put('/:id/completion-time', authenticateToken, OrderController.updateOrderCompletionTime);

// Удаление заказа
router.delete('/:id', authenticateToken, OrderController.deleteOrder);

module.exports = router;
