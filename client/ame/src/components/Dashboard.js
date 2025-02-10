import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Button, Box } from '@mui/material';

function Dashboard() {
    const { authData, logout } = useContext(AuthContext);

    return (
        <Container sx={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Панель управления
            </Typography>
            <Typography variant="body1" gutterBottom>
                Добро пожаловать, {authData.user ? authData.user.name || authData.user.email : 'Пользователь'}!
            </Typography>
            <Box sx={{ marginTop: '20px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={logout}
                >
                    Выйти
                </Button>
            </Box>
        </Container>
    );
}

export default Dashboard;
