import React, { useContext, useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardHeader, Avatar, Typography } from '@mui/material';
import { ChatContext } from '../context/ChatContext';

const Friends = () => {
    const [users, setUsers] = useState([]);
    const { dispatch } = useContext(ChatContext)

    const handleSelect = (u) => {
        dispatch({ type: "CHANGE_USER", payload: u })
    }


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
                        console.log(user),
                        < Card key={user.uid} className='friendCard' sx={{ cursor: "pointer" }} onClick={() => handleSelect(user)} >
                            <CardHeader
                                avatar={<Avatar src={user.photoURL} alt={user.displayName} />}
                                title={user.displayName}
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
