import React, { useContext } from 'react'
import Sidebar from './../components/Sidebar';
import Chat from '../components/Chat';
import { ChatContext } from '../context/ChatContext';
import Friends from '../components/Friends';

const Home = () => {
  const { data } = useContext(ChatContext)
  // faire un useEffect pour lorsque y'a aucun chat de selectionner que sa parte sur le composant Friends
  return (
    <div className='home'>
      <div className='container'>
        <Sidebar />
        {data.chatId !== 'null' ? <Chat /> : <Friends />}
      </div>
    </div>
  )
}

export default Home
