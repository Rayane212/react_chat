import React, { useEffect, useState } from 'react';
import Add from '../img/addAvatar.png';
import { Loading } from '../components/mui/Loading'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth, storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Avatar, Tooltip } from '@mui/material';
import { Clear, Visibility, VisibilityOff } from '@mui/icons-material';


const Register = () => {
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);


  const handleSubmit = async (e) => {
    setLoading(true);
    setErr("")
    e.preventDefault();


    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await sendEmailVerification(res.user);

      const date = new Date().getTime();
      const storageRef = ref(storage, `img/avatars/${displayName + date}`);


      await uploadBytesResumable(storageRef, file).then(async () => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            await updateProfile(res.user, {
              displayName,
              phoneNumber,
              photoURL: downloadURL,
            });

            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              phoneNumber,
              googleLinked: false,
              online: true,
              photoURL: downloadURL,
            });

            await setDoc(doc(db, "userChats", res.user.uid), {});
            const usersRef = collection(db, "users");
            await updateDoc(doc(usersRef, res.user.uid), { online: "offline" });
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
          <input type="text" placeholder='Username' onChange={(e) => setDisplayName(e.target.value)} required />
          <input type="email" placeholder="Email" id="email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="tel" placeholder="+33612536545" id="tel" onChange={(e) => setPhoneNumber(e.target.value)} required />
          <div className="passwordInput">
            <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" id="password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} required />
            <span
              className="passwordIcon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </span>
          </div>
          <input style={{ display: "none" }} type="file" id="file" accept='image/*' onChange={(e) => setFile(e.target.files[0])} />
          <label htmlFor='file'>
            {imagePreview ? (
              <>
                <img src={Add} alt="" className='addPhoto' />
                <Avatar className="avatarPreview" src={imagePreview} alt='Avatar' />
                <span> preview your avatar </span>
                <Tooltip title="Clear">
                  <Clear onClick={(e) => {
                    e.preventDefault()
                    setFile("");
                    setImagePreview("")
                  }} />
                </Tooltip>
              </>

            ) : (
              <>
                <img src={Add} alt="" className='img' />
                <span>Add an Avatar</span>
              </>

            )}
          </label>
          <button>Sign up</button>
          {loading && <Loading loading={loading} />}
          {err && <Alert severity="error" sx={{ width: "250px" }}>{err}</Alert>}

        </form>
        <p>You already have an account? <Link to="/login">Login</Link> </p>
      </div>
    </div>
  );
};

export default Register;
