import React, { useContext } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);
    return (
        <div className='navbar'>
            <div className='logoMsg'>
                <QuestionAnswerIcon className="msgIcon" />
                <span className='logo'>React Chat</span>
            </div>
            <div className="user">
                <img src={currentUser.photoURL} alt="" />
                <span>{currentUser.displayName}</span>
                <PowerSettingsNewIcon className='logout' onClick={() => signOut(auth)} />
            </div>
        </div>
    );
};

export default Navbar;