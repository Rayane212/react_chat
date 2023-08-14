import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { Avatar } from '@mui/material';

const Message = ({ message }) => {

    const { currentUser } = useContext(AuthContext)
    const { data } = useContext(ChatContext)

    const timestamp = message.date.toDate();


    const ref = useRef()

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" })
    }, [message]);

    const formatElapsedTime = (timestamp) => {
        const now = new Date();
        const elapsedTime = Math.floor((now - timestamp) / 1000); // Convert to seconds

        if (elapsedTime < 60) {
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

    const [elapsedTimeText, setElapsedTimeText] = useState(formatElapsedTime(timestamp))

    useEffect(() => {
        const intervalId = setInterval(() => {
            setElapsedTimeText(formatElapsedTime(timestamp));
        }, 10000); // Update every minute

        return () => clearInterval(intervalId);
    }, [timestamp]);

    return (
        <div ref={ref} className={`message ${message.senderId === currentUser.uid && "owner"}`}>
            <div className="messageInfo">
                <Avatar src={message.senderId === currentUser.uid ? currentUser.photoURL : data.user.photoURL} alt={message.senderId === currentUser.uid ? currentUser.displayName : data.user.displayName} />
                <span>{elapsedTimeText}</span>
            </div>
            <div className="messageContent">
                {message.text && <p>{message.text}</p>}
                {message.img && <img src={message.img} alt="" />}
                {message.video && <video src={message.video} controls />}

            </div>
        </div>
    );
};

export default Message;
