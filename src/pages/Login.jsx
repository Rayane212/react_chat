import React, { useState } from 'react';
import { deleteUser, fetchSignInMethodsForEmail, getAuth, linkWithCredential, linkWithRedirect, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { Alert, IconButton } from '@mui/material';
import { FacebookOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()

    const handleSignInWithGoogle = async () => {
        try {
            console.log(auth)
            const res = await signInWithPopup(auth, googleProvider);

            const email = res.user.email;
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            console.log(signInMethods)
            console.log(signInMethods.includes("google.com"))

            const userRef = collection(db, "users");
            const userDoc = await getDoc(doc(userRef, email));

            if (userDoc.exists() && userDoc.data().googleLinked) {
                navigate("/login");
                setMsg("Sign in and link your Google account")
                setErr("")
            } else {
                if (signInMethods.includes("google.com")) {
                    await deleteUser(res.user)
                }
                setErr("User not found or not linked");
            }

        } catch (error) {
            console.error("Error signing in with Google:", error);
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
                    <div style={{ margin: '0 auto' }}>
                        <IconButton sx={{ width: 'fit-content', marginRight: '5px' }} onClick={handleSignInWithGoogle}>
                            <GoogleIcon />
                        </IconButton>
                        <IconButton sx={{ width: 'fit-content', marginLeft: '5px' }} onClick={handleSignInWithGoogle}>
                            <FacebookOutlined />
                        </IconButton>
                    </div>
                    <button>Sign in</button>
                    {err !== "" && <Alert className="" severity="error" >{err}</Alert>}
                    {msg !== "" && <Alert className="" severity="infos" >{msg}</Alert>}

                </form>
                <div style={{ textAlign: "center" }}>
                    {/* <p>Forgot your password ?</p> */}
                    <p>You don't have an account? <Link to="/register">Register</Link> </p>
                </div>


            </div>
        </div>
    );
};

export default Login;