import React, { useState } from 'react';
import { linkWithPopup, linkWithRedirect, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { Alert, IconButton } from '@mui/material';
import { FacebookOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
    const [err, setErr] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()

    const handleSignInWithGoogle = async () => {
        try {
            const res = await signInWithPopup(auth, googleProvider);

            const userRef = doc(db, "users", res.user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists() && !userSnap.data().googleLinked) {
                await linkGoogleAccount(res.user.uid);
            } else if (!userSnap.exists()) {
                await createNewUser(res.user);
            }

            navigate("/");

        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    const linkGoogleAccount = async (uid) => {
        try {
            await linkWithRedirect(auth.currentUser, googleProvider);
            await updateDoc(doc(db, "users", uid), { googleLinked: true });

            const userDoc = await getDoc(doc(db, "users", uid));
            const userData = userDoc.data();

            // Update photoURL only if it's not set from before
            if (!userData.photoURL && auth.currentUser.photoURL) {
                await updateDoc(doc(db, "users", uid), { photoURL: auth.currentUser.photoURL });
            }
        } catch (error) {
            console.error("Error linking Google account:", error);
        }
    };

    const createNewUser = async (user) => {
        try {
            const { uid, displayName, email, photoURL } = user;
            await setDoc(doc(db, "users", uid), {
                uid,
                displayName,
                email,
                photoURL,
                googleLinked: true,
                online: true,
            });
            await setDoc(doc(db, "userChats", uid), {});
        } catch (error) {
            console.error("Error creating new user:", error);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            const usersRef = collection(db, "users");
            await updateDoc(doc(usersRef, auth.currentUser.uid), { online: "online" });


            navigate("/");

        } catch (error) {
            const errorCode = error.code;
            if (errorCode === "auth/user-not-found") {
                setErr("User not found");
            } else if (errorCode === "auth/wrong-password") {
                console.error(error)
                setErr("Wrong password");
            } else {
                setErr("Something went wrong");
            }

        }
    }

    return (
        <div className='formContainer'>
            <div className='formWrapper'>
                <span className='logo'>React Chat</span>
                <span className='title'>Login</span>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="email" name="email" id="email" autoComplete="username" required />
                    <div className="passwordInput">
                        <input type={showPassword ? "text" : "password"} placeholder="password" name="password" id="password" autoComplete="current-password" required />
                        <span
                            className="passwordIcon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </span>
                    </div>
                    <div style={{margin:'0 auto'}}>
                    <IconButton sx={{width:'fit-content', marginRight:'5px'}} onClick={handleSignInWithGoogle}>
                        <GoogleIcon/>
                    </IconButton>
                    <IconButton sx={{width:'fit-content', marginLeft:'5px'}} onClick={handleSignInWithGoogle}>
                        <FacebookOutlined/>
                    </IconButton>
                    </div>
                    <button>Sign in</button>
                    {err !== "" && <Alert className="" severity="error" >{err}</Alert>}
                </form>
                <div style={{textAlign:"center"}}>
                     {/* <p>Forgot your password ?</p> */}
                <p>You don't have an account? <Link to="/register">Register</Link> </p>
                </div>
               

            </div>
        </div>
    );
};

export default Login;