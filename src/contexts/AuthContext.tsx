import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import Router from 'next/router';
import { setCookie, parseCookies } from 'nookies';
import { api } from '../services/api';
import { User, LoginResponse } from '../shared/types/User';

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  isAuthenticated: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;


  useEffect(() => {
    const { '@next-auth.token': token } = parseCookies();

    if (token) {
      api.get('/me').then((response) => {
        const { email, permissions, roles } = response.data as User;

        setUser({ email, permissions, roles });
      });
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
    <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextData => useContext(AuthContext);