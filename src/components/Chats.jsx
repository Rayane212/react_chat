import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { Avatar, Badge, Tooltip } from '@mui/material';
import { signOut } from 'firebase/auth';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import styled from '@emotion/styled';

const Chats = () => {
    const [chats, setChats] = useState([]);
    const { currentUser } = useContext(AuthContext)
    const { dispatch } = useContext(ChatContext)
    const newMessage = useMemo(
        () =>
          new Audio(
            "https://firebasestorage.googleapis.com/v0/b/react-chat-6ddfc.appspot.com/o/audio%2FNewMessage.mp3?alt=media&token=3a5bbd37-fa52-4ff6-a619-09f515ada47c"
          ),
        []
      );
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
        Object.entries(chats).forEach((chat, chatId) => {
          if (chat[chatId]?.lastMessage?.unread) {
            newMessage.play();
          }
        });
      }, [chats, newMessage]);

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

    


    return (
        <div className='chats'>
            {Object.entries(chats)
                ?.sort((a, b) => b[1].date - a[1].date)
                .map(([chatId, chat]) => (
                    <Tooltip title={chat.userInfo.displayName} key={chatId} arrow>
                        <div
                            className={`userChat ${chat.lastMessage?.unread ? 'new-message' : ''}`}
                            onClick={() => handleSelect(chatId, chat.userInfo)}
                        >
                            <>
                                <Badge
                                    badgeContent=""
                                    color="error"
                                    overlap="circular"
                                    variant="dot"
                                    invisible={!chat.lastMessage?.unread}
                                >
                                    <Avatar
                                        className='img'
                                        src={chat.userInfo.photoURL}
                                        alt={chat.userInfo.displayName}
                                    />
                                </Badge>
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
                    <PowerSettingsNewIcon  onClick={() => signOut(auth)} />
            </Tooltip>
            </div>
        </div>
    );
};

export default Chats;