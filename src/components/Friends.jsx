import React, { useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardHeader, Avatar, CircularProgress, Backdrop, Tooltip, Snackbar, Alert } from '@mui/material';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import StyledBadge from './mui/StyledBadge';

const Friends = () => {
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [error, setError] = useState(false);
    const [msgError, setMsgError] = useState("");
    const [loading, setLoading] = useState(false);
    const { dispatch } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setError(false);
    };

    const handleSelect = async (u) => {
        const conbinedId = currentUser.uid > u.uid ? currentUser.uid + u.uid : u.uid + currentUser.uid;

        try {
            const res = await getDoc(doc(db, "chats", conbinedId))

            if (!res.exists()) {
                // Create a chats in firestore collection 
                await setDoc(doc(db, "chats", conbinedId), { messages: [] })

                // Create user chats
                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [conbinedId + ".userInfo"]: {
                        uid: u.uid,
                        displayName: u.displayName,
                        photoURL: u.photoURL
                    },
                    [conbinedId + ".date"]: serverTimestamp()
                })

                await updateDoc(doc(db, "userChats", u.uid), {
                    [conbinedId + ".userInfo"]: {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL
                    },
                    [conbinedId + ".date"]: serverTimestamp()
                })

            }

        } catch (error) {
            setError(true);
            setMsgError(error);
        }

        dispatch({ type: "CHANGE_USER", payload: u })

    };


    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersData = querySnapshot.docs.map(doc => doc.data());
                setUsers(usersData);
            } catch (error) {
                setError(true)
                setMsgError(error)
            } finally {
                setLoading(false);
            }
        };
        getUsers();
    }, []);

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


    const sortFriends = (a, b) => {
        const userAOnline = a?.online;
        const userBOnline = b?.online;

        if (currentUser.uid === a.uid) return -1;
        if (currentUser.uid === b.uid) return 1;

        if (currentUser.uid === a.uid) return -1;
        if (currentUser.uid === b.uid) return 1;

        if (userAOnline === "online" && userBOnline === "offline") return -1;
        if (userAOnline === "offline" && userBOnline === "online") return 1;

        return a.displayName.localeCompare(b.displayName);
    };


    return (
        <div className='friends'>
            <div className='Info'>
                <span>Let's go to chat</span>
            </div>
            {loading && (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}

            {!loading && (
                <div className='friendsList'>
                    {users.length === 0 ? (
                        <div className='friendsInfo'>
                            <span>No users available</span>
                        </div>
                    ) : (
                        <div>
                            {users?.sort(sortFriends).map(user => (
                                <Tooltip title={(currentUser.uid === user.uid ? user.displayName + " (You)" : user.displayName) + " (" + (onlineUsers[user?.uid]?.online) + ")"} key={user.uid} arrow>
                                    <Card className='friendCard' sx={{ cursor: "pointer" }} onClick={() => handleSelect(user)}>
                                        <CardHeader
                                            avatar={
                                                <StyledBadge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    variant="dot"
                                                    mode={onlineUsers[user?.uid].online}
                                                >
                                                    <Avatar src={user.photoURL} alt={user.displayName} />
                                                </StyledBadge>
                                            }
                                            title={currentUser.uid === user.uid ? user.displayName + " (You)" : user.displayName}
                                        />
                                    </Card>
                                </Tooltip>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Snackbar open={error} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {msgError}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Friends;
