import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

// Mock du BrowserRouter
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => children,
    Navigate: jest.fn()
  };
});

const originalProtectedRoute = App.prototype.ProtectedRoute;
App.prototype.ProtectedRoute = jest.fn(({ children }) => children);

afterAll(() => {
  App.prototype.ProtectedRoute = originalProtectedRoute; // restaurer la fonction après tous les tests
});

const renderWithRouter = (ui, { route = '/', authContextValue, chatContextValue } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <AuthContext.Provider value={authContextValue}>
      <ChatContext.Provider value={chatContextValue}>
        {ui}
      </ChatContext.Provider>
    </AuthContext.Provider>,
    { wrapper: MemoryRouter }
  );
};

describe('<App />', () => {
  beforeEach(() => {
    Navigate.mockReset();
  });
  it('Redirects to Login page when user is not authenticated', async () => {
    renderWithRouter(<App />, {
      authContextValue: { currentUser: null }
    });

    await waitFor(() => {
      expect(Navigate).toHaveBeenCalledWith({ to: '/login' }, {});
    }, { timeout: 2000 });
  });

  it('Let the user in the Home page when he is authenticated', async () => {
    renderWithRouter(<App />, {
      authContextValue: { currentUser: { uid: 'testUser' } },
      chatContextValue: {
        data: {
          chatId: "null",
          user: {},
          displayFriends: true
        }
      }
    });

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  it('Shows Loading component when isLoading is true', async () => {
    jest.useFakeTimers();
    renderWithRouter(<App />, {
      authContextValue: { currentUser: null }
    });

    expect(screen.getByTitle("Loading")).toBeInTheDocument();

    jest.advanceTimersByTime(1000); // Avance le temps de 1000 ms

    await waitFor(() => {
      expect(screen.queryByTitle("Loading")).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
