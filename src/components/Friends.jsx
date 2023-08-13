import React, { useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardHeader, Avatar } from '@mui/material';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';

const Friends = () => {
    const [users, setUsers] = useState([]);
    const { dispatch } = useContext(ChatContext)
    const { currentUser } = useContext(AuthContext)

    //rajouter le chat dans la sidebar


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
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData = querySnapshot.docs.map(doc => doc.data());
            setUsers(usersData);
        };
        getUsers();
    }, []);

    return (
        <div className='friends'>
            <div className='Info'>
                <span>Let's go to chat</span>
            </div>
            {users.length === 0 ? (
                <div className='friendsInfo'>
                    <span>No users available</span>
                </div>
            ) : (
                <div className='friendsList'>
                    {users.map(user => (
                        < Card key={user.uid} className='friendCard' sx={{ cursor: "pointer" }} onClick={() => handleSelect(user)} >
                            <CardHeader
                                avatar={<Avatar src={user.photoURL} alt={user.displayName} />}
                                title={currentUser.uid === user.uid ? user.displayName + " (You)" : user.displayName}
                            />

                        </Card>
                    ))}
                </div>
            )
            }
        </div >
    );
};

export default Friends;
