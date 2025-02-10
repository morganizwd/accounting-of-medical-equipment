import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import OrderForm from './OrderForm';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    Box,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, totalAmount, loading, error, clearCart } = useContext(CartContext);
    const [showOrderForm, setShowOrderForm] = useState(false);

    const handleQuantityChange = (equipmentId, value) => {
        const qty = parseInt(value, 10);
        if (qty >= 1) {
            updateQuantity(equipmentId, qty);
        }
    };

    const toggleOrderForm = () => {
        setShowOrderForm(!showOrderForm);
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h3" component="h1" gutterBottom>
                Корзина
            </Typography>
            {loading ? (
                <Box sx={{ textAlign: 'center', marginTop: '50px' }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ marginTop: '20px' }}>
                        Загрузка корзины...
                    </Typography>
                </Box>
            ) : cartItems.length === 0 ? (
                <Typography variant="body1">
                    Ваша корзина пуста. <Link to="/">Перейти к покупкам</Link>
                </Typography>
            ) : (
                <Box>
                    {error && (
                        <Alert severity="error" sx={{ marginBottom: '20px' }}>
                            {error}
                        </Alert>
                    )}
                    <Grid container spacing={4}>
                        {cartItems.map(item => (
                            <Grid item xs={12} key={item.equipmentId}>
                                <Card sx={{ display: 'flex', marginBottom: '20px' }}>
                                    {item.Equipment && item.Equipment.photo && (
                                        <CardMedia
                                            component="img"
                                            image={`http://localhost:5000${item.Equipment.photo}`}
                                            alt={item.Equipment.name}
                                            sx={{ width: 150, height: 'auto' }}
                                        />
                                    )}
                                    <CardContent sx={{ flex: 1 }}>
                                        <Typography variant="h5" component="h3">
                                            {item.Equipment ? item.Equipment.name : 'Оборудование не найдено'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {item.Equipment ? item.Equipment.description : 'Описание отсутствует'}
                                        </Typography>
                                        <Typography variant="body1" color="text.primary">
                                            Цена за единицу: {item.Equipment ? item.Equipment.price : '0'} ₽
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                            <TextField
                                                label="Количество"
                                                type="number"
                                                inputProps={{ min: 1 }}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.equipmentId, e.target.value)}
                                                sx={{ width: '80px', marginRight: '10px' }}
                                            />
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => removeFromCart(item.equipmentId)}
                                            >
                                                Удалить
                                            </Button>
                                        </Box>
                                        <Typography variant="body1" sx={{ marginTop: '10px' }}>
                                            Итого: {item.Equipment ? item.Equipment.price * item.quantity : 0} ₽
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Divider sx={{ marginY: '20px' }} />
                    <Typography variant="h4" component="h2">
                        Общая сумма: {totalAmount} ₽
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={toggleOrderForm}
                        disabled={cartItems.length === 0} // Блокировка кнопки при пустой корзине
                        sx={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}
                    >
                        {showOrderForm ? 'Отмена' : 'Сформировать заказ'}
                    </Button>
                    {showOrderForm && (
                        <Box sx={{ marginTop: '20px' }}>
                            <OrderForm />
                        </Box>
                    )}
                </Box>
            )}
        </Container>
    );
}

export default Cart;