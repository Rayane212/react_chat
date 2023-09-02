import { Alert, Avatar, Backdrop, Box, Button, CircularProgress, Divider, IconButton, InputAdornment, Modal, Snackbar, TextField, Typography } from '@mui/material';
import { Close, Edit, LinkOff, Visibility, VisibilityOff } from '@mui/icons-material';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { EmailAuthProvider, linkWithPopup, reauthenticateWithCredential, sendEmailVerification, unlink, updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import GoogleIcon from '@mui/icons-material/Google';
import ReauthenticateModal from './ReauthenticateModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Profile = ({ isOpen, onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const [err, setErr] = useState("");
    const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [resendTimeout, setResendTimeout] = useState(0);
    const [displayName, setDisplayName] = useState(currentUser.displayName);
    const [email, setEmail] = useState(currentUser.email);
    // const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || ""); 
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    const [isGoogleLinked, setIsGoogleLinked] = useState(false);

    const [isEmailVerified, setIsEmailVerified] = useState(currentUser.emailVerified);


    useEffect(() => {
        if (currentUser && currentUser.providerData) {
            setIsGoogleLinked(
                currentUser.providerData.some((provider) => provider.providerId === 'google.com')
            );
        }
    }, [currentUser]);

    useEffect(() => {
        if (isResendDisabled) {
            let timer = setInterval(() => {
                setResendTimeout((prevTimeout) => prevTimeout - 1000);
            }, 1000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [isResendDisabled]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const date = new Date().getTime();
        const storageRef = ref(storage, `img/avatars/${displayName + date}`);
        if (selectedImage) {
            await uploadBytesResumable(storageRef, selectedImage).then(async () => {
                getDownloadURL(storageRef).then(async (downloadURL) => {
                    try {
                        await updateProfile(currentUser, {
                            photoURL: downloadURL,
                        });

                        await updateDoc(doc(collection(db, "users"), currentUser.uid), {
                            photoURL: downloadURL,
                        });

                    } catch (err) {
                        setErr("Something went wrong");
                    }
                });
            });
        } else {
            try {
                await updateProfile(currentUser, {
                    displayName,
                });

                await updateDoc(doc(collection(db, "users"), currentUser.uid), {
                    displayName: displayName,
                    email: email
                });


            } catch (err) {
                setErr("Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        if (email !== currentUser.email) {
            setIsReauthModalOpen(true);
        } else {
            setLoading(false);
            setIsEditMode(false);
        }

        if (newPassword !== "") {
            setIsReauthModalOpen(true);
        } else {
            setLoading(false);
            setIsEditMode(false);
        }
    };

    const handleReauthenticate = async (password) => {
        const credential = EmailAuthProvider.credential(currentUser.email, password);

        try {

            await reauthenticateWithCredential(auth.currentUser, credential);

            if (email !== currentUser.email) {
                await updateEmail(currentUser, email).then(async () => {
                    console.log("Email updated")
                }).catch((error) => {
                    console.log(error)
                })
                await updateDoc(doc(collection(db, "users"), currentUser.uid), {
                    email: email,
                });
                await sendEmailVerification(currentUser);
            }

            if (newPassword !== "") {
                await updatePassword(currentUser, password).then(() => {
                    console.log("Password updated")
                }).catch((error) => {
                    console.log(error)
                })
            }


            setLoading(false);
            setIsEditMode(false);
            setIsReauthModalOpen(false);
        } catch (error) {
            console.error("Error reauthenticating:", error);
            setLoading(false);
            setIsReauthModalOpen(false);
        }

    };

    const handleLinkGoogle = async () => {
        try {
            await linkWithPopup(auth.currentUser, googleProvider)
            setIsGoogleLinked(true)

        } catch (error) {
            console.error(error)
        }
    }

    const handleUnLinkGoogle = async () => {
        try {
            await unlink(auth.currentUser, "google.com")
            setIsGoogleLinked(false)

        } catch (error) {
            console.error(error)
        }
    }

    const handleVerifyMail = async () => {
        try {
            await sendEmailVerification(currentUser)
            setIsEmailVerified(false);
            setIsEmailSent(true);
            setIsResendDisabled(true);
            setResendTimeout(60000);
            setTimeout(() => {
                setIsResendDisabled(false);
            }, 60000);
        } catch (error) {
            setErr("Please try later")
        }
    }

    useEffect(() => {
        setIsEmailVerified(currentUser.emailVerified);
    }, [currentUser]);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

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


    const handleClose = (e, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsEmailSent(false);
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
        '@media screen and (max-height: 700px) and (orientation: landscape)': {
            maxHeight: '80%',
            overflow: 'scroll',
        },
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: 8

    };

    return (
        <Modal open={isOpen} onClose={handleCloseModal}>
            <Box sx={style}>
                {loading && (
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

                {isEditMode &&
                    <IconButton sx={{ position: 'absolute', top: 0, left: 0 }} onClick={handleCloseEdit}>
                        <ArrowBackIcon />
                    </IconButton>
                }

                {!isEditMode && (<Avatar sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }} src={currentUser.photoURL} alt={currentUser.displayName} />)}

                {isEditMode ? (
                    <div>
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
                            />


                            {/* <TextField
                            fullWidth
                            label="Phone number"
                            variant="outlined"
                            type='tel'
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        /> */}

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={handlePasswordChange}
                                variant="outlined"
                                margin="normal"
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

                            <Button type="submit" variant="outlined" fullWidth sx={{ mt: 2 }}>
                                <SaveAsIcon sx={{ marginRight: "5px" }} /> Save
                            </Button>

                            {err && <Alert severity='error'>{err}</Alert>}

                        </form>
                    </div>

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
                        <Edit sx={{ mr: 0.5 }} /> modify
                    </Button>}


                <Divider sx={{ my: 2 }} />

                {!isEmailVerified && !currentUser.emailVerified ? (
                    <Button variant="outlined" fullWidth onClick={handleVerifyMail} disabled={isResendDisabled}>
                        {isResendDisabled ? `Resend Email (${Math.ceil(resendTimeout / 1000)}s)` : 'Verify the email'}
                    </Button>)
                    :
                    (<Button variant="outlined" fullWidth disabled>
                        Mail verified
                    </Button>)
                }

                {!currentUser.providerData || !isGoogleLinked ? (
                    <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleLinkGoogle}>
                        <GoogleIcon sx={{ mr: 0.5 }} /> Link Google Account
                    </Button>
                ) : (
                    <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleUnLinkGoogle}>
                        <LinkOff sx={{ mr: 0.5 }} /> Google Account Linked
                    </Button>
                )}

                {isReauthModalOpen && (
                    <ReauthenticateModal
                        isOpen={isReauthModalOpen}
                        onClose={() => setIsReauthModalOpen(false)}
                        onReauthenticate={handleReauthenticate}
                    />
                )}
                {isEmailSent &&
                    <Snackbar open={isEmailSent} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}  >
                        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                            Email sent successfully. Please check your inbox.

                        </Alert>
                    </Snackbar>
                }

            </Box>
        </Modal>
    );
};

export default Profile;