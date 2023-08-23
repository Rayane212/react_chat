import { Avatar, Box, Button, Divider, IconButton, Modal, TextField, Typography } from '@mui/material';
import { Close, Edit } from '@mui/icons-material';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = ({ isOpen, onClose }) => {
    const { currentUser } = useContext(AuthContext);

    const [isEditMode, setIsEditMode] = useState(false);
    const [displayName, setDisplayName] = useState(currentUser.displayName);
    const [email, setEmail] = useState(currentUser.email);
    const [selectedImage, setSelectedImage] = useState(null);


    const handleOpenEdit = () => {
        setIsEditMode(true);
    };

    const handleSaveEdit = () => {
        // Ajoutez ici la logique pour enregistrer les modifications dans votre backend (Firebase, etc.)
        setIsEditMode(false);
        setSelectedImage(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
    };

    const handleCloseModal = () => {
        onClose();
        setIsEditMode(false);
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
        <Modal open={isOpen} onClose={handleCloseModal}>
            <Box sx={style}>
                <IconButton sx={{ position: 'absolute', top: 0, right: 0 }} onClick={handleCloseModal}>
                    <Close />
                </IconButton>

                <label htmlFor="avatar-upload" >
                    <Avatar sx={{ width: 100, height: 100, margin: '0 auto', mb: 2,  cursor: isEditMode ? 'pointer' : 'default' }} src={selectedImage ? URL.createObjectURL(selectedImage) : currentUser.photoURL}
                        alt={currentUser.displayName} />
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        disabled={!isEditMode}
                    />
                </label>
                {isEditMode ? (
                    <>

                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Display Name"
                            variant="outlined"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </>
                ) : (
                    <>
                        <Typography variant="h6" align="center" gutterBottom>
                            {currentUser.displayName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                            {currentUser.email}
                        </Typography>
                    </>
                )}



                {isEditMode ? (
                    <Button variant="outlined" fullWidth onClick={handleSaveEdit} sx={{ mt: 2 }}>
                        Enregistrer les modifications
                    </Button>
                ) : (
                    <Button variant="outlined" fullWidth onClick={handleOpenEdit} sx={{ mt: 2 }}>
                        <Edit /> Modifier
                    </Button>
                )}

                <Divider sx={{ my: 2 }} />

                <Button variant="outlined" fullWidth>
                    Vérifier mon e-mail
                </Button>
            </Box>
        </Modal>
    );
};

export default Profile;