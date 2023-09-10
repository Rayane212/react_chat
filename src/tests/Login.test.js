import React from 'react';
import Login from '../pages/Login';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'
import { collection, doc, updateDoc } from 'firebase/firestore';

const mockNavigate = jest.fn();
const mockLink = jest.fn()

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    Link: () => mockLink,
}));

jest.mock('firebase/auth', () => {
    return {
        signInWithEmailAndPassword: jest.fn()
    }
});

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
}));

jest.mock('../firebase', () => ({
    auth: {
        currentUser: {
            uid: 'testUID'
        }
    },
    db: {}
}));

describe('<Login />', () => {
    beforeEach(() => {
        signInWithEmailAndPassword.mockImplementation((auth, email, password) => {
            if (email === 'test@example.com' && password === 'testPassword') {
                return Promise.resolve();
            } else {
                return Promise.reject({ code: 'auth/wrong-password' });
            }
        });
        collection.mockImplementation((db, path) => {
            if (path === "users") {
                return {};
            }
            throw new Error(`Unexpected path: ${path}`);
        });
        doc.mockImplementation((usersRef, uid) => {
            if (uid === 'testUID') {
                return {};
            }
            throw new Error(`Unexpected uid: ${uid}`);
        });
        updateDoc.mockReturnValue(Promise.resolve());
    });

    it('Should render sign in form', () => {
        render(<Login />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByText('Sign in')).toBeInTheDocument();
    })

    it('Sign In and update collection', async () => {
        render(<Login />);

        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const button = screen.getByText('Sign in');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'testPassword');
        });

        await waitFor(() => {
            expect(collection).toHaveBeenCalledWith(db, "users");
        });

        await waitFor(() => {
            expect(doc).toHaveBeenCalledWith({}, 'testUID');
        });

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalledWith({}, { online: "online" });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('Password is wrong', async () => {
        render(<Login />);

        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const button = screen.getByText('Sign in');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongPassword' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Wrong password')).toBeInTheDocument();
        });
    });
});
