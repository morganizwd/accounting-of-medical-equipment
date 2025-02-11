const express = require('express');
const OrderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post('/', authenticateToken, OrderController.createOrder);


router.get('/', authenticateToken, OrderController.getUserOrders);


router.get('/:id', authenticateToken, OrderController.getOrderById);


router.put('/:id/status', authenticateToken, OrderController.updateOrderStatus);


router.put('/:id/completion-time', authenticateToken, OrderController.updateOrderCompletionTime);


router.delete('/:id', authenticateToken, OrderController.deleteOrder);

module.exports = router;
