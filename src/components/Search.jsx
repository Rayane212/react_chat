import React, { useContext, useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from './../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar } from '@mui/material';

const Search = () => {
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [err, setErr] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);

    const { currentUser } = useContext(AuthContext);

    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchVisible) {
            searchInputRef.current.focus();
        }
    }, [searchVisible]);

    const handleSearchIconClick = () => {
        setSearchVisible(true);
    };

    const handleClickOutside = (e) => {
        if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
            setSearchVisible(false);
            setErr(false)
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = async () => {
        const q = query(collection(db, "users"), where("displayName", "==", username));

        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size === 0) {
                setErr(true);
            } else {
                querySnapshot.forEach((doc) => {
                    setUser(doc.data());
                });
                setErr(false)
            }

        } catch (err) {
            console.log(err)
            setErr(true);
        }

    };

    const handleKey = (e) => {
        e.code === "Enter" && handleSearch();
    };

    const handleSelect = async () => {
        const conbinedId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid;

        try {
            const res = await getDoc(doc(db, "chats", conbinedId))

            if (!res.exists()) {
                // Create a chats in firestore collection 
                await setDoc(doc(db, "chats", conbinedId), { messages: [] })

                // Create user chats
                await updateDoc(doc(db, "userChats", currentUser.uid), {
                    [conbinedId + ".userInfo"]: {
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL
                    },
                    [conbinedId + ".date"]: serverTimestamp()
                })

                await updateDoc(doc(db, "userChats", user.uid), {
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

        setUser(null);
        setUsername("");
        setErr(false)
    };

    return (
        <div className='search'>
            <SearchIcon className='searchIcon' onClick={handleSearchIconClick} />

            <div className={`searchForm ${searchVisible ? 'mobile' : ''}`} ref={searchInputRef}>
                <input type="text" placeholder='Find a user' onKeyDown={handleKey} onChange={e => setUsername(e.target.value)} value={username} />
            </div>

            {err && <span>User not found</span>}

            {user && (
                <div className="userChat" onClick={handleSelect}>
                    <Avatar src={user.photoURL} alt={user.displayName} />
                    <div className="userChatInfo">
                        <span>{user.displayName}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
