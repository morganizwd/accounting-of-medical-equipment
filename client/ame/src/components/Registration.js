// src/components/Registration.js

import React, { useState } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Registration() {
    const [role, setRole] = useState('user');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        // Для покупателя:
        firstName: '',
        lastName: '',
        phone: '',
        birthDate: '',
        description: '',
        // Для поставщика:
        companyName: '',
        contactPerson: '',
        registrationNumber: '',
        supplierPhone: '',
        supplierDescription: '',
        address: '',
    });
    const [photo, setPhoto] = useState(null);
    const [photoUploaded, setPhotoUploaded] = useState(false);

    const navigate = useNavigate();

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        setPhotoUploaded(!!file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Пароли не совпадают');
            return;
        }

        const data = new FormData();

        if (role === 'user') {
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('phone', formData.phone);
            data.append('birthDate', formData.birthDate);
            data.append('description', formData.description);
        } else {
            data.append('companyName', formData.companyName);
            data.append('contactPerson', formData.contactPerson);
            data.append('registrationNumber', formData.registrationNumber);
            data.append('phone', formData.supplierPhone);
            data.append('description', formData.supplierDescription);
            data.append('address', formData.address);
        }

        data.append('email', formData.email);
        data.append('password', formData.password);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            const url = role === 'user'
                ? '/api/users/registration'
                : '/api/supplier/registration';
            await axios.post(url, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Регистрация прошла успешно!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            toast.error('Ошибка при регистрации');
        }
    };

    return (
        <Container sx={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom>
                Регистрация
            </Typography>
            <ToastContainer />
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                    <InputLabel id="role-select-label">Я хочу зарегистрироваться как</InputLabel>
                    <Select
                        labelId="role-select-label"
                        value={role}
                        label="Я хочу зарегистрироваться как"
                        onChange={handleRoleChange}
                    >
                        <MenuItem value="user">Покупатель</MenuItem>
                        <MenuItem value="supplier">Поставщик</MenuItem>
                    </Select>
                </FormControl>
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
                <TextField
                    label="Подтвердите пароль"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                {role === 'user' && (
                    <>
                        <TextField
                            label="Имя"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Фамилия"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Телефон"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Дата рождения"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Описание"
                            name="description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                        />
                        <Button variant="contained" component="label" disabled={photoUploaded}>
                            {photoUploaded ? 'Фотография загружена' : 'Загрузить фото'}
                            <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                        </Button>
                    </>
                )}
                {role === 'supplier' && (
                    <>
                        <TextField
                            label="Название компании"
                            name="companyName"
                            required
                            value={formData.companyName}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Контактное лицо"
                            name="contactPerson"
                            required
                            value={formData.contactPerson}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Регистрационный номер"
                            name="registrationNumber"
                            required
                            value={formData.registrationNumber}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Телефон"
                            name="supplierPhone"
                            required
                            value={formData.supplierPhone}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Адрес"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Описание компании"
                            name="supplierDescription"
                            multiline
                            rows={4}
                            value={formData.supplierDescription}
                            onChange={handleChange}
                        />
                        <Button variant="contained" component="label" disabled={photoUploaded}>
                            {photoUploaded ? 'Фотография загружена' : 'Загрузить фото'}
                            <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                        </Button>
                    </>
                )}
                <Button type="submit" variant="contained" color="primary">
                    Зарегистрироваться
                </Button>
            </Box>
        </Container>
    );
}

export default Registration;
