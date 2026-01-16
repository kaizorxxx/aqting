
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove, push, update } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth'; 
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
export const auth = getAuth(app);

// Helper untuk memastikan Auth siap sebelum melakukan write database
// UPDATED: Sekarang me-resolve NULL jika error, supaya flow tidak putus.
// Ini memungkinkan akses jika Database Rules di-set ke PUBLIC.
export const ensureAuthConnection = async (): Promise<User | null> => {
    return new Promise((resolve) => {
        // Cek jika sudah login
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }

        // Jika belum, coba login anonim
        signInAnonymously(auth)
            .then((result) => {
                console.log("Firebase: Connected as Anonymous User", result.user.uid);
                resolve(result.user);
            })
            .catch((error) => {
                console.warn("Auth Warning: Gagal login anonim. Mencoba akses database tanpa auth (Guest Mode).", error.code);
                // Jangan reject! Resolve null agar operasi database tetap dicoba.
                resolve(null);
            });
    });
};

// Auto-connect saat aplikasi dimuat
signInAnonymously(auth).catch((err) => {
    console.warn("Auto-login deferred. Will fallback to guest mode if needed.", err.code);
});

// --- Courses ---
export const subscribeToCourses = (callback: (courses: Course[]) => void, onError?: (error: Error) => void) => {
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
  }, (error) => {
    if (onError) onError(error);
  });
};

export const addCourse = async (course: Omit<Course, 'id'>) => {
  await ensureAuthConnection(); 
  const coursesRef = ref(db, 'courses');
  const newRef = push(coursesRef);
  await set(newRef, course);
};

export const updateCourse = async (courseId: string, courseData: Omit<Course, 'id'>) => {
  await ensureAuthConnection();
  const courseRef = ref(db, `courses/${courseId}`);
  await update(courseRef, courseData);
};

export const deleteCourse = async (courseId: string) => {
  await ensureAuthConnection();
  await remove(ref(db, `courses/${courseId}`));
  await remove(ref(db, `comments/${courseId}`));
};

// --- Comments ---
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
  }, (error) => {
    console.error("Error reading comments:", error);
  });
};

export const addComment = async (courseId: string, comment: Omit<Comment, 'id'>) => {
  await ensureAuthConnection();
  const commentsRef = ref(db, `comments/${courseId}`);
  const newRef = push(commentsRef);
  await set(newRef, comment);
};

export const deleteComment = async (courseId: string, commentId: string) => {
  await ensureAuthConnection();
  await remove(ref(db, `comments/${courseId}/${commentId}`));
};

// --- Settings (Banners & Popups) ---
export const subscribeToSettings = (callback: (settings: AppSettings) => void, onError?: (error: Error) => void) => {
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
  }, (error) => {
    if (onError) onError(error);
  });
};

export const updatePopupSettings = async (settings: PopupSettings) => {
  await ensureAuthConnection();
  const popupRef = ref(db, 'settings/popup');
  const payload = {
    enabled: settings.enabled ?? false,
    image: settings.image || '🎥',
    text: settings.text || '',
    link: settings.link || '#'
  };
  await set(popupRef, payload);
};

export const addBanner = async (banner: Omit<BannerSlide, 'id'>) => {
  await ensureAuthConnection();
  const bannerRef = ref(db, 'settings/banners');
  const newRef = push(bannerRef);
  await set(newRef, { ...banner, id: newRef.key });
};

export const deleteBanner = async (bannerId: string) => {
  await ensureAuthConnection();
  await remove(ref(db, `settings/banners/${bannerId}`));
};
