import React, { useContext, useEffect, useState } from 'react';
import Sidebar from './../components/Sidebar';
import Chat from '../components/Chat';
import { ChatContext } from '../context/ChatContext';
import Friends from '../components/Friends';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { sendEmailVerification, signOut } from "firebase/auth";
import { Alert, Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { Close, ExitToApp, Send } from '@mui/icons-material';

const Home = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);


  useEffect(() => {
    if (currentUser && !currentUser.emailVerified) {
      setShowEmailVerificationModal(true);
    } else {
      setShowEmailVerificationModal(false);
    }
    console.log(auth.currentUser)

    const updateOnlineStatus = async (status) => {
      if (auth.currentUser !== null) await updateDoc(doc(db, "users", auth.currentUser.uid), { online: status });
    };

    currentUser !== "" && updateOnlineStatus("online");

    // update status the user is focus  
    const handleFocus = () => {
      setTimeout(() => {
        auth.currentUser !== "" && updateOnlineStatus("online");
      }, 0);
    };

    // update status when focus is lost 
    const handleBlur = () => {
      setTimeout(() => {
        auth.currentUser !== "" && updateOnlineStatus("inactive");
      }, 0);
    };

    // update status when the user close the site  
    const handleBeforeUnload = () => {
      auth.currentUser !== "" && updateOnlineStatus("offline");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      currentUser !== "" && updateOnlineStatus("offline");
    };
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
    '@media screen and (max-width: 700px)':{
      width: '80%' , 
      margin: '0 auto',
    },
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  
  return (
    <div className="home">
      <div className='container'>
        <Sidebar />
        {data.displayFriends ? <Friends /> : <Chat />}
      </div>
      {currentUser && showEmailVerificationModal && !currentUser.emailVerified &&
        (<Modal open={true} >
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
      </Modal>)}
    </div>
  );
};

export default Home;
