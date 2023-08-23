import React, { useContext, useEffect, useState } from 'react';
import { sendEmailVerification, signOut } from "firebase/auth";
import { Alert, Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { Close, ExitToApp, Send } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';



const VerifyEmail = () => {
    const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [resendTimeout, setResendTimeout] = useState(0);
    const { currentUser } = useContext(AuthContext);


    useEffect(() => {
        if (currentUser && !currentUser.emailVerified) {
            setShowEmailVerificationModal(true);
          } else {
            setShowEmailVerificationModal(false);
          }
    },[currentUser])

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

    const handleResendEmail = async () => {
        try {
            await sendEmailVerification(currentUser);
            setIsEmailSent(true);
            setIsResendDisabled(true);
            setResendTimeout(60000);
            setTimeout(() => {
                setIsResendDisabled(false);
            }, 60000);
        } catch (error) {
            console.error("Error sending email verification:", error);
        }
    };


    const handleSignOut = async () => {
        await signOut(auth);
        await updateDoc(doc(db, "users", currentUser.uid), { online: "offline" });
    };
    const handleCloseModal = () => {
        setShowEmailVerificationModal(false);
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
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };
    return (
        <Modal open={showEmailVerificationModal} onClose={handleCloseModal}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Email Verification Required
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Your email is not verified. Please check your inbox and verify your email.
                </Typography>

                <Button startIcon={<Send />} onClick={handleResendEmail} disabled={isResendDisabled}>
                    {isResendDisabled ? `Resend Email (${Math.ceil(resendTimeout / 1000)}s)` : 'Resend Email'}
                </Button>
                {currentUser && !currentUser.emailVerified && (
                    <Button

                        onClick={handleSignOut}
                        startIcon={<ExitToApp />}
                    >
                        Sign Out
                    </Button>
                )}
                {isEmailSent && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Email sent successfully. Please check your inbox.
                    </Alert>
                )}
                <IconButton sx={{ position: 'absolute', top: 0, right: 0 }} onClick={handleCloseModal}>
                    <Close />
                </IconButton>
            </Box>
        </Modal>
    );
};

export default VerifyEmail;