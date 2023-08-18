import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { Avatar, Tooltip } from '@mui/material';
import { signOut } from 'firebase/auth';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import StyledBadge from './mui/StyledBadge';


const Chats = () => {
    const [interact, setInteract] = useState(false)
    const [chats, setChats] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const { currentUser } = useContext(AuthContext)
    const { dispatch } = useContext(ChatContext)
    const newMessageSound = useMemo(() => {
        return new Audio(
            'https://firebasestorage.googleapis.com/v0/b/react-chat-6ddfc.appspot.com/o/audio%2FNewMessage.mp3?alt=media&token=3a5bbd37-fa52-4ff6-a619-09f515ada47c'
        );
    }, []);

    const handlePlaySound = useCallback(() => {

        window.addEventListener("click", () => { return setInteract(true) })
        console.log(interact)
        if (interact) newMessageSound.play();

        newMessageSound.addEventListener('ended', () => {
            newMessageSound.currentTime = 0;
        });
    }, [interact, newMessageSound]);

    useEffect(() => {
        const getChats = () => {
            const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
                setChats(doc.data());
            });
            return () => {
                unsub();
            };
        };
        currentUser.uid && getChats();
    }, [currentUser.uid]);



    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            const updatedOnlineUsers = {};
            snapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                updatedOnlineUsers[userDoc.id] = { ...userData };
            });
            setOnlineUsers(updatedOnlineUsers);
        });

        return () => {
            unsub();
        };
    }, []);



    useEffect(() => {
        Object.entries(chats).forEach((chat, chatId) => {
            if (chat[1]?.lastMessage?.unread) {
                handlePlaySound();
            }
        });
    }, [chats, handlePlaySound]);


    const handleSelect = async (chatId, u) => {
        if (chats[chatId]?.lastMessage?.unread) {
            await updateDoc(doc(db, 'userChats', currentUser.uid), {
                [chatId + '.lastMessage.unread']: false,
            });
        }

        dispatch({ type: 'CHANGE_USER', payload: u });
    };


    const formatElapsedTime = (timestamp) => {
        if (timestamp === null) {
            return '';
        }
        timestamp = timestamp.toDate()
        const now = new Date();
        const elapsedTime = Math.floor((now - timestamp) / 1000);

        if (elapsedTime < 0) {
            return 'Just now';
        } else if (elapsedTime < 60) {
            return `${elapsedTime} s ago`;
        } else if (elapsedTime < 3600) {
            const minutes = Math.floor(elapsedTime / 60);
            return `${minutes} min ago`;
        } else if (elapsedTime < 86400) {
            const hours = Math.floor(elapsedTime / 3600);
            return `${hours} h ago`;
        } else if (elapsedTime < 604800) {
            const days = Math.floor(elapsedTime / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
        else if (elapsedTime < 2419200) {
            const weeks = Math.floor(elapsedTime / 604800);
            return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        }
        else if (elapsedTime < 29030400) {
            const months = Math.floor(elapsedTime / 2419200);
            return `${months} month${months !== 1 ? 's' : ''} ago`;
        }
        else {
            const months = Math.floor(elapsedTime / 29030400);
            return `${months} year${months !== 1 ? 's' : ''} ago`;
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        await updateDoc(doc(db, "users", currentUser.uid), { online: false });
    };

    const sortChats = (a, b) => {
        if (b[1]?.lastMessage?.unread && !a[1]?.lastMessage?.unread) {
            return 1;
        } else if (!b[1]?.lastMessage?.unread && a[1]?.lastMessage?.unread) {
            return -1;
        }

        const userAOnline = onlineUsers[a[1].userInfo.uid]?.online;
        const userBOnline = onlineUsers[b[1].userInfo.uid]?.online;

        if (userAOnline && !userBOnline) {
            return -1;
        } else if (!userAOnline && userBOnline) {
            return 1;
        }

        return b[1].date - a[1].date;
    };


    const badgeStyleOnlineOffline = (online) => {
        if (online) {
            return {
                backgroundColor: '#44b700',
                color: '#44b700',
            };
        } else {
            return {
                backgroundColor: 'grey',
                color: 'grey',
            };
        }

    }

    const badgeStyleNewMessage = () => {
        return {
            backgroundColor: 'red',
            color: 'white',
        };
    }

    return (
        <div className='chats'>
            {Object.entries(chats)
                ?.sort(sortChats)
                .map(([chatId, chat]) => (
                    <Tooltip title={chat.userInfo.displayName} key={chatId} arrow>
                        <div
                            className={`userChat ${chat.lastMessage?.unread ? 'new-message' : ''}`}
                            onClick={() => handleSelect(chatId, chat.userInfo)}
                        >
                            <>
                                <StyledBadge
                                    color="error"
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    variant="dot"
                                    badgestyle={badgeStyleNewMessage()}
                                    invisible={!chat.lastMessage?.unread}>
                                    <StyledBadge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        variant="dot"
                                        badgestyle={badgeStyleOnlineOffline(onlineUsers[chat.userInfo.uid]?.online)}

                                    >
                                        <Avatar
                                            className='img'
                                            src={chat.userInfo.photoURL}
                                            alt={chat.userInfo.displayName}
                                        />
                                    </StyledBadge>
                                </StyledBadge>
                            </>


                            <div className='userChatInfo'>
                                <span>{chat.userInfo.displayName}</span>
                                <p>{chat.lastMessage?.text}</p>
                            </div>
                            <div className='times'>
                                <p>{formatElapsedTime(chat.date)}</p>
                            </div>
                        </div>
                    </Tooltip>
                ))}
            <div className='logoutIcon'>
                <Tooltip title="logout" arrow>
                    <PowerSettingsNewIcon onClick={() => handleSignOut()} />
                </Tooltip>
            </div>
            <audio style={{ display: "none" }} src={newMessageSound} allow="autoplay" />
        </div>
    );
};

export default Chats;