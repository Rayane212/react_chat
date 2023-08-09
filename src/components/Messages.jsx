import React, { useContext, useEffect, useRef, useState } from 'react';
import Message from './Message';
import { ChatContext } from '../context/ChatContext';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

const Messages = () => {
    const [messages,setMessages] = useState([])
    const { data } = useContext(ChatContext)
    const ref = useRef()


    useEffect(()=>{
        const unSub = onSnapshot(doc(db,"chats", data.chatId), (doc)=>{
            doc.exists() && setMessages(doc.data().messages)
        })
        return ()=>{
            unSub()
        }
    }, [data.chatId])


    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages]);

    return (
        <div ref={ref} className='messages'>
            {messages.map((m)=>(
                <Message  message={m} key={m.id}/>
            ))}

        </div>
    );
};

export default Messages;