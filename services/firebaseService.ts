
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove, push, update } from 'firebase/database';
import { Course, Comment, AppSettings, BannerSlide, PopupSettings } from '../types';

const firebaseConfig = {
    apiKey: "AIzaSyBakjlWu0_PCfJYNJRsNScmpD1bJVQetMU",
    authDomain: "aqting-aqal.firebaseapp.com",
    databaseURL: "https://aqting-aqal-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aqting-aqal",
    storageBucket: "aqting-aqal.firebasestorage.app",
    messagingSenderId: "135142655439",
    appId: "1:135142655439:web:f837fc608ab3504713beba"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Courses
export const subscribeToCourses = (callback: (courses: Course[]) => void) => {
  const coursesRef = ref(db, 'courses');
  return onValue(coursesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const list = Object.entries(data).map(([key, val]) => ({
        ...(val as any),
        id: key
      }));
      callback(list);
    } else {
      callback([]);
    }
  });
};

export const addCourse = async (course: Omit<Course, 'id'>) => {
  const coursesRef = ref(db, 'courses');
  const newRef = push(coursesRef);
  await set(newRef, course);
};

export const updateCourse = async (courseId: string, courseData: Omit<Course, 'id'>) => {
  const courseRef = ref(db, `courses/${courseId}`);
  await update(courseRef, courseData);
};

export const deleteCourse = async (courseId: string) => {
  await remove(ref(db, `courses/${courseId}`));
  await remove(ref(db, `comments/${courseId}`));
};

// Comments
export const subscribeToComments = (courseId: string, callback: (comments: Comment[]) => void) => {
  const commentsRef = ref(db, `comments/${courseId}`);
  return onValue(commentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const list = Object.entries(data).map(([key, val]) => ({
        ...(val as any),
        id: key
      })).sort((a, b) => b.timestamp - a.timestamp);
      callback(list);
    } else {
      callback([]);
    }
  });
};

export const addComment = async (courseId: string, comment: Omit<Comment, 'id'>) => {
  const commentsRef = ref(db, `comments/${courseId}`);
  const newRef = push(commentsRef);
  await set(newRef, comment);
};

export const deleteComment = async (courseId: string, commentId: string) => {
  await remove(ref(db, `comments/${courseId}/${commentId}`));
};

// Settings (Banners & Popups)
export const subscribeToSettings = (callback: (settings: AppSettings) => void) => {
  const settingsRef = ref(db, 'settings');
  return onValue(settingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({
        popup: data.popup || { enabled: false, image: '🎥', text: 'Selamat Datang!', link: '#' },
        banners: data.banners || {}
      });
    } else {
      callback({
        popup: { enabled: false, image: '🎥', text: 'Selamat Datang!', link: '#' },
        banners: {}
      });
    }
  });
};

export const updatePopupSettings = async (settings: PopupSettings) => {
  const popupRef = ref(db, 'settings/popup');
  // Memastikan objek terdefinisi sebelum dikirim
  const payload = {
    enabled: settings.enabled ?? false,
    image: settings.image || '🎥',
    text: settings.text || '',
    link: settings.link || '#'
  };
  await set(popupRef, payload);
};

export const addBanner = async (banner: Omit<BannerSlide, 'id'>) => {
  const bannerRef = ref(db, 'settings/banners');
  const newRef = push(bannerRef);
  await set(newRef, { ...banner, id: newRef.key });
};

export const deleteBanner = async (bannerId: string) => {
  await remove(ref(db, `settings/banners/${bannerId}`));
};
