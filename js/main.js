// Import the existing script.js content
class CourseController {
    constructor() {
        this.initializePage();
    }

    async initializePage() {
        try {
            await this.loadVideoData();
            this.renderSections();
            this.initializeEventListeners();
        } catch (error) {
            console.error('Failed to initialize page:', error);
            this.showError('Failed to load course content. Please try again later.');
        }
    }

    async loadVideoData() {
        // In a real app, this would come from an API
        const videoData = {
            beginner: [
                {
                    id: 'b1',
                    title: 'Introduction to Mini-Stories Method',
                    thumbnail: 'https://img.youtube.com/vi/EXAMPLE1/maxresdefault.jpg',
                    duration: '10:15',
                    views: 15420,
                    youtubeId: 'EXAMPLE1'
                },
                {
                    id: 'b2',
                    title: 'Basic Conversation Patterns',
                    thumbnail: 'https://img.youtube.com/vi/EXAMPLE2/maxresdefault.jpg',
                    duration: '12:30',
                    views: 12350,
                    youtubeId: 'EXAMPLE2'
                },
                {
                    id: 'b3',
                    title: 'Daily Routines Story',
                    thumbnail: 'https://img.youtube.com/vi/EXAMPLE3/maxresdefault.jpg',
                    duration: '15:45',
                    views: 9870,
                    youtubeId: 'EXAMPLE3'
                }
            ],
            intermediate: [
                {
                    id: 'i1',
                    title: 'Complex Sentence Structures',
                    thumbnail: 'https://img.youtube.com/vi/EXAMPLE4/maxresdefault.jpg',
                    duration: '18:20',
                    views: 8540,
                    youtubeId: 'EXAMPLE4'
                },
                {
                    id: 'i2',
                    title: 'Business English Conversations',
                    thumbnail: 'https://img.youtube.com/vi/EXAMPLE5/maxresdefault.jpg',
                    duration: '20:10',
                    views: 7230,
                    youtubeId: 'EXAMPLE5'
                }
            ],
            advanced: [
                {
                    id: 'a1',
                    title: 'Advanced Idioms and Expressions',
                    thumbnail: 'https://img.youtube.com/vi/EXAMPLE6/maxresdefault.jpg',
                    duration: '25:30',
                    views: 6120,
                    youtubeId: 'EXAMPLE6'
                },
                {
                    id: 'a2',
                    title: 'Native Speaker Conversations',
                    thumbnail: 'https://img.youtube.com/vi/EXAMPLE7/maxresdefault.jpg',
                    duration: '22:45',
                    views: 5890,
                    youtubeId: 'EXAMPLE7'
                }
            ]
        };

        StorageUtil.set(CONFIG.STORAGE_KEYS.VIDEO_DATA, videoData);
    }

    renderSections() {
        const videoData = StorageUtil.get(CONFIG.STORAGE_KEYS.VIDEO_DATA);
        
        Object.entries(videoData).forEach(([level, videos]) => {
            const grid = document.getElementById(`${level}-grid`);
            if (!grid) return;

            // Clear loading skeletons
            grid.innerHTML = '';

            // Render video cards
            videos.forEach(video => {
                const card = this.createVideoCard(video);
                grid.appendChild(card);
            });
        });
    }

    createVideoCard(video) {
        const template = document.getElementById('video-card-template');
        const card = template.content.cloneNode(true);

        // Set card data
        const thumbnail = card.querySelector('.video-thumbnail img');
        thumbnail.src = video.thumbnail;
        thumbnail.alt = video.title;

        const duration = card.querySelector('.video-duration');
        duration.textContent = video.duration;

        const title = card.querySelector('.video-title');
        title.textContent = video.title;

        const viewsCount = card.querySelector('.views-count');
        viewsCount.textContent = FormatUtil.formatNumber(video.views);

        const progress = card.querySelector('.video-progress');
        if (appState.isVideoWatched(video.id)) {
            progress.style.display = 'flex';
        } else {
            progress.style.display = 'none';
        }

        // Add click handler
        const videoCard = card.querySelector('.video-card');
        videoCard.addEventListener('click', () => {
            window.location.href = `video.html?id=${video.id}`;
        });

        return card;
    }

    initializeEventListeners() {
        // Add scroll animations
        const sections = document.querySelectorAll('.course-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            observer.observe(section);
        });

        // Handle explore button click
        const exploreButton = document.querySelector('.hero .btn-secondary');
        if (exploreButton) {
            exploreButton.addEventListener('click', () => {
                document.getElementById('beginner').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }
    }

    showError(message) {
        const errorElement = DOMUtil.create('div', {
            className: 'error-message'
        }, [message]);
        
        document.querySelector('main').prepend(errorElement);
    }
}

// Initialize the course page when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CourseController();
});
