import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function ReviewList({ reviews }) {
    if (reviews.length === 0) {
        return (
            <Container sx={{ padding: '20px' }}>
                <Typography variant="h6">Отзывов пока нет.</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ padding: '20px' }}>
            {reviews.map((review) => (
                <Paper key={review.id} sx={{ padding: '20px', marginBottom: '10px' }}>
                    <Box>
                        <Typography variant="subtitle1">
                            <strong>Рейтинг:</strong> {review.rating} / 5
                        </Typography>
                        <Typography variant="body1">
                            <strong>Краткий отзыв:</strong> {review.shortReview}
                        </Typography>
                        <Typography variant="body2" sx={{ marginTop: '10px' }}>
                            <strong>Описание:</strong> {review.description}
                        </Typography>
                        <Typography variant="body2" sx={{ marginTop: '10px' }}>
                            <strong>Пользователь:</strong> {review.User?.firstName} {review.User?.lastName}
                        </Typography>
                        <Typography variant="caption" sx={{ marginTop: '10px', display: 'block' }}>
                            <strong>Дата:</strong> {new Date(review.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                </Paper>
            ))}
        </Container>
    );
}

export default ReviewList;
