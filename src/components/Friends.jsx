import React, { useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardHeader, Avatar, CircularProgress, Backdrop } from '@mui/material';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

const Friends = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { dispatch } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)



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
            console.log(error)
        }

        dispatch({ type: "CHANGE_USER", payload: u })

    };


    useEffect(() => {
        const getUsers = async () => {
            setLoading(true); // Mettre à jour loading à true au début de la requête
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersData = querySnapshot.docs.map(doc => doc.data());
                setUsers(usersData);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false); // Mettre à jour loading à false à la fin de la requête
            }
        };
        getUsers();
    }, []);

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
                            {users.map(user => (
                                <Card key={user.uid} className='friendCard' sx={{ cursor: "pointer" }} onClick={() => handleSelect(user)}>
                                    <CardHeader
                                        avatar={<Avatar src={user.photoURL} alt={user.displayName} />}
                                        title={currentUser.uid === user.uid ? user.displayName + " (You)" : user.displayName}
                                    />
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Friends;
