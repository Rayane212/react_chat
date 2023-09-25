import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import { Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { collection, doc, updateDoc } from 'firebase/firestore';

const Login = () => {
    const [err, setErr] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                    <input type="email" placeholder="Email" name="email" id="email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} value={email} required/>
                    <div className="passwordInput">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" id="password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <span
                            className="passwordIcon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </span>
                    </div>


                    <button>Sign in</button>
                    {err !== "" && <Alert className="" severity="error" >{err}</Alert>}
                </form>
                <p>You don't have an account? <Link to="/register">Register</Link> </p>

            </div>
        </div>
    );
};

export default Login;