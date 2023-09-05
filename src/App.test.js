import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';


test('rendre App.js sans erreur', () => {
  render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
  );


});
