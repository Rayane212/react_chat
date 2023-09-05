import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from './context/AuthContext'; 
import App from './App';

const authContextValue = {
  currentUser: null, 
};

test('rendre App.js sans erreur', () => {
  render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <App />
      </AuthContext.Provider>
    </BrowserRouter>
  );


});
