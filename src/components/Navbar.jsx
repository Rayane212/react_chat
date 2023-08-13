import React, { useContext } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { ChatContext } from '../context/ChatContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);
    const { dispatch } = useContext(ChatContext); // Utilisez dispatch depuis le contexte pour mettre à jour l'état

    const handleFriends = () => {
        dispatch({ type: "DISPLAY_FRIENDS" });
    }


    return (
        <div className='navbar'>
            <div className='logoMsg'>
                <QuestionAnswerIcon className="msgIcon" onClick={() => handleFriends()} />
                <span className='logo' onClick={() => handleFriends()}>React Chat</span>
            </div>
            {console.log(currentUser.photoURL)}
            <div className="user">
                {
                    currentUser.photoURL !== undefined ?
                        <img src={currentUser.photoURL} alt="" /> :
                        <AccountCircleIcon />

                }

                <span>{currentUser.displayName}</span>
                <PowerSettingsNewIcon className='logout' onClick={() => signOut(auth)} />
            </div>
        </div>
    );
};

export default Navbar;