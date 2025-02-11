const {
    Order,
    OrderItem,
    Cart,
    CartItem,
    Equipment,
    User,
    Supplier,
    SupplierReview
} = require('../models/models');

class OrderController {

    
    async createOrder(req, res) {
        try {
            const { deliveryAddress, description } = req.body;
            const userId = req.user.userId;

            console.log('User ID:', userId);

            const cart = await Cart.findOne({
                where: { userId },
                include: [
                    {
                        model: CartItem,
                        include: [Equipment],
                    },
                ],
            });

            console.log('Cart:', cart);

            if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
                return res.status(400).json({ message: 'Ваша корзина пуста' });
            }

            
            const totalCost = cart.CartItems.reduce(
                (acc, item) => acc + item.Equipment.price * item.quantity,
                0
            );

            
            const supplierIds = [...new Set(cart.CartItems.map(item => item.Equipment.supplierId))];
            if (supplierIds.length > 1) {
                return res.status(400).json({ message: 'Все товары должны принадлежать одному поставщику' });
            }

            
            const order = await Order.create({
                deliveryAddress,
                description,
                totalCost,
                orderName: cart.CartItems
                    .map(item => `${item.Equipment.name} x ${item.quantity}`)
                    .join('; '),
                status: 'на рассмотрении',
                dateOfOrdering: new Date(),
                userId,
                supplierId: supplierIds[0],
            });

            
            const orderItems = cart.CartItems.map(item => ({
                orderId: order.id,
                equipmentId: item.equipmentId, 
                quantity: item.quantity,
            }));

            await OrderItem.bulkCreate(orderItems);

            
            await CartItem.destroy({ where: { cartId: cart.id } });

            console.log('Order created successfully:', order);
            res.status(201).json({ message: 'Заказ успешно создан', order });
        } catch (error) {
            console.error('Ошибка при создании заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Неавторизованный пользователь' });
            }

            const orders = await Order.findAll({
                where: { userId },
                include: [
                    {
                        model: OrderItem,
                        include: [Equipment],
                    },
                    {
                        model: SupplierReview,
                        include: [{ model: User, attributes: ['firstName', 'lastName'] }],
                    },
                ],
                order: [['dateOfOrdering', 'DESC']],
            });

            res.json(orders);
        } catch (error) {
            console.error('Ошибка при получении заказов пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async getOrderById(req, res) {
        try {
            const { id } = req.params;

            const order = await Order.findByPk(id, {
                include: [
                    {
                        model: OrderItem,
                        include: [Equipment],
                    },
                    {
                        model: SupplierReview,
                        include: [{ model: User, attributes: ['firstName', 'lastName'] }],
                    },
                ],
            });

            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            res.json(order);
        } catch (error) {
            console.error('Ошибка при получении заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await Order.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            const allowedStatuses = ['на рассмотрении', 'выполняется', 'выполнен', 'отменён'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ message: 'Недопустимый статус заказа' });
            }

            order.status = status;
            await order.save();

            res.json(order);
        } catch (error) {
            console.error('Ошибка при обновлении статуса заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async updateOrderCompletionTime(req, res) {
        try {
            const { id } = req.params;
            const { completionTime } = req.body;

            const order = await Order.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            
            const supplierId = req.user.supplierId;
            if (order.supplierId !== supplierId) {
                return res.status(403).json({ message: 'У вас нет прав для обновления этого заказа.' });
            }

            order.completionTime = completionTime;
            await order.save();

            res.json({ message: 'Время выполнения заказа обновлено.', order });
        } catch (error) {
            console.error('Ошибка при обновлении времени выполнения заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async deleteOrder(req, res) {
        try {
            const { id } = req.params;

            const order = await Order.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: 'Заказ не найден' });
            }

            if (order.userId !== req.user.userId) {
                return res.status(403).json({ message: 'Нет прав для удаления этого заказа' });
            }

            await OrderItem.destroy({ where: { orderId: id } });
            await order.destroy();

            res.status(200).json({ message: 'Заказ успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async getSupplierOrders(req, res) {
        try {
            const supplierId = req.user.supplierId;
            console.log('Получение заказов для поставщика ID:', supplierId);
            if (!supplierId) {
                return res.status(401).json({ message: 'Неавторизованный пользователь' });
            }

            const supplier = await Supplier.findByPk(supplierId);
            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }

            const orders = await Order.findAll({
                where: { supplierId: supplier.id },
                include: [
                    {
                        model: User,
                        attributes: ['firstName', 'lastName', 'phone'],
                    },
                    {
                        model: OrderItem,
                        include: [Equipment],
                    },
                ],
                order: [['dateOfOrdering', 'DESC']],
            });

            res.json(orders);
        } catch (error) {
            console.error('Ошибка при получении заказов поставщика:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new OrderController();
