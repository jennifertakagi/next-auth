export type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

export interface LoginResponse extends User {
  refreshToken: string;
  token: string;
};