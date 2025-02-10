import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Rating } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ReviewForm({ supplierId, onSubmit }) {
    const [rating, setRating] = useState(5);
    const [shortReview, setShortReview] = useState('');
    const [description, setDescription] = useState('');
    const [orderId, setOrderId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!orderId) {
            toast.error('Пожалуйста, введите ID заказа');
            return;
        }

        if (rating < 1 || rating > 5) {
            toast.error('Рейтинг должен быть от 1 до 5');
            return;
        }

        onSubmit({
            rating,
            shortReview,
            description,
            orderId,
            supplierId,
        });

        setRating(5);
        setShortReview('');
        setDescription('');
        setOrderId('');
    };

    return (
        <Container sx={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <Typography variant="h5" gutterBottom>
                Написать отзыв
            </Typography>
            <ToastContainer />
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <Typography component="legend">Рейтинг</Typography>
                    <Rating
                        name="rating"
                        value={rating}
                        onChange={(e, newValue) => setRating(newValue)}
                    />
                </Box>
                <TextField
                    label="Краткий отзыв"
                    name="shortReview"
                    value={shortReview}
                    onChange={(e) => setShortReview(e.target.value)}
                    required
                />
                <TextField
                    label="Описание"
                    name="description"
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <TextField
                    label="ID Заказа"
                    name="orderId"
                    type="number"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                />
                <Button type="submit" variant="contained" color="primary">
                    Отправить отзыв
                </Button>
            </Box>
        </Container>
    );
}

export default ReviewForm;
