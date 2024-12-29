// Storage utilities
const StorageUtil = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || null;
        } catch (e) {
            console.error(`Error reading from localStorage: ${e}`);
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error writing to localStorage: ${e}`);
            return false;
        }
    },
    
    append: (key, value) => {
        const current = StorageUtil.get(key) || [];
        if (!Array.isArray(current)) return false;
        current.push(value);
        return StorageUtil.set(key, current);
    }
};

// DOM utilities
const DOMUtil = {
    create: (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        return element;
    },

    fadeIn: (element, duration = CONFIG.ANIMATIONS.DURATION) => {
        element.style.opacity = 0;
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ${CONFIG.ANIMATIONS.EASING}`;
        setTimeout(() => element.style.opacity = 1, 10);
    },

    fadeOut: (element, duration = CONFIG.ANIMATIONS.DURATION) => {
        element.style.opacity = 1;
        element.style.transition = `opacity ${duration}ms ${CONFIG.ANIMATIONS.EASING}`;
        element.style.opacity = 0;
        setTimeout(() => element.style.display = 'none', duration);
    }
};

// Progress tracking utilities
const ProgressUtil = {
    calculateProgress: (category) => {
        const watchedVideos = StorageUtil.get(CONFIG.STORAGE_KEYS.WATCHED_VIDEOS) || [];
        const categoryVideos = videoData[category] || [];
        const watchedInCategory = categoryVideos.filter(video => watchedVideos.includes(video.id));
        return Math.round((watchedInCategory.length / categoryVideos.length) * 100);
    },

    updateAllProgress: () => {
        CONFIG.VIDEO_CATEGORIES.forEach(category => {
            const progress = ProgressUtil.calculateProgress(category.id);
            const element = document.querySelector(`[data-section="${category.id}"] .section-duration`);
            if (element) {
                element.textContent = `${progress}% Complete`;
            }
        });
    }
};

// Analytics utilities
const AnalyticsUtil = {
    logEvent: (eventName, data = {}) => {
        // Implementation for analytics tracking
        console.log('Analytics Event:', eventName, data);
    },

    logError: (error, context = {}) => {
        console.error('Error:', error, context);
        // Implementation for error tracking
    }
};

// Format utilities
const FormatUtil = {
    formatNumber: (number) => {
        return new Intl.NumberFormat().format(number);
    },

    formatDuration: (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    formatDate: (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    }
};

// Validation utilities
const ValidationUtil = {
    isValidEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidYouTubeId: (id) => {
        return /^[a-zA-Z0-9_-]{11}$/.test(id);
    }
};

// Video utilities
const videoUtils = {
    createVideoCard(video) {
        return `
            <div class="bg-white rounded-lg shadow-sm mb-4 overflow-hidden" data-video-id="${video.id}">
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <div class="relative">
                                <img src="${video.thumbnail}" alt="${video.title}" class="w-60 rounded">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <button class="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700" 
                                            onclick="videoUtils.playVideo('${video.id}', '${video.youtubeId}')">
                                        <i class="fas fa-play"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="text-lg font-medium text-gray-900">${video.title}</h3>
                            <div class="mt-1 flex items-center text-sm text-gray-500">
                                <i class="fas fa-clock mr-1"></i>
                                <span>${video.duration}</span>
                                ${video.hasSubtitles ? `
                                    <span class="mx-2">•</span>
                                    <i class="fas fa-closed-captioning mr-1"></i>
                                    <span>English subtitles</span>
                                ` : ''}
                            </div>
                            <p class="mt-2 text-sm text-gray-600">${video.description}</p>
                            <div class="mt-3">
                                <div class="bg-gray-200 rounded-full h-2 w-full">
                                    <div class="video-progress bg-blue-600 h-2 rounded-full" 
                                         style="width: ${videoState.getVideoProgress(video.id)}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderVideoList(level) {
        const videos = LESSONS_CONFIG[level] || [];
        const container = document.getElementById(`${level}-content`);
        if (container) {
            container.innerHTML = videos.map(video => this.createVideoCard(video)).join('');
        }
    },

    playVideo(videoId, youtubeId) {
        // Create modal with YouTube player
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium">Watching: ${LESSONS_CONFIG[videoId]?.title || ''}</h3>
                    <button class="text-gray-500 hover:text-gray-700" onclick="videoUtils.closeVideo()">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="relative" style="padding-bottom: 56.25%">
                    <iframe 
                        id="youtube-player"
                        class="absolute inset-0 w-full h-full"
                        src="https://www.youtube.com/embed/${youtubeId}?enablejsapi=1"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Track video progress
        // Note: This requires YouTube IFrame API to be loaded
        let player;
        window.onYouTubeIframeAPIReady = () => {
            player = new YT.Player('youtube-player', {
                events: {
                    onStateChange: (event) => {
                        if (event.data === YT.PlayerState.ENDED) {
                            videoState.markVideoComplete(videoId);
                        } else if (event.data === YT.PlayerState.PLAYING) {
                            // Update progress periodically
                            setInterval(() => {
                                const currentTime = player.getCurrentTime();
                                const duration = player.getDuration();
                                const progress = (currentTime / duration) * 100;
                                videoState.updateVideoProgress(videoId, progress);
                            }, 5000);
                        }
                    }
                }
            });
        };
    },

    closeVideo() {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    initializeTabs() {
        document.querySelectorAll('.lesson-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const level = tab.getAttribute('data-tab');
                this.renderVideoList(level);
            });
        });

        // Initialize with beginner content
        this.renderVideoList('beginner');
    }
};
