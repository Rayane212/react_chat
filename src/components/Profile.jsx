import { Alert, Avatar, Backdrop, Box, Button, CircularProgress, Divider, IconButton, Modal, TextField, Typography } from '@mui/material';
import { Close, Edit, LinkOff } from '@mui/icons-material';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { linkWithPopup, sendEmailVerification, updateProfile } from 'firebase/auth';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import GoogleIcon from '@mui/icons-material/Google';

const Profile = ({ isOpen, onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [displayName, setDisplayName] = useState(currentUser.displayName);
    const [email, setEmail] = useState(currentUser.email);
    const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || "");
    const [selectedImage, setSelectedImage] = useState("");




    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const date = new Date().getTime();
        const storageRef = ref(storage, `img/avatars/${displayName + date}`);
        if (selectedImage) {
            await uploadBytesResumable(storageRef, selectedImage).then(async () => {
                getDownloadURL(storageRef).then(async (downloadURL) => {
                    try {
                        await updateProfile(currentUser, {
                            displayName,
                            email,
                            phoneNumber,
                            photoURL: downloadURL,
                        });

                        await updateDoc(doc(collection(db, "users"), currentUser.uid), {
                            displayName: displayName,
                            email: email,
                            phoneNumber: phoneNumber,
                            photoURL: downloadURL,
                        });

                    } catch (err) {
                        setErr("Something went wrong");
                    } finally {
                        setLoading(false);
                    }
                });
            });
        } else {
            try {
                await updateProfile(currentUser, {
                    displayName,
                    email,
                    phoneNumber,
                });

                await updateDoc(doc(collection(db, "users"), currentUser.uid), {
                    displayName: displayName,
                    email: email,
                    phoneNumber: phoneNumber,
                });

            } catch (err) {
                setErr("Something went wrong");
            } finally {
                setLoading(false);
            }
        }


        setIsEditMode(false);
        setSelectedImage(null);
    };

    const handleLinkGoogle = async () =>{
        try {
            await linkWithPopup(auth.currentUser, googleProvider)
            
        } catch (error) {
            console.error(error)
        }
    }

    const handleVerifyMail = () =>{
        try {
            sendEmailVerification(currentUser)
        } catch (error) {
            console.error(error)

        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
    };

    const handleCloseModal = () => {
        onClose();
        setIsEditMode(false);
    };

    const handleOpenEdit = () => {
        setIsEditMode(true);
    };
    const handleCloseEdit = () => {
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
                {loading && !isEditMode && (
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={loading}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                )}
                <IconButton sx={{ position: 'absolute', top: 0, right: 0 }} onClick={handleCloseModal}>
                    <Close />
                </IconButton>
                {!isEditMode && (<Avatar sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }} src={currentUser.photoURL} alt={currentUser.displayName} />)}

                {isEditMode ? (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="avatar-upload" >
                            <Avatar sx={{ width: 100, height: 100, margin: '0 auto', mb: 2, cursor: isEditMode ? 'pointer' : 'default' }} src={selectedImage ? URL.createObjectURL(selectedImage) : currentUser.photoURL}
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

                        <TextField
                            fullWidth
                            label="Display Name"
                            variant="outlined"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            type='email'
                            label="Email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />


                        <TextField
                            fullWidth
                            label="Phone number"
                            variant="outlined"
                            type='tel'
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <Button type="submit" variant="outlined" fullWidth sx={{ mt: 2 }}>
                            <SaveAsIcon sx={{ marginRight: "5px" }} /> Save
                        </Button>
                        <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleCloseEdit}>
                            Exit
                        </Button>
                        {err && <Alert severity='error'>{err}</Alert>}

                    </form>
                ) : (
                    <>
                        <Typography variant="h6" align="center" gutterBottom>
                            {currentUser.displayName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                            {currentUser.email} {(currentUser.emailVerified ? "(Verified)" : "(Not verified)")}
                        </Typography>
                    </>
                )}



                {!isEditMode &&
                    <Button variant="outlined" fullWidth onClick={handleOpenEdit} sx={{ mt: 2 }}>
                        <Edit  sx={{ mr: 0.5}} /> modify
                    </Button>}


                <Divider sx={{ my: 2 }} />

                {!currentUser.emailVerified ? (
                    <Button variant="outlined" fullWidth onClick={handleVerifyMail}>
                        Verify the mail
                    </Button>)
                    :
                    (<Button variant="outlined" fullWidth disabled>
                        Mail verified
                    </Button>)
                }

                {!currentUser.providerData || !currentUser.providerData.some((provider) => provider.providerId === 'google.com') ? (
                    <Button variant="outlined" fullWidth sx={{mt:2}} onClick={handleLinkGoogle}>
                        <GoogleIcon sx={{ mr: 0.5}} /> Link Google Account
                    </Button>
                ) : (
                    <Button variant="outlined" fullWidth>
                        <LinkOff /> Google Account Linked
                    </Button>
                )}

            </Box>
        </Modal>
    );
};

export default Profile;