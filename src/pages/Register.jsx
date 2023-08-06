import React, { useState } from 'react';
import Add from '../img/addAvatar.png'
import { createUserWithEmailAndPassword, updateProfile, getIdToken } from "firebase/auth";
import { auth, storage, db } from "../firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore"


const Register = () => {
    const [err, setErr] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const displayName = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;
        const file = e.target[3].files[0];

        try {
            const res = createUserWithEmailAndPassword(auth, email, password);

            const storageRef = ref(storage, displayName);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Handle upload progress if needed
                },
                (error) => {
                    console.log("ERROR 1 : " + error);
                    setErr(true);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        const { currentUser } = auth
                        const token = await getIdToken(currentUser, true)

                        updateProfile(res.user, {
                            displayName,
                            photoURL: downloadURL,
                        }, token);
                        setDoc(doc(db, "users", currentUser.uid), {
                            uid: currentUser.uid,
                            displayName,
                            email,
                            photoURL: downloadURL,
                        });
                    } catch (error) {
                        console.log("ERROR 2 : " + error);
                        setErr(true);
                    }
                }
            );
        } catch (err) {
            console.log("ERROR 3 :" + err);
            setErr(true);
        }


    }

    return (
        <div className='formContainer'>
            <div className='formWrapper'>
                <span className='logo'>React Chat</span>
                <span className='title'>Register</span>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='display name' />
                    <input type="email" placeholder="email" name="" id="email" />
                    <input type="password" placeholder="password" name="" id="password" />
                    <input style={{ display: "none" }} type="file" name="" id="file" />
                    <label htmlFor='file'>
                        <img src={Add} alt="" />
                        <span>Add an Avatar</span>
                    </label>
                    <button>Sign up</button>
                    {err && <span>Something went wrong</span>}
                </form>
                <p>You do have an account? Login </p>

            </div>
        </div>
    );
};

export default Register;