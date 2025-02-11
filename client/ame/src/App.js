

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import SupplierDetails from './components/SupplierDetails';
import SupplierAdmin from './components/SupplierAdmin';
import SupplierOrders from './components/SupplierOrders';
import PrivateRoute from './components/PrivateRoute';
import SupplierRoute from './components/SupplierRoute';
import EditSupplierInfo from './components/EditSupplierInfo';
import EquipmentList from './components/EquipmentList';
import AddEquipment from './components/AddEquipment';
import EditEquipment from './components/EditEquipment';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Profile from './components/Profile';
import { Container } from '@mui/material';
import NavigationBar from './components/NavigationBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <NavigationBar />
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/" element={<HomePage />} />
          {/* Детали поставщика */}
          <Route path="/supplier/:id" element={<SupplierDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          {/* Роуты для поставщика */}
          <Route
            path="/supplier-admin"
            element={
              <SupplierRoute>
                <SupplierAdmin />
              </SupplierRoute>
            }
          />
          <Route
            path="/supplier-admin/edit"
            element={
              <SupplierRoute>
                <EditSupplierInfo />
              </SupplierRoute>
            }
          />
          <Route
            path="/supplier-admin/equipments"
            element={
              <SupplierRoute>
                <EquipmentList />
              </SupplierRoute>
            }
          />
          <Route
            path="/supplier-admin/equipments/add"
            element={
              <SupplierRoute>
                <AddEquipment />
              </SupplierRoute>
            }
          />
          <Route
            path="/supplier-admin/equipments/edit/:id"
            element={
              <SupplierRoute>
                <EditEquipment />
              </SupplierRoute>
            }
          />
          <Route
            path="/supplier-admin/orders"
            element={
              <SupplierRoute>
                <SupplierOrders />
              </SupplierRoute>
            }
          />
        </Routes>
      </Container>
      <ToastContainer />
    </>
  );
}

export default App;