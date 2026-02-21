export interface User {
  id: number;
  username: string;
  email: string;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface ShortURL {
  id: string; // UUID
  original_url: string;
  short_key: string;
  short_url: string; // Computed full URL
  custom_key: string | null;
  click_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClickEvent {
  id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  short_url: string; // ID of the short URL
}

export interface Analytics {
  short_url: ShortURL;
  click_count: number;
  recent_clicks: ClickEvent[];
}

export interface ApiError {
  error: string;
  code: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
