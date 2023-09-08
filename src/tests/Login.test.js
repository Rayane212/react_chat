import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Login from '../pages/Login';
import { MemoryRouter } from 'react-router-dom';


describe('Login page', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    });
    it('handles form submission with valid data', async () => {

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        const emailInput = screen.getByPlaceholderText('email');
        const passwordInput = screen.getByPlaceholderText('password');

        fireEvent.change(emailInput, { target: { value: 'rayanehadi41@gmail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'azerty1234' } });

        const submitButton = screen.getByText('Sign in');
        fireEvent.click(submitButton);


    });
});
