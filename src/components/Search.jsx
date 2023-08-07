import React, { useContext, useState } from 'react';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from './../context/AuthContext';

const Search = () => {
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [err, setErr] = useState(false);

    const {currentUser} = useContext(AuthContext)

    const handleSearch = async () => {
        const q = query(collection(db, "users"), where("displayName", "==", username));

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                setUser(doc.data())
            });
        } catch (err) {
            setErr(true);
        }

    };

    const handleKey = (e) => {
        e.code === "Enter" && handleSearch()
    };

    const handleSelect = async () =>{
        const conbinedId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid;

        try {
            const res = await getDoc(doc(db, "chats", conbinedId))

            if(!res.exists()){
                // Create a chats in firestore collection 
                await setDoc(doc(db, "chats", conbinedId), {messages:[]})

                // Create user chats
                await updateDoc(doc(db, "userChats", currentUser.uid),{
                    [conbinedId+".userInfo"]:{
                        uid:user.uid,
                        displayName: user.displayName, 
                        photoURL: user.photoURL
                    }, 
                    [conbinedId+".date"]: serverTimestamp()
                })

                await updateDoc(doc(db, "userChats", user.uid),{
                    [conbinedId+".userInfo"]:{
                        uid:currentUser.uid,
                        displayName: currentUser.displayName, 
                        photoURL: currentUser.photoURL
                    }, 
                    [conbinedId+".date"]: serverTimestamp()
                })


            }

        } catch (error) {
            
        }

        setUser(null);
        setUsername("");
    };
    return (
        <div className='search'>
            <div className="searchForm">
                <input type="text" placeholder='Find a user' onKeyDown={handleKey} onChange={e => setUsername(e.target.value)} value={username} />
            </div>
            {err && <span>User not found</span>}
            {user && <div className="userChat" onClick={(e) => handleSelect()}>
                <img src={user.photoURL} alt="" />
                <div className="userChatInfo">
                    <span>{user.displayName}</span>
                </div>
            </div>}
        </div>
    );
};

export default Search;