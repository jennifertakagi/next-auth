import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { User, LoginResponse } from '../shared/types/User';
import { api } from '../services/apiClient';

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut () {
  destroyCookie(undefined, '@next-auth.token');
  destroyCookie(undefined, '@next-auth.refreshToken');

  authChannel.postMessage('signOut');

  Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;


  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break; 
      }
    }
  }, []);

  useEffect(() => {
    const { '@next-auth.token': token } = parseCookies();

    if (token) {
      api.get('/me')
        .then((response) => {
          const { email, permissions, roles } = response.data as User;

          setUser({ email, permissions, roles });
        }).catch(() => signOut() );
    }
  }, []);

  async function signIn({ email, password, }: SignInCredentials) {
    try {
      const { data: {
        permissions,
        refreshToken,
        roles,
        token
      } } = await api.post<LoginResponse>('sessions', {
        email,
        password
      });

      setCookie(undefined, '@next-auth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
      setCookie(undefined, '@next-auth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      setUser({
        email,
        permissions,
        roles
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (error) {

    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextData => useContext(AuthContext);