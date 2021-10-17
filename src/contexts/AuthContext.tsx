import { createContext, ReactNode, useContext, useState } from 'react';
import Router from 'next/router';
import { api } from '../services/api';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

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

  async function signIn({ email, password, }: SignInCredentials) {
    try {
      const { data: { permissions, roles } } = await api.post<User>('sessions', {
        email,
        password
      });

      setUser({
        email,
        permissions,
        roles
      });

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