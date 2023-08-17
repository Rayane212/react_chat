import React, { useContext, useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { AuthContext } from './../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Avatar, Fade, Paper, Popper, Snackbar, TextField } from '@mui/material';

const Search = () => {
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [err, setErr] = useState(false);
    const searchInputRef = useRef(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [placement, setPlacement] = React.useState();



    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setErr(false);
    };

    const handleClick = (newPlacement) => (event) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => placement !== newPlacement || !prev);
        setPlacement(newPlacement);
    };

    useEffect(() => {
        if (searchVisible) {
            searchInputRef.current.focus();
        }
    }, [searchVisible]);


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
        if (e.code === "Enter" || e.code === "Escape") {
            setOpen(false);
        }
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
            <Popper open={open} anchorEl={anchorEl} placement={placement} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper>
                            <TextField className="input" id="outlined-search" label="Find a user" type="search" variant='standard' onKeyDown={handleKey} onChange={e => setUsername(e.target.value)} value={username} />
                        </Paper>
                    </Fade>
                )}
            </Popper>

            <SearchIcon className='searchIcon' onClick={handleClick('right-start')} />

            <div className={`searchForm ${searchVisible ? 'mobile' : ''}`} ref={searchInputRef}>
                <TextField className="input" id="outlined-search" label="Find a user" type="search" onKeyDown={handleKey} onChange={e => setUsername(e.target.value)} value={username} />
            </div>

            <Snackbar open={err} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    User not found.
                </Alert>
            </Snackbar>

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
