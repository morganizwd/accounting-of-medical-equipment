// src/components/NavigationBar.js

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppBar, Toolbar, Button, Container } from '@mui/material';

const NavigationBar = () => {
    const { authData, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    console.log('NavigationBar: authData.role is', authData.role, 'isAuthenticated:', authData.isAuthenticated);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AppBar position="static">
            <Container maxWidth="lg">
                <Toolbar>
                    {authData.role === 'user' && (
                        <>
                            <Button component={Link} to="/orders" color="inherit" sx={{ marginRight: 2 }}>
                                Мои заказы
                            </Button>
                            <Button component={Link} to="/" color="inherit" sx={{ marginRight: 2 }}>
                                Главная
                            </Button>
                            <Button component={Link} to="/cart" color="inherit" sx={{ marginRight: 2 }}>
                                Корзина
                            </Button>
                        </>
                    )}
                    {authData.role === 'supplier' && (
                        <Button component={Link} to="/supplier-admin" color="inherit" sx={{ marginRight: 2 }}>
                            Админка поставщика
                        </Button>
                    )}
                    {authData.role === 'user' && (
                        <Button component={Link} to="/profile" color="inherit" sx={{ marginRight: 2 }}>
                            Профиль
                        </Button>
                    )}
                    {!authData.isAuthenticated && (
                        <>
                            <Button component={Link} to="/register" color="inherit" sx={{ marginRight: 2 }}>
                                Регистрация
                            </Button>
                            <Button component={Link} to="/login" color="inherit" sx={{ marginRight: 2 }}>
                                Вход
                            </Button>
                        </>
                    )}
                    {authData.isAuthenticated && (
                        <Button color="inherit" onClick={handleLogout}>
                            Выход
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default NavigationBar;
