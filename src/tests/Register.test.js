import React from 'react';
import Register from '../pages/Register';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db, storage } from '../firebase'
import { collection, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    Link: () => 'Link',
}));

jest.mock('firebase/auth', () => {
    return {
        createUserWithEmailAndPassword: jest.fn(),
        updateProfile: jest.fn(),
        sendEmailVerification: jest.fn(),
    }
});

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock('../firebase', () => ({
    auth: {
        currentUser: {
            uid: 'testUID'
        }
    },
    storage: {},
    db: {}
}));

describe('<Register/>', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        createUserWithEmailAndPassword.mockImplementation((auth, email, password) => {
            if (email === "test@example.com") {
                return Promise.reject({ code: 'auth/email-already-in-use' });
            }
            if (password.length < 6) {
                return Promise.reject({ code: 'auth/weak-password' });
            }
            return Promise.resolve({
                user: {
                    uid: 'testUID'
                }
            });
        });
    });

    it('should render registration form', () => {
        render(<Register />);
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('+33612536545')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByText('Add an Avatar')).toBeInTheDocument();
        expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('should register a user when the form is submitted', async () => {
        render(<Register />);

        const username = screen.getByPlaceholderText('Username');
        const email = screen.getByPlaceholderText('Email');
        const phoneNumber = screen.getByPlaceholderText('+33612536545');
        const password = screen.getByPlaceholderText('Password');
        const button = screen.getByText('Sign up');


        fireEvent.change(username, { target: { value: 'testuser' } });
        fireEvent.change(email, { target: { value: 'test@test.com' } });
        fireEvent.change(phoneNumber, { target: { value: '+1234567890' } });
        fireEvent.change(password, { target: { value: 'testpassword' } });
        fireEvent.click(button);


        uploadBytesResumable.mockResolvedValueOnce(true);
        getDownloadURL.mockResolvedValueOnce('http://test.com/avatar.png');


        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@test.com', 'testpassword');
        });

        await waitFor(() => {
            expect(sendEmailVerification).toHaveBeenCalledWith({ uid: "testUID" });
        });

        await waitFor(() => {
            expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
        });

        // Attendre que "navigate" soit appelé
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('Shows error when email is already exists', async () => {
        render(<Register />);

        fireEvent.input(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
        fireEvent.input(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.input(screen.getByPlaceholderText('+33612536545'), { target: { value: '+1234567890' } });
        fireEvent.input(screen.getByPlaceholderText('Password'), { target: { value: 'testpassword' } });

        fireEvent.click(screen.getByText('Sign up'));


        await waitFor(() => {
            expect(screen.getByText('Email already exists. Please use a different email.')).toBeInTheDocument();
        });
    });

    it('Shows error when password is weak', async () => {
        render(<Register />);

        fireEvent.input(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
        fireEvent.input(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
        fireEvent.input(screen.getByPlaceholderText('+33612536545'), { target: { value: '+1234567890' } });
        fireEvent.input(screen.getByPlaceholderText('Password'), { target: { value: 'test' } });

        fireEvent.click(screen.getByText('Sign up'));


        await waitFor(() => {
            expect(screen.getByText('Password needs at least 6 characters')).toBeInTheDocument();
        });
    });

    // Vous pouvez ajouter d'autres cas de tests ici
});
