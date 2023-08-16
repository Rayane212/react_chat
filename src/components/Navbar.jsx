import React, { useContext, useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { ChatContext } from '../context/ChatContext';
import { Avatar, Badge, Tooltip } from '@mui/material';
import { doc, onSnapshot } from 'firebase/firestore';

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);
    const { dispatch } = useContext(ChatContext);
    const [unreadCount, setUnreadCount] = useState(0);



    useEffect(() => {
        const getUnreadCount = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
                const userChatsData = doc.data();
                if (userChatsData) {
                    let count = 0;

                    Object.entries(userChatsData).forEach(([chatId, chatData]) => {
                        if (chatData.lastMessage && chatData.lastMessage.unread) {
                            count++;
                        }
                    });

                    setUnreadCount(count);

                    if (count > 0) {
                        document.title = `● Nouveaux messages - React Chat`;
                    } else {
                        document.title = "React Chat";
                    }
                }
            });

            return () => {
                unsub();
            };
        };

        currentUser.uid && getUnreadCount();
    }, [currentUser.uid]);


    const handleFriends = () => {
        console.log(unreadCount)
        dispatch({ type: "DISPLAY_FRIENDS" });
    }


    return (
        <div className='navbar'>
            <div className='logoMsg'>
                <Tooltip title="see all users" arrow>
                    <div>
                        <Badge badgeContent={unreadCount} color="error" overlap="circular" size="smaill" anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}  >
                            <Avatar sx={{ backgroundColor: "transparent" }}>
                                <QuestionAnswerIcon className="msgIcon" onClick={() => handleFriends()} />
                            </Avatar>
                        </Badge>
                        <span className='logo' onClick={() => handleFriends()}>React Chat</span>
                    </div>

                </Tooltip>

            </div>
            <div className="user">
                <Avatar className="img" src={currentUser.photoURL} alt={currentUser.displayName} />
                <span>{currentUser.displayName}</span>
                <Tooltip title="logout" arrow>
                    <PowerSettingsNewIcon className='logout' onClick={() => signOut(auth)} />
                </Tooltip>
            </div>
            
            
        </div>
    );
};

export default Navbar;