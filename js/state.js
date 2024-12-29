class AppState {
    constructor() {
        this._state = {
            currentUser: null,
            watchedVideos: StorageUtil.get(CONFIG.STORAGE_KEYS.WATCHED_VIDEOS) || [],
            courseProgress: StorageUtil.get(CONFIG.STORAGE_KEYS.COURSE_PROGRESS) || {},
            userPreferences: StorageUtil.get(CONFIG.STORAGE_KEYS.USER_PREFERENCES) || {
                theme: 'light',
                autoplay: true,
                notifications: true
            }
        };
        this._listeners = new Set();
    }

    // Subscribe to state changes
    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    // Notify all listeners of state changes
    _notify() {
        this._listeners.forEach(listener => listener(this._state));
    }

    // Get current state
    getState() {
        return { ...this._state };
    }

    // Update state
    setState(newState) {
        this._state = { ...this._state, ...newState };
        this._notify();
        this._persistState();
    }

    // Persist state to localStorage
    _persistState() {
        StorageUtil.set(CONFIG.STORAGE_KEYS.WATCHED_VIDEOS, this._state.watchedVideos);
        StorageUtil.set(CONFIG.STORAGE_KEYS.COURSE_PROGRESS, this._state.courseProgress);
        StorageUtil.set(CONFIG.STORAGE_KEYS.USER_PREFERENCES, this._state.userPreferences);
    }

    // Video progress methods
    markVideoAsWatched(videoId) {
        if (!this._state.watchedVideos.includes(videoId)) {
            const newWatchedVideos = [...this._state.watchedVideos, videoId];
            this.setState({ watchedVideos: newWatchedVideos });
            ProgressUtil.updateAllProgress();
            AnalyticsUtil.logEvent('video_completed', { videoId });
        }
    }

    isVideoWatched(videoId) {
        return this._state.watchedVideos.includes(videoId);
    }

    // User preference methods
    updateUserPreferences(preferences) {
        const newPreferences = { ...this._state.userPreferences, ...preferences };
        this.setState({ userPreferences: newPreferences });
        AnalyticsUtil.logEvent('preferences_updated', preferences);
    }

    // Course progress methods
    updateCourseProgress(category, progress) {
        const newProgress = { ...this._state.courseProgress, [category]: progress };
        this.setState({ courseProgress: newProgress });
    }

    getCategoryProgress(category) {
        return this._state.courseProgress[category] || 0;
    }
}

// Video progress state management
class VideoState {
    constructor() {
        this.storageKey = 'ajhoge_video_progress';
        this.progress = this.loadProgress();
    }

    loadProgress() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {};
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    updateVideoProgress(videoId, percentage) {
        this.progress[videoId] = percentage;
        this.saveProgress();
        this.updateUI(videoId);
    }

    getVideoProgress(videoId) {
        return this.progress[videoId] || 0;
    }

    updateUI(videoId) {
        const progressBar = document.querySelector(`[data-video-id="${videoId}"] .video-progress`);
        if (progressBar) {
            progressBar.style.width = `${this.progress[videoId]}%`;
        }
    }

    markVideoComplete(videoId) {
        this.updateVideoProgress(videoId, 100);
    }

    isVideoComplete(videoId) {
        return this.getVideoProgress(videoId) === 100;
    }
}

// Create global app state instance
const appState = new AppState();

// Initialize video state manager
const videoState = new VideoState();

// Example usage:
// videoState.updateVideoProgress('video123', 50); // Updates progress to 50%
// videoState.markVideoComplete('video123'); // Marks video as complete
// const progress = videoState.getVideoProgress('video123'); // Gets current progress
