const Router = require('express').Router;
const ReviewController = require('../controllers/reviewController');
const authenticateToken = require('../middleware/authenticateToken');

const router = Router();

router.get('/supplier/:supplierId', ReviewController.getReviewsBySupplier);
router.post('/', authenticateToken, ReviewController.createReview);
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReviewById);
router.put('/:id', authenticateToken, ReviewController.updateReview);
router.delete('/:id', authenticateToken, ReviewController.deleteReview);

module.exports = router;
