const CONFIG = {
    APP_NAME: 'AJ Hoge Mini-Story Hub',
    API_VERSION: '1.0',
    STORAGE_KEYS: {
        WATCHED_VIDEOS: 'watchedVideos',
        COURSE_PROGRESS: 'courseProgress',
        USER_PREFERENCES: 'userPreferences',
        VIDEO_DATA: 'videoData'
    },
    LEVELS: {
        BEGINNER: 'beginner',
        INTERMEDIATE: 'intermediate',
        ADVANCED: 'advanced'
    },
    DEFAULT_LEVEL: 'beginner',
    VIDEO_CATEGORIES: [
        { id: 'beginner', name: 'Beginner Level', description: 'Perfect for those just starting their English journey' },
        { id: 'intermediate', name: 'Intermediate Level', description: 'For learners ready to tackle more complex conversations' },
        { id: 'advanced', name: 'Advanced Level', description: 'Master advanced English concepts and fluency' }
    ],
    ANIMATIONS: {
        DURATION: 300,
        EASING: 'ease-in-out'
    }
};

// Video lessons configuration
const LESSONS_CONFIG = {
    beginner: [
        {
            id: 'beg_001',
            title: 'Basic Greetings and Introductions',
            description: 'Learn common greetings and how to introduce yourself naturally in English.',
            youtubeId: 'PLACEHOLDER_ID',
            duration: '15:30',
            thumbnail: 'https://placehold.co/240x135',
            hasSubtitles: true
        },
        {
            id: 'beg_002',
            title: 'Daily Routines',
            description: 'Learn vocabulary and expressions for describing your daily activities.',
            youtubeId: 'PLACEHOLDER_ID',
            duration: '12:45',
            thumbnail: 'https://placehold.co/240x135',
            hasSubtitles: true
        }
    ],
    intermediate: [
        {
            id: 'int_001',
            title: 'Making Plans and Suggestions',
            description: 'Master the art of making plans and giving suggestions in English.',
            youtubeId: 'PLACEHOLDER_ID',
            duration: '18:20',
            thumbnail: 'https://placehold.co/240x135',
            hasSubtitles: true
        }
    ],
    advanced: [
        {
            id: 'adv_001',
            title: 'Business Negotiations',
            description: 'Learn professional vocabulary and expressions for business negotiations.',
            youtubeId: 'PLACEHOLDER_ID',
            duration: '20:15',
            thumbnail: 'https://placehold.co/240x135',
            hasSubtitles: true
        }
    ]
};

// YouTube API configuration
const YOUTUBE_CONFIG = {
    apiKey: 'YOUR_API_KEY', // Replace with actual API key
    playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0
    }
};
