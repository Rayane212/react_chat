import Register from './pages/Register';
import Login from './pages/Login';
import './style.scss';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import Error404 from './pages/Error404';
import Loading from './components/mui/Loading';

function App() {
  const { currentUser } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const enterFullscreen = () => {

      if (window.navigator.standalone) {
        const element = document.documentElement;

        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      }
    };

    enterFullscreen();

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);



  const ProtectedRoute = ({ children }) => {

    if (isLoading) {
      return <Loading loading={isLoading} />
    }

    if (!currentUser) {
      return <Navigate to="/login" />
    }
    return children;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route index element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>}
          />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
