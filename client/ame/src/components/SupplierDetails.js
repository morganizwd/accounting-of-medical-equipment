// src/components/SupplierDetails.js

import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TextField,
    CircularProgress,
    Box,
    Divider,
    Alert,
} from '@mui/material';

function SupplierDetails() {
    const { id } = useParams(); // supplier id
    const { cartItems, addToCart, clearCart } = useContext(CartContext);
    const { authData } = useContext(AuthContext);
    const [supplier, setSupplier] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSupplier();
        fetchReviews();
    }, [id]);

    const fetchSupplier = async () => {
        try {
            const response = await axios.get(`/api/supplier/${id}`);
            setSupplier(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении информации о поставщике:', error);
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/reviews/supplier/${id}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
        }
    };

    const handleQuantityChange = (equipmentId, value) => {
        const qty = parseInt(value, 10);
        if (qty >= 1) {
            setQuantities((prev) => ({ ...prev, [equipmentId]: qty }));
        }
    };

    const handleAddToCart = async (equipment) => {
        const quantity = quantities[equipment.id] || 1;
        try {
            await addToCart(equipment, quantity);
        } catch (err) {
            setError(err.message);
        }
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (total / reviews.length).toFixed(1);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<FaStar key={i} color="#FFD700" />);
            } else if (rating >= i - 0.5) {
                stars.push(<FaStarHalfAlt key={i} color="#FFD700" />);
            } else {
                stars.push(<FaRegStar key={i} color="#ccc" />);
            }
        }
        return stars;
    };

    // Проверяем, что товары в корзине принадлежат тому же поставщику
    const isDifferentSupplier =
        cartItems.length > 0 && cartItems[0].Equipment.supplierId !== parseInt(id, 10);

    return (
        <Container sx={{ padding: '20px' }}>
            {loading ? (
                <Box sx={{ textAlign: 'center', marginTop: '50px' }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ marginTop: '20px' }}>
                        Загрузка информации о поставщике...
                    </Typography>
                </Box>
            ) : supplier ? (
                <Box>
                    <Typography variant="h3" component="h1" gutterBottom>
                        {supplier.companyName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <Typography variant="h6" sx={{ marginRight: '8px' }}>
                            Рейтинг:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {renderStars(calculateAverageRating())}
                            <Typography variant="h6" sx={{ marginLeft: '8px' }}>
                                {calculateAverageRating()} / 5
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ marginLeft: '8px', color: '#555' }}>
                            ({reviews.length} отзывов)
                        </Typography>
                    </Box>

                    {supplier.logo && (
                        <CardMedia
                            component="img"
                            image={`http://localhost:5000${supplier.logo}`}
                            alt={supplier.companyName}
                            sx={{ width: '300px', height: 'auto', marginBottom: '20px' }}
                        />
                    )}
                    <Typography variant="body1" paragraph>
                        {supplier.description}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Адрес: {supplier.address}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Телефон: {supplier.phone}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Контактное лицо: {supplier.contactPerson}
                    </Typography>

                    <Typography variant="h4" component="h2" gutterBottom>
                        Оборудование
                    </Typography>

                    {isDifferentSupplier && (
                        <Box
                            sx={{
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #f44336',
                                borderRadius: '4px',
                                backgroundColor: '#ffebee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="body1" color="error">
                                В корзине уже есть товары из другого поставщика. Пожалуйста, очистите корзину перед добавлением нового оборудования.
                            </Typography>
                            <Button variant="outlined" color="error" onClick={() => clearCart()}>
                                Очистить корзину
                            </Button>
                        </Box>
                    )}

                    {/* Обратите внимание: Используем свойство "Equipment" (с заглавной буквы), как возвращается из Sequelize */}
                    {supplier.Equipment && supplier.Equipment.length > 0 ? (
                        <Grid container spacing={4}>
                            {supplier.Equipment.map((equipment) => (
                                <Grid item xs={12} sm={6} md={4} key={equipment.id}>
                                    <Card>
                                        {equipment.photo && (
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={`http://localhost:5000${equipment.photo}`}
                                                alt={equipment.name}
                                            />
                                        )}
                                        <CardContent>
                                            <Typography variant="h5" component="h3">
                                                {equipment.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {equipment.description}
                                            </Typography>
                                            <Typography variant="body1" color="text.primary" paragraph>
                                                Цена: {equipment.price} ₽
                                            </Typography>
                                            {authData.isAuthenticated && (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <TextField
                                                        label="Количество"
                                                        type="number"
                                                        inputProps={{ min: 1 }}
                                                        value={quantities[equipment.id] || 1}
                                                        onChange={(e) => handleQuantityChange(equipment.id, e.target.value)}
                                                        sx={{ width: '80px', marginRight: '10px' }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleAddToCart(equipment)}
                                                        disabled={isDifferentSupplier}
                                                    >
                                                        Добавить в корзину
                                                    </Button>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography variant="body1">Оборудование не найдено.</Typography>
                    )}

                    <Typography variant="h4" component="h2" gutterBottom sx={{ marginTop: '20px' }}>
                        Отзывы
                    </Typography>
                    {reviews.length > 0 ? (
                        <Box>
                            {reviews.map((review) => (
                                <Box key={review.id} sx={{ marginBottom: '20px' }}>
                                    <Divider sx={{ marginBottom: '10px' }} />
                                    <Typography variant="body1" fontWeight="bold">
                                        {review.User.firstName} {review.User.lastName} оценил(а) на {review.rating} звезд
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        <em>{review.shortReview}</em>
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {review.description}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        {new Date(review.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body1">Нет отзывов.</Typography>
                    )}
                </Box>
            ) : (
                <Typography variant="body1">Поставщик не найден.</Typography>
            )}

            {error && (
                <Alert severity="error" sx={{ marginTop: '20px' }}>
                    {error}
                </Alert>
            )}
        </Container>
    );
}

export default SupplierDetails;
