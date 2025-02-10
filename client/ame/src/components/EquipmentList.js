// src/components/EquipmentList.js

import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    Divider,
    Card,
    CardContent,
    CardMedia,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';

function EquipmentList() {
    const { authData } = useContext(AuthContext);
    const [equipments, setEquipments] = useState([]);

    useEffect(() => {
        fetchEquipments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchEquipments = async () => {
        try {
            // Обновлённый эндпоинт для получения оборудования поставщика
            const response = await axios.get(`/api/equipments/supplier/${authData.user.id}`);
            setEquipments(response.data);
        } catch (error) {
            console.error('Ошибка при получении списка оборудования:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить это оборудование?')) {
            try {
                await axios.delete(`/api/equipments/${id}`);
                setEquipments(equipments.filter((equipment) => equipment.id !== id));
            } catch (error) {
                console.error('Ошибка при удалении оборудования:', error);
            }
        }
    };

    return (
        <Container sx={{ padding: '20px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Управление оборудованием</Typography>
                <Button
                    component={Link}
                    to="/supplier-admin/equipments/add"
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleIcon />}
                >
                    Добавить новое оборудование
                </Button>
            </Box>
            <List>
                {equipments.map((equipment) => (
                    <React.Fragment key={equipment.id}>
                        <ListItem
                            alignItems="flex-start"
                            sx={{
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                marginBottom: '10px',
                            }}
                        >
                            <Card sx={{ display: 'flex', width: '100%' }}>
                                {equipment.photo && (
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 150 }}
                                        image={`http://localhost:5000${equipment.photo}`}
                                        alt={equipment.name}
                                    />
                                )}
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <CardContent>
                                        <Typography component="div" variant="h5">
                                            {equipment.name}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {equipment.description}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" mt={1}>
                                            Цена: {equipment.price} ₽
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}>
                                        <IconButton
                                            component={Link}
                                            to={`/supplier-admin/equipments/edit/${equipment.id}`}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(equipment.id)} color="secondary">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Card>
                        </ListItem>
                        <Divider component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Container>
    );
}

export default EquipmentList;
