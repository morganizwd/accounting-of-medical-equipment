// src/components/EditSupplierInfo.js

import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  InputLabel, 
  CardMedia 
} from '@mui/material';

function EditSupplierInfo() {
  const { authData } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    registrationNumber: '',
    phone: '',
    description: '',
    address: '',
  });
  const [logo, setLogo] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);

  useEffect(() => {
    fetchSupplierInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSupplierInfo = async () => {
    try {
      // Получаем информацию о поставщике по его ID
      const response = await axios.get(`/api/supplier/${authData.user.id}`);
      setFormData({
        companyName: response.data.companyName,
        contactPerson: response.data.contactPerson,
        registrationNumber: response.data.registrationNumber,
        phone: response.data.phone,
        description: response.data.description,
        address: response.data.address,
      });
      setCurrentLogo(response.data.logo);
    } catch (error) {
      console.error('Ошибка при получении информации о поставщике:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('companyName', formData.companyName);
    data.append('contactPerson', formData.contactPerson);
    data.append('registrationNumber', formData.registrationNumber);
    data.append('phone', formData.phone);
    data.append('description', formData.description);
    data.append('address', formData.address);

    if (logo) {
      data.append('logo', logo);
    }

    try {
      const response = await axios.put(`/api/supplier/${authData.user.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Информация успешно обновлена!');
      // Обновляем текущий логотип, если он пришёл в ответе
      if (response.data.logo) {
        setCurrentLogo(response.data.logo);
      }
    } catch (error) {
      console.error('Ошибка при обновлении информации о поставщике:', error);
      alert('Ошибка при обновлении информации');
    }
  };

  return (
    <Container sx={{ padding: '20px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Редактировать информацию о поставщике
      </Typography>
      {currentLogo && (
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="body1">Текущий логотип:</Typography>
          <CardMedia
            component="img"
            image={`http://localhost:5000${currentLogo}`}
            alt={formData.companyName}
            sx={{ width: '200px', height: 'auto', marginTop: '10px' }}
          />
        </Box>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
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
          name="phone"
          required
          value={formData.phone}
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
          label="Описание"
          name="description"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange}
        />
        <Box>
          <InputLabel htmlFor="logo-upload">Логотип</InputLabel>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
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

export default EditSupplierInfo;
