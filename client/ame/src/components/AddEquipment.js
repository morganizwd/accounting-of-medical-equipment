import React, { useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, InputLabel } from '@mui/material';

function AddEquipment() {
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();

    
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        description: '',
        price: '',
        serialNumber: '',
    });
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        
        if (!formData.name || !formData.model || !formData.description || !formData.price || !formData.serialNumber) {
            setError('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('model', formData.model);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('serialNumber', formData.serialNumber);

        if (photo) {
            data.append('photo', photo);
        }

        try {
            
            await axios.post(`/api/equipments`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            alert('Оборудование успешно добавлено!');
            navigate('/supplier-admin/equipments');
        } catch (error) {
            console.error('Ошибка при добавлении оборудования:', error);
            setError(error.response?.data?.message || 'Ошибка при добавлении оборудования');
            alert(error.response?.data?.message || 'Ошибка при добавлении оборудования');
        }
    };

    return (
        <Container sx={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Добавить новое оборудование
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && (
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                )}
                <TextField
                    label="Название оборудования"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField
                    label="Модель"
                    name="model"
                    required
                    value={formData.model}
                    onChange={handleChange}
                />
                <TextField
                    label="Серийный номер"
                    name="serialNumber"
                    required
                    value={formData.serialNumber}
                    onChange={handleChange}
                />
                <TextField
                    label="Описание оборудования"
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
                <Button type="submit" variant="contained" color="primary" sx={{ padding: '10px 20px', fontSize: '16px' }}>
                    Добавить оборудование
                </Button>
            </Box>
        </Container>
    );
}

export default AddEquipment;
