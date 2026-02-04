
export interface ShortLink {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  click_count: number;
  expires_at: string | null;
  created_at: string;
}
