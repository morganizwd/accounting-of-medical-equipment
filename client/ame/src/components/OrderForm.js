// src/components/OrderForm.js

import React, { useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

function OrderForm() {
    const { clearCart, cartItems } = useContext(CartContext);
    const { authData } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        deliveryAddress: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Добавьте проверку на пустую корзину
        if (cartItems.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/orders', formData, {
                headers: { Authorization: `Bearer ${authData.token}` },
            });

            // Добавьте обновление состояния после успешного заказа
            await clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Ошибка: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Оформление заказа
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
                <TextField
                    label="Адрес доставки"
                    name="deliveryAddress"
                    required
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                />
                <TextField
                    label="Пожелания"
                    name="description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ padding: '10px 20px', fontSize: '16px' }}
                >
                    {loading ? 'Оформление...' : 'Сформировать заказ'}
                </Button>
            </Box>
        </Container>
    );
}

export default OrderForm;
