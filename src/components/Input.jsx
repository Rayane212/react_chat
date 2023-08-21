import React, { useContext, useState } from 'react';
import Img from '../img/img.png'
import Attach from '../img/attach.png'
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { Timestamp, arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { v4 as uuid } from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import LinearDeterminate from './mui/LinearDeterminate';
import { Alert, Badge, IconButton } from '@mui/material';
import { Clear } from '@mui/icons-material';


const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const sendMessage = new Audio("https://firebasestorage.googleapis.com/v0/b/react-chat-6ddfc.appspot.com/o/audio%2FSendMessage.mp3?alt=media&token=d5d77da4-319c-425c-9f88-2daeb6e826cc")
  const [isPlaying, setIsPlaying] = useState(false);

  const playSendMessageSound = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      sendMessage.play();

      sendMessage.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  };

  const handleClearFile = (e) => {
    e.preventDefault()
    setImg(null);
    setVideo(null);
  };

  const handleKey = (e) => {
     e.code === "Enter" && handleSend()
  };

  const handleSend = async () => {
    if (!text && !img && !video) {
      return;
    }

    if (img || video) {

      const storageRef = ref(storage, `${(img != null ? "img/" : "videos/") + uuid()}`);

      const uploadTask = uploadBytesResumable(storageRef, img != null ? img : video);

      uploadTask.on('state_changed',
        (snapshot) => {
          const loading = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(loading);
          if (progress === 100) {
            setProgress(0)
          }
          setUploading(true)
        },
        (error) => {
          console.error("Error during upload:", error);
          setError(true);
          setUploading(false)
        },
        () => {
          try {
            getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
              await updateDoc(doc(db, "chats", data.chatId), {
                messages: arrayUnion({
                  id: uuid(),
                  text,
                  senderId: currentUser.uid,
                  date: Timestamp.now(),
                  [img ? "img" : "video"]: downloadURL,
                }),
              })
            });


          } catch (error) {
            setError(true)
            setProgress(0)
            setUploading(false)
          }
        }
      );

    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        })
      })
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        unread: false,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        unread: true
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    playSendMessageSound();
    
    setText("");
    setImg(null);
    setVideo(null);
    setProgress(0)
    setError(false)
    setUploading(false)
  };

  const handleFileChange = (e) => {
    if (e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    if (file.type.includes('image')) {
      setImg(file);
      setVideo(null);
    } else if (file.type.includes('video')) {
      setVideo(file);
      setImg(null);
    }
  };

 



  return (
    <>
      <div className="progress">
        {progress > 0 && progress < 100 && (
          <LinearDeterminate value={Math.round(progress)} />
        )}
      </div>
      <div className='input'>
      <textarea
          className='textfield'
          id="outlined-multiline-flexible"
          placeholder='Type something...'
          rows={3}
          onKeyDown={handleKey}
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        <div className="send">

          <input type="file" accept='image/*, video/*, audio/*' style={{ display: 'none' }} id="file"
            onChange={handleFileChange} />
          <label htmlFor='file'>
            <img src={Attach} alt="" />
          </label>
          <label htmlFor='file'>
            {img || video ? (
            <Badge
              badgeContent={
                <IconButton style={{backgroundColor:"transparent", color:"black"}} onClick={handleClearFile}>
                <Clear fontSize='small'  />
                </IconButton>
              }
            >
              <img src={Img} alt="" />
            </Badge>
          ) :             
          <img src={Img} alt="" />
        }
          </label>
          
          <button onClick={handleSend} id="send" disabled={uploading}>Send</button>
        </div>
      </div>
      {error &&
        (<Alert className="" severity="error" sx={{ position: 'absolute', bottom: 16, right: 16 }}>An error occurred during upload. Please try again later.</Alert>)
      }
    </>
  );
};

export default Input;