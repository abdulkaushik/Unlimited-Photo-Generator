export type AspectRatio = "9:16" | "16:9" | "1:1" | "3:4" | "4:3";

export interface Wallpaper {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  createdAt: number;
  aspectRatio?: AspectRatio;
}

export interface GenerationGroup {
  id: string;
  prompt: string;
  wallpapers: Wallpaper[];
  timestamp: number;
  status: 'loading' | 'success' | 'error';
  aspectRatio: AspectRatio;
  errorMessage?: string;
}

export interface GenerationRequest {
  prompt: string;
  referenceImage?: string; // Base64 string without prefix
  aspectRatio: AspectRatio;
}

export type LoadingStatus = 'idle' | 'generating' | 'error' | 'success';