
export interface Course {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  level: 'Spring' | 'Pemula' | 'Menengah' | 'Lanjutan';
  icon: string;
  month: string;
  uploadTime: string;
}

export interface Comment {
  id?: string;
  author: string;
  text: string;
  time: string;
  timestamp: number;
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
