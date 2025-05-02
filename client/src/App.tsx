import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import VoterDashboard from './pages/VoterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { isAuthenticated, getCurrentUser, logout } from './services/authService';
import VotingResults from './pages/VotingResults';
import NavigationBar from './components/NavigationBar';
import { useAuth, AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                {!['/login', '/register'].includes(location.pathname) && <NavigationBar />}
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute roles={['admin']}>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/voter"
                        element={
                            <PrivateRoute roles={['voter']}>
                                <VoterDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/results"
                        element={
                            <PrivateRoute roles={['admin', 'voter']}>
                                <VotingResults />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to={isAuthenticated ? '/voter' : '/login'} replace />} />
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
};

const AppWithRouter: React.FC = () => (
    <Router>
        <App />
    </Router>
);

export default AppWithRouter; 