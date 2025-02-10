import React, { useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, InputLabel, Select, MenuItem } from '@mui/material';

function Login() {
    const [role, setRole] = useState('user');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Если роль "user" → /api/users/login, если "supplier" → /api/supplier/login
            const url = role === 'user' ? '/api/users/login' : '/api/supplier/login';
            const response = await axios.post(url, formData);
            const token = response.data.token;
            const user = response.data.user;

            login({ user, token, role });

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', role);

            alert('Вход выполнен успешно!');
            if (role === 'user') {
                navigate('/');
            } else if (role === 'supplier') {
                navigate('/supplier-admin');
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            alert('Ошибка при входе');
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Вход
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
                <InputLabel id="role-select-label">Я вхожу как:</InputLabel>
                <Select
                    labelId="role-select-label"
                    value={role}
                    onChange={handleRoleChange}
                    sx={{ marginBottom: '20px' }}
                >
                    <MenuItem value="user">Покупатель</MenuItem>
                    <MenuItem value="supplier">Поставщик</MenuItem>
                </Select>
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
                <TextField
                    label="Пароль"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ padding: '10px 20px', fontSize: '16px' }}>
                    Войти
                </Button>
            </Box>
        </Container>
    );
}

export default Login;
