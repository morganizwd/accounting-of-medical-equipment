const Router = require('express').Router;
const router = new Router();

router.use('/users', require('./userRouter'));
router.use('/reviews', require('./reviewRouter'));
router.use('/equipments', require('./equipmentRouter'));
router.use('/supplier', require('./supplierRouter')); 
router.use('/orders', require('./orderRouter'));
router.use('/carts', require('./cartRouter'));

module.exports = router;
