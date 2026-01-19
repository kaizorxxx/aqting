
import { createClient, User } from '@supabase/supabase-js';
import { Course, Comment, AppSettings, BannerSlide, PopupSettings } from '../types';

// ==========================================
// KONFIGURASI SUPABASE (WAJIB DIISI)
// ==========================================
const SUPABASE_URL = 'https://jvwwazeuxmisehplhmtl.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3dhemV1eG1pc2VocGxobXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODM2NjUsImV4cCI6MjA4NDA1OTY2NX0.72ydk1kZOO_WnQthfHKyuFZHJwmxk0Zi4kOWjkYLzy0';

const isConfigured = !SUPABASE_URL.includes('YOUR_PROJECT_ID');

if (!isConfigured) {
    console.warn("⚠️ SUPABASE BELUM DIKONFIGURASI: Fitur database dinonaktifkan sementara. Silakan edit services/supabaseService.ts");
}

export const supabase = isConfigured 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Login Admin Resmi (Email/Password)
export const loginAdmin = async (email: string, pass: string) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
    });
    if (error) throw error;
    return data;
};

// Logout Admin
export const logoutAdmin = async () => {
    if (supabase) await supabase.auth.signOut();
};

// Cek status auth
export const ensureAuthConnection = async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
};

// --- Courses ---
export const subscribeToCourses = (callback: (courses: Course[]) => void, onError?: (error: Error) => void) => {
    if (!supabase) {
        // Return empty data if not configured
        callback([]);
        return () => {};
    }

    const fetchCourses = async () => {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('uploadTime', { ascending: false }); // Sesuaikan sorting
        
        if (error) {
            if (onError) onError(new Error(error.message));
        } else {
            callback(data as Course[] || []);
        }
    };

    fetchCourses();

    // Subscribe to realtime changes
    const channel = supabase
        .channel('public:courses')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
            fetchCourses();
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const addCourse = async (course: Omit<Course, 'id'>) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { error } = await supabase.from('courses').insert([course]);
    if (error) throw new Error(error.message);
};

export const updateCourse = async (courseId: string, courseData: Omit<Course, 'id'>) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { error } = await supabase.from('courses').update(courseData).eq('id', courseId);
    if (error) throw new Error(error.message);
};

export const deleteCourse = async (courseId: string) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) throw new Error(error.message);
};

// --- Comments ---
export const subscribeToComments = (courseId: string, callback: (comments: Comment[]) => void) => {
    if (!supabase) {
        callback([]);
        return () => {};
    }

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('courseId', courseId)
            .order('timestamp', { ascending: false });

        if (!error && data) {
            callback(data as Comment[]);
        } else {
            callback([]);
        }
    };

    fetchComments();

    const channel = supabase
        .channel(`comments:${courseId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `courseId=eq.${courseId}` }, () => {
            fetchComments();
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const addComment = async (courseId: string, comment: Omit<Comment, 'id'>) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { error } = await supabase.from('comments').insert([{ ...comment, courseId }]);
    if (error) throw new Error(error.message);
};

export const deleteComment = async (commentId: string) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw new Error(error.message);
};

// --- Settings (Banners & Popups) ---
export const subscribeToSettings = (callback: (settings: AppSettings) => void, onError?: (error: Error) => void) => {
    if (!supabase) {
        callback({
            popup: { enabled: false, image: '🎥', text: 'Selamat Datang!', link: '#' },
            banners: {}
        });
        return () => {};
    }

    const fetchSettings = async () => {
        // Fetch Popup
        const { data: popupData, error: popupError } = await supabase
            .from('popup_settings')
            .select('*')
            .single();

        // Fetch Banners
        const { data: bannersData, error: bannersError } = await supabase
            .from('banners')
            .select('*');

        if (popupError && popupError.code !== 'PGRST116') { // Ignore 'row not found' for initial setup
             if (onError) onError(new Error(popupError.message));
             return;
        }

        const bannersMap: Record<string, BannerSlide> = {};
        if (bannersData) {
            bannersData.forEach((b: any) => {
                bannersMap[b.id] = b;
            });
        }

        callback({
            popup: popupData || { enabled: false, image: '🎥', text: 'Selamat Datang!', link: '#' },
            banners: bannersMap
        });
    };

    fetchSettings();

    const channel = supabase
        .channel('public:settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'popup_settings' }, fetchSettings)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, fetchSettings)
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const updatePopupSettings = async (settings: PopupSettings) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    // Upsert (Update if exists, Insert if not) for ID 1
    const { error } = await supabase.from('popup_settings').upsert({
        id: 1, 
        enabled: settings.enabled,
        image: settings.image,
        text: settings.text,
        link: settings.link
    });
    if (error) throw new Error(error.message);
};

export const addBanner = async (banner: Omit<BannerSlide, 'id'>) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { error } = await supabase.from('banners').insert([banner]);
    if (error) throw new Error(error.message);
};

export const deleteBanner = async (bannerId: string) => {
    if (!supabase) throw new Error("Database belum dikonfigurasi");
    const { error } = await supabase.from('banners').delete().eq('id', bannerId);
    if (error) throw new Error(error.message);
};
