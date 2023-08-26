import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';


const ReauthenticateModal = ({ isOpen, onClose, onReauthenticate }) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState(null);

    const handleReauthenticate = async () => {
        try {
            await onReauthenticate(password);
            onClose();
        } catch (error) {
            setAuthError("Authentication failed. Please check your password.");
            console.error(error);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        '@media screen and (max-width: 700px)': {
            width: '80%',
            margin: '0 auto',
        },
        bgcolor: 'background.paper',
        border: '1px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: 8

    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6">Reauthenticate</Typography>
                <form>
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        variant="outlined"
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {authError && <Typography color="error">{authError}</Typography>}
                    <Button variant="outlined" fullWidth onClick={handleReauthenticate}>
                        Reauthenticate
                    </Button>
                </form>
            </Box>
        </Modal>
    );
};

export default ReauthenticateModal;
