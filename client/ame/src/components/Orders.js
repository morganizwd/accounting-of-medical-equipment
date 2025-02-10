import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Grid,
} from '@mui/material';
import { FaStar } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from 'docx';

function Orders() {
    const { authData } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        shortReview: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);

    const allowedStatuses = ['на рассмотрении', 'выполняется', 'выполнен', 'отменён'];

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchDate, searchStatus, orders]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders', {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при получении заказов пользователя:', error);
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (searchDate) {
            filtered = filtered.filter((order) =>
                new Date(order.date_of_ordering).toISOString().startsWith(searchDate)
            );
        }

        if (searchStatus) {
            filtered = filtered.filter((order) => order.status === searchStatus);
        }

        setFilteredOrders(filtered);
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;

        try {
            await axios.put(
                `/api/orders/${orderToCancel}/status`,
                { status: 'отменён' },
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderToCancel ? { ...order, status: 'отменён' } : order
                )
            );
            alert('Заказ успешно отменён.');
        } catch (error) {
            console.error('Ошибка при отмене заказа:', error);
            alert('Не удалось отменить заказ.');
        } finally {
            setOrderToCancel(null);
            setOpenDialog(false);
        }
    };

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReviewData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStarClick = (rating) => {
        setReviewData((prev) => ({ ...prev, rating }));
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!reviewData.shortReview.trim() || !reviewData.description.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(
                '/api/reviews',
                {
                    ...reviewData,
                    orderId: selectedOrder.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );
            alert('Отзыв успешно создан!');
            setSubmitting(false);
            setSelectedOrder(null);
            setReviewData({ rating: 5, shortReview: '', description: '' });
            fetchOrders();
        } catch (error) {
            console.error('Ошибка при создании отзыва:', error);
            alert(error.response?.data?.message || 'Не удалось создать отзыв');
            setSubmitting(false);
        }
    };

    const exportToExcel = () => {
        const data = filteredOrders.map((order) => ({
            'Номер заказа': order.id,
            'Адрес доставки': order.delivery_address,
            'Время готовности': order.completion_time,
            'Дата заказа': new Date(order.date_of_ordering).toLocaleString(),
            'Статус': order.status,
            'Итоговая сумма (₽)': order.total_cost,
            'Товары': order.OrderItems.map(item => `${item.Equipment.name} x ${item.quantity} = ${item.Equipment.price * item.quantity} ₽`).join('; '),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'orders_report.xlsx');
    };

    const exportToWord = async () => {
        try {
            const tableRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('Номер заказа')] }),
                        new TableCell({ children: [new Paragraph('Адрес доставки')] }),
                        new TableCell({ children: [new Paragraph('Время готовности')] }),
                        new TableCell({ children: [new Paragraph('Дата заказа')] }),
                        new TableCell({ children: [new Paragraph('Статус')] }),
                        new TableCell({ children: [new Paragraph('Итоговая сумма (₽)')] }),
                        new TableCell({ children: [new Paragraph('Товары')] }),
                    ],
                }),
            ];

            filteredOrders.forEach(order => {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(order.id?.toString() || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(order.delivery_address || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(order.completion_time || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(new Date(order.date_of_ordering).toLocaleString() || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(order.status || 'N/A')] }),
                            new TableCell({ children: [new Paragraph(order.total_cost?.toString() || 'N/A')] }),
                            new TableCell({
                                children: [
                                    new Paragraph(
                                        order.OrderItems
                                            ? order.OrderItems.map(item =>
                                                `${item.Equipment?.name || 'Unknown'} x ${item.quantity} = ${item.Equipment?.price * item.quantity || 0} ₽`
                                            ).join('; ')
                                            : 'N/A'
                                    ),
                                ],
                            }),
                        ],
                    })
                );
            });

            const table = new Table({
                rows: tableRows,
                width: {
                    size: 100,
                    type: 'pct',
                },
            });

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                text: 'Отчет по заказам',
                                heading: 'Heading1',
                                alignment: 'center',
                            }),
                            new Paragraph({ text: '\n' }),
                            table,
                        ],
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, 'orders_report.docx');
        } catch (error) {
            console.error('Ошибка экспорта в Word:', error);
            alert('Произошла ошибка при экспорте в Word.');
        }
    };


    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Мои заказы
            </Typography>

            <Box sx={{ marginBottom: '20px' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Дата заказа"
                            type="date"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            SelectProps={{
                                native: true,
                            }}
                            value={searchStatus}
                            onChange={(e) => setSearchStatus(e.target.value)}
                            fullWidth
                        >
                            <option value="">Все статусы</option>
                            {allowedStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <Button variant="contained" color="primary" onClick={exportToExcel}>
                                Экспорт в Excel
                            </Button>
                            <Button variant="contained" color="secondary" onClick={exportToWord}>
                                Экспорт в Word
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : filteredOrders.length === 0 ? (
                <Typography>У вас ещё нет заказов.</Typography>
            ) : (
                <List>
                    {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                            <ListItem alignItems="flex-start" sx={{ border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px', padding: '10px' }}>
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="h6">Заказ №{order.id}</Typography>
                                    <ListItemText primary={`Адрес доставки: ${order.deliveryAddress}`} />
                                    <ListItemText primary={`Время готовности: ${order.completionTime}`} />
                                    <ListItemText primary={`Дата заказа: ${new Date(order.dateOfOrdering).toLocaleString()}`} />
                                    <ListItemText primary={`Статус: ${order.status}`} />
                                    <ListItemText primary={`Итоговая сумма: ${order.totalCost} ₽`} />
                                    <Typography variant="subtitle1" gutterBottom>Товары:</Typography>
                                    <List sx={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                        {order.OrderItems.map((item) => (
                                            <ListItem key={item.id} sx={{ display: 'list-item' }}>
                                                {item.Equipment.name} x {item.quantity} = {item.Equipment.price * item.quantity} ₽
                                            </ListItem>
                                        ))}
                                    </List>
                                    {order.status === 'выполнен' && !order.Review && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => setSelectedOrder(order)}
                                            sx={{ marginTop: '10px' }}
                                        >
                                            Написать отзыв
                                        </Button>
                                    )}
                                    {order.status === 'на рассмотрении' && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {
                                                setOrderToCancel(order.id);
                                                setOpenDialog(true);
                                            }}
                                            sx={{ marginTop: '10px' }}
                                        >
                                            Отменить заказ
                                        </Button>
                                    )}
                                </Box>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            )}

            {selectedOrder && (
                <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)}>
                    <DialogTitle>Написать отзыв</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={24}
                                    color={reviewData.rating >= star ? '#FFD700' : '#ccc'}
                                    onClick={() => handleStarClick(star)}
                                    style={{ cursor: 'pointer', marginRight: '8px' }}
                                />
                            ))}
                        </Box>
                        <TextField
                            label="Короткий отзыв"
                            name="shortReview"
                            value={reviewData.shortReview}
                            onChange={handleReviewChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Описание"
                            name="description"
                            value={reviewData.description}
                            onChange={handleReviewChange}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedOrder(null)} color="primary">
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            color="primary"
                            variant="contained"
                            disabled={submitting}
                        >
                            {submitting ? 'Отправка...' : 'Отправить'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Подтверждение отмены</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleCancelOrder} color="error" variant="contained">
                        Отменить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Orders;
