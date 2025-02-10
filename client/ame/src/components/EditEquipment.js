// src/components/EditEquipment.js

import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, TextField, Button, Box, InputLabel } from '@mui/material';

function EditEquipment() {
    const { id } = useParams();
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
    });
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        fetchEquipment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchEquipment = async () => {
        try {
            const response = await axios.get(`/api/equipments/${id}`);
            setFormData({
                name: response.data.name,
                description: response.data.description,
                price: response.data.price,
            });
        } catch (error) {
            console.error('Ошибка при получении информации об оборудовании:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            await axios.put(`/api/equipments/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Оборудование успешно обновлено!');
            navigate('/supplier-admin/equipments');
        } catch (error) {
            console.error('Ошибка при обновлении оборудования:', error);
            alert('Ошибка при обновлении оборудования');
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Редактировать оборудование
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
                <TextField
                    label="Название"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField
                    label="Описание"
                    name="description"
                    required
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                />
                <TextField
                    label="Цена"
                    name="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                />
                <Box>
                    <InputLabel htmlFor="photo-upload">Фото</InputLabel>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ marginTop: '10px' }}
                    />
                </Box>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ padding: '10px 20px', fontSize: '16px' }}
                >
                    Сохранить изменения
                </Button>
            </Box>
        </Container>
    );
}

export default EditEquipment;
