import React, { useContext } from 'react'
import Sidebar from './../components/Sidebar';
import Chat from '../components/Chat';
import { ChatContext } from '../context/ChatContext';
import Friends from '../components/Friends';

const Home = () => {
  const { data } = useContext(ChatContext)
  return (
    <div className='home'>
      <div className='container'>
        <Sidebar />
        {data.displayFriends ? <Friends /> : <Chat />}
      </div>
    </div>
  )
}

export default Home
