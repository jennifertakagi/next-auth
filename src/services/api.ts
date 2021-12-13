import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';
import { LoginResponse } from '../shared/types/User';

type ErrorAuthResponse = {
  code?: string;
  error?: boolean;
  message?: string;
}

let cookies = parseCookies();
let isRefreshing = false; 
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['@next-auth.token']}`
  }
});

api.interceptors.response.use(response => response, (error: AxiosError) => {
  const { status } = error.response;
  const data: ErrorAuthResponse = error.response.data;

  if (status === 401 ) {
    if (data.code === 'token.expired') {
      cookies = parseCookies();

      const originalConfig = error.config;
      const { '@next-auth.refreshToken': refreshToken} = cookies;

      if (!isRefreshing) {
        isRefreshing = true;

        api.post('/refresh', {
          refreshToken,
        }).then(response => {
          const { token, refreshToken: newRefreshToken } = response.data as LoginResponse;
  
          setCookie(undefined, '@next-auth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          });
  
          setCookie(undefined, '@next-auth.refreshToken', newRefreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          });

          api.defaults.headers['Authorization'] = `Bearer ${token}`;

          failedRequestsQueue.forEach(request => request.onSuccess(token));
          failedRequestsQueue = [];
        }).catch(error => {
          failedRequestsQueue.forEach(request => request.onFailure(error));
          failedRequestsQueue = [];
        }).finally(() => {
          isRefreshing = false;
        });
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`;

            resolve(api(originalConfig));
          },
          onFailure: (error: AxiosError) => {
            reject(error);
          },
        });
      });
    } else {
      signOut();
    }
  }

  return Promise.reject(error);
});