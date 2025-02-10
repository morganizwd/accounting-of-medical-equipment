import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

function PrivateRoute({ children }) {
    const { authData } = useContext(AuthContext);

    if (authData.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return authData.isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;