export interface UserPayload {
  id: string;
  role: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
