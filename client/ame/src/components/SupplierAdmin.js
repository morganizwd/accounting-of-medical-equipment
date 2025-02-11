

import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Container,
    Typography,
    List,
    ListItem,
    Button,
    Box,
    Divider,
    CircularProgress,
} from '@mui/material';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

function SupplierAdmin() {
    const { authData } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReviews();
        
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`/api/reviews/supplier/${authData.user.id}`);
            setReviews(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении отзывов:', err);
            setError('Не удалось загрузить отзывы.');
            setLoading(false);
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

    if (loading) {
        return (
            <Container sx={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ marginTop: '20px' }}>
                    Загрузка отзывов...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ marginTop: '50px' }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Панель управления поставщика
            </Typography>
            <Box sx={{ marginBottom: '20px' }}>
                <Typography variant="h6" component="div">
                    Рейтинг: {calculateAverageRating()} / 5
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {renderStars(calculateAverageRating())}
                    <Typography variant="body2" sx={{ marginLeft: '8px', color: '#555' }}>
                        ({reviews.length} отзывов)
                    </Typography>
                </Box>
            </Box>
            <List>
                <ListItem>
                    <Button
                        component={Link}
                        to="/supplier-admin/edit"
                        variant="outlined"
                        color="primary"
                        fullWidth
                    >
                        Редактировать информацию о поставщике
                    </Button>
                </ListItem>
                <ListItem>
                    <Button
                        component={Link}
                        to="/supplier-admin/equipments"
                        variant="outlined"
                        color="primary"
                        fullWidth
                    >
                        Управление оборудованием
                    </Button>
                </ListItem>
                <ListItem>
                    <Button
                        component={Link}
                        to="/supplier-admin/orders"
                        variant="outlined"
                        color="primary"
                        fullWidth
                    >
                        Управление заказами
                    </Button>
                </ListItem>
            </List>

            <Typography variant="h5" sx={{ marginTop: '20px', marginBottom: '10px' }}>
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
        </Container>
    );
}

export default SupplierAdmin;
