
export interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  level: 'Spring' | 'Canva' | 'CapCut' | 'Pixellab';
  icon: string;
  month: string;
  uploadTime: string;
}

export interface CommentReply {
  text: string;
  time: string;
  author: string; // Usually 'Admin'
}

export interface Comment {
  id?: string;
  author: string;
  text: string;
  time: string;
  timestamp: number;
  reply?: CommentReply;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonLink: string;
}

export interface PopupSettings {
  enabled: boolean;
  image: string;
  text: string;
  link: string;
}

export interface AppSettings {
  popup: PopupSettings;
  // Banners are stored as an object where keys are IDs (from Firebase push)
  banners: Record<string, BannerSlide>;
}
