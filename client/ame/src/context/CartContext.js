import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from './AuthContext';
import { Snackbar, Alert } from '@mui/material';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { authData } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (authData.isAuthenticated) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [authData.isAuthenticated, authData.token]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            // Обновлённый эндпоинт для корзины
            const response = await axios.get('/api/carts', {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            console.log('Полученные CartItems:', response.data.CartItems);
            setCartItems(response.data.CartItems || []);
        } catch (error) {
            console.error('Ошибка при получении корзины:', error);
            setError('Не удалось загрузить корзину.');
            handleSnackbarOpen('Не удалось загрузить корзину.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarOpen = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Функция добавления оборудования в корзину
    const addToCart = async (equipment, quantity) => {
        // Проверяем, что товары в корзине принадлежат одному поставщику
        if (cartItems.length > 0 && cartItems[0].Equipment.supplierId !== equipment.supplierId) {
            setError('Вы можете добавлять товары только от одного поставщика.');
            handleSnackbarOpen('Вы можете добавлять товары только от одного поставщика.', 'error');
            return;
        }

        try {
            // Эндпоинт для добавления в корзину обновлён на /api/carts/add
            const response = await axios.post(
                '/api/carts/add',
                { equipmentId: equipment.id, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );
            const addedItem = response.data;
            setCartItems((prevItems) => {
                const existingItem = prevItems.find(item => item.equipmentId === addedItem.equipmentId);
                if (existingItem) {
                    return prevItems.map(item =>
                        item.equipmentId === addedItem.equipmentId
                            ? { ...item, quantity: item.quantity + addedItem.quantity }
                            : item
                    );
                } else {
                    return [...prevItems, addedItem];
                }
            });
            handleSnackbarOpen(`Добавлено ${quantity} x ${equipment.name} в корзину!`, 'success');
        } catch (error) {
            console.error('Ошибка при добавлении товара в корзину:', error);
            setError(error.response?.data?.message || 'Не удалось добавить товар в корзину.');
            handleSnackbarOpen(error.response?.data?.message || 'Не удалось добавить товар в корзину.', 'error');
        }
    };

    // Функция удаления оборудования из корзины
    const removeFromCart = async (equipmentId) => {
        try {
            await axios.delete(`/api/carts/remove/${equipmentId}`, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setCartItems((prevItems) => prevItems.filter(item => item.equipmentId !== equipmentId));
            handleSnackbarOpen('Товар успешно удален из корзины.', 'success');
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
            setError('Не удалось удалить товар из корзины.');
            handleSnackbarOpen('Не удалось удалить товар из корзины.', 'error');
        }
    };

    // Функция обновления количества оборудования в корзине
    const updateQuantity = async (equipmentId, quantity) => {
        try {
            const response = await axios.put(
                `/api/carts/update/${equipmentId}`,
                { quantity },
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );
            const updatedItem = response.data;
            setCartItems((prevItems) =>
                prevItems.map(item =>
                    item.equipmentId === updatedItem.equipmentId
                        ? { ...item, quantity: updatedItem.quantity }
                        : item
                )
            );
            handleSnackbarOpen('Количество товара обновлено.', 'success');
        } catch (error) {
            console.error('Ошибка при обновлении количества товара в корзине:', error);
            setError('Не удалось обновить количество товара в корзине.');
            handleSnackbarOpen('Не удалось обновить количество товара в корзине.', 'error');
        }
    };

    // Функция очистки корзины
    const clearCart = async () => {
        try {
            await axios.delete('/api/carts/clear', {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setCartItems([]);
            handleSnackbarOpen('Корзина успешно очищена.', 'success');
        } catch (error) {
            console.error('Ошибка при очистке корзины:', error);
            setError('Не удалось очистить корзину.');
            handleSnackbarOpen('Не удалось очистить корзину.', 'error');
        }
    };

    // Вычисляем общую сумму заказа
    const totalAmount = cartItems.reduce((acc, item) => {
        if (item.Equipment && item.Equipment.price) {
            return acc + item.Equipment.price * item.quantity;
        }
        return acc;
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart, // Убедитесь, что функция присутствует
            totalAmount,
            loading,
            error,
            fetchCart,
        }}>
            {children}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </CartContext.Provider>
    );
};
