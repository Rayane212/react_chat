import React, { useState } from 'react';
import Add from '../img/addAvatar.png';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from 'react-router-dom';
import { Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Register = () => {
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    setErr("")
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const date = new Date().getTime();
      const storageRef = ref(storage, `img/avatars/${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(async () => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });

            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            setErr("Something went wrong");
          } finally {
            setLoading(false);
          }
        });
      });
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        setErr("Email already exists. Please use a different email.");
      } else {
        setErr("Something went wrong");
      }
      setLoading(false);
    }
  };

  return (
    <div className='formContainer'>
      <div className='formWrapper'>
        <span className='logo'>React Chat</span>
        <span className='title'>Register</span>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder='display name' />
          <input type="email" placeholder="email" id="email" required />
          <div className="passwordInput">
                    <input type={showPassword ? "text" : "password"} placeholder="password" name="password" id="password" autoComplete="current-password" required />
                    <span
                            className="passwordIcon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </span>
                    </div>          <input style={{ display: "none" }} type="file" id="file" />
          <label htmlFor='file'>
            <img src={Add} alt="" />
            <span>Add an Avatar</span>
          </label>
          <button>Sign up</button>
          {loading && <Alert severity="info" sx={{ width: "250px" }}>Uploading and compressing the image, please wait...</Alert>}
          {err && <Alert severity="error" sx={{ width: "250px" }}>{err}</Alert>}

        </form>
        <p>You already have an account? <Link to="/login">Login</Link> </p>
      </div>
    </div>
  );
};

export default Register;
