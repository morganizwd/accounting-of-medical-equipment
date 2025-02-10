const Router = require('express').Router;
const CartController = require('../controllers/cartController');
const authenticateToken = require('../middleware/authenticateToken');

const router = Router();

router.get('/', authenticateToken, CartController.getCart);

router.post('/add', authenticateToken, CartController.addItem);

router.delete('/remove/:productId', authenticateToken, CartController.removeItem);

router.put('/update/:productId', authenticateToken, CartController.updateItemQuantity);

router.delete('/clear', authenticateToken, CartController.clearCart);

module.exports = router;
