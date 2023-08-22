import React, { useContext, useEffect } from 'react';
import Sidebar from './../components/Sidebar';
import Chat from '../components/Chat';
import { ChatContext } from '../context/ChatContext';
import Friends from '../components/Friends';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);


  useEffect(() => {
    const updateOnlineStatus = async (status) => {
      if (auth.currentUser !== null) await updateDoc(doc(db, "users", auth.currentUser.uid), { online: status });
    };

    currentUser !== "" && updateOnlineStatus("online");

    // update status the user is focus  
    const handleFocus = () => {
      setTimeout(() => {
        auth.currentUser !== "" && updateOnlineStatus("online");
      }, 0);
    };

    // update status when focus is lost 
    const handleBlur = () => {
      setTimeout(() => {
        auth.currentUser !== "" && updateOnlineStatus("inactive");
      }, 0);
    };

    // update status when the user close the site  
    const handleBeforeUnload = () => {
      auth.currentUser !== "" && updateOnlineStatus("offline");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      currentUser !== "" && updateOnlineStatus("offline");
    };
  }, [currentUser]);


  
  return (
    <div className="home">
      <div className='container'>
        <Sidebar />
        {data.displayFriends ? <Friends /> : <Chat />}
      </div>
    </div>
  );
};

export default Home;
