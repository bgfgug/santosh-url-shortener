
export interface User {
  id: number;
  email: string;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
