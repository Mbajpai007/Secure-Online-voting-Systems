import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Voting System
                </Typography>
                {user ? (
                    <>
                        {user.role === 'voter' && (
                            <Button color="inherit" component={Link} to="/voter">
                                Voter Dashboard
                            </Button>
                        )}
                        {user.role === 'admin' && (
                            <Button color="inherit" component={Link} to="/admin">
                                Admin Dashboard
                            </Button>
                        )}
                        <Button color="inherit" component={Link} to="/results">
                            Results
                        </Button>
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                        <Button color="inherit" component={Link} to="/register">
                            Register
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavigationBar; 