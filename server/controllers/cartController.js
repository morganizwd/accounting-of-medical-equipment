const { Cart, CartItem, Equipment, User } = require('../models/models');

class CartController {
    
    async getCart(req, res) {
        try {
            const userId = req.user.userId;
            console.log(`Получение корзины для пользователя ID: ${userId}`);

            let cart = await Cart.findOne({
                where: { userId },
                include: [
                    {
                        model: CartItem,
                        include: [Equipment],
                    },
                ],
            });

            if (!cart) {
                console.log('Корзина отсутствует. Создание новой корзины.');
                cart = await Cart.create({ userId });
            }

            console.log('Полученная корзина:', cart);
            res.json(cart);
        } catch (error) {
            console.error('Ошибка при получении корзины:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async addItem(req, res) {
        try {
            const userId = req.user.userId;
            const { equipmentId, quantity } = req.body;

            
            const equipment = await Equipment.findByPk(equipmentId);
            if (!equipment) {
                return res.status(404).json({ message: 'Оборудование не найдено.' });
            }

            let cart = await Cart.findOne({
                where: { userId },
                include: [{
                    model: CartItem,
                    include: [Equipment],
                }],
            });

            if (!cart) {
                cart = await Cart.create({ userId });
            }

            
            if (cart.CartItems && cart.CartItems.length > 0) {
                const existingSupplierId = cart.CartItems[0].Equipment.supplierId;
                if (existingSupplierId !== equipment.supplierId) {
                    return res.status(400).json({ message: 'В корзине могут быть товары только от одного поставщика.' });
                }
            }

            let cartItem = await CartItem.findOne({
                where: { cartId: cart.id, equipmentId },
                include: [Equipment],
            });

            if (cartItem) {
                cartItem.quantity += quantity;
                await cartItem.save();
            } else {
                cartItem = await CartItem.create({
                    cartId: cart.id,
                    equipmentId,
                    quantity,
                });
                cartItem = await CartItem.findByPk(cartItem.id, { include: [Equipment] });
            }

            res.status(201).json(cartItem);
        } catch (error) {
            console.error('Ошибка при добавлении товара в корзину:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async removeItem(req, res) {
        try {
            const userId = req.user.userId;
            const { equipmentId } = req.params;

            const cart = await Cart.findOne({ where: { userId } });
            if (!cart) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            const cartItem = await CartItem.findOne({
                where: { cartId: cart.id, equipmentId },
            });

            if (!cartItem) {
                return res.status(404).json({ message: 'Оборудование в корзине не найдено' });
            }

            await cartItem.destroy();

            res.status(200).json({ message: 'Товар успешно удален из корзины' });
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async updateItemQuantity(req, res) {
        try {
            const userId = req.user.userId;
            const { equipmentId } = req.params;
            const { quantity } = req.body;

            const cart = await Cart.findOne({ where: { userId } });
            if (!cart) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            const cartItem = await CartItem.findOne({
                where: { cartId: cart.id, equipmentId },
            });

            if (!cartItem) {
                return res.status(404).json({ message: 'Оборудование в корзине не найдено' });
            }

            cartItem.quantity = quantity;
            await cartItem.save();

            res.status(200).json(cartItem);
        } catch (error) {
            console.error('Ошибка при обновлении количества товара в корзине:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    
    async clearCart(req, res) {
        try {
            const userId = req.user.userId;

            const cart = await Cart.findOne({ where: { userId } });
            if (!cart) {
                return res.status(404).json({ message: 'Корзина не найдена' });
            }

            await CartItem.destroy({ where: { cartId: cart.id } });

            res.status(200).json({ message: 'Корзина успешно очищена' });
        } catch (error) {
            console.error('Ошибка при очистке корзины:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new CartController();
