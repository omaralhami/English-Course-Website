// Import the existing video-page.js content
class VideoPageController {
    constructor() {
        this.video = null;
        this.player = null;
        this.initializePage();
    }

    async initializePage() {
        try {
            await this.loadVideoData();
            this.initializePlayer();
            this.initializeUI();
            this.initializeEventListeners();
            this.loadComments();
        } catch (error) {
            AnalyticsUtil.logError(error, { context: 'VideoPageInit' });
            this.showError('Failed to load video. Please try again later.');
        }
    }

    async loadVideoData() {
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('id');
        
        if (!videoId) {
            throw new Error('No video ID provided');
        }

        const videoData = StorageUtil.get(CONFIG.STORAGE_KEYS.VIDEO_DATA);
        for (const category of Object.values(videoData)) {
            const video = category.find(v => v.id === videoId);
            if (video) {
                this.video = video;
                return;
            }
        }

        throw new Error('Video not found');
    }

    initializePlayer() {
        if (!this.video) return;

        document.title = `${this.video.title} - ${CONFIG.APP_NAME}`;
        document.getElementById('video-title').textContent = this.video.title;

        // Initialize YouTube player
        const playerContainer = document.getElementById('video-player');
        playerContainer.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${this.video.youtubeId}"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;

        // Track video completion
        const iframe = playerContainer.querySelector('iframe');
        iframe.addEventListener('ended', () => this.handleVideoComplete());
    }

    initializeUI() {
        // Set video metadata
        document.getElementById('view-count').textContent = this.video.views;
        document.getElementById('publish-date').textContent = FormatUtil.formatDate(new Date());
        
        // Set like count
        const likeCount = StorageUtil.get(`video_likes_${this.video.id}`) || 
            Math.floor(Math.random() * 1000) + 100;
        document.getElementById('like-count').textContent = FormatUtil.formatNumber(likeCount);

        // Update UI based on watch status
        if (appState.isVideoWatched(this.video.id)) {
            this.updateCompletionUI();
        }
    }

    initializeEventListeners() {
        // Like button
        const likeButton = document.getElementById('like-button');
        likeButton.addEventListener('click', () => this.handleLikeClick());

        // Save button
        const saveButton = document.getElementById('save-button');
        saveButton.addEventListener('click', () => this.handleSaveClick());

        // Comment form
        const commentForm = document.querySelector('.comment-form');
        commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
    }

    handleVideoComplete() {
        appState.markVideoAsWatched(this.video.id);
        this.updateCompletionUI();
        AnalyticsUtil.logEvent('video_completed', {
            videoId: this.video.id,
            title: this.video.title
        });
    }

    updateCompletionUI() {
        const completionBadge = DOMUtil.create('div', {
            className: 'completion-badge'
        }, [
            DOMUtil.create('i', { className: 'fas fa-check-circle' }),
            ' Completed'
        ]);

        document.querySelector('.video-info').appendChild(completionBadge);
    }

    handleLikeClick() {
        const likeButton = document.getElementById('like-button');
        const likeCount = document.getElementById('like-count');
        const currentLikes = parseInt(likeCount.textContent.replace(/,/g, ''));

        likeButton.classList.toggle('active');
        const newCount = likeButton.classList.contains('active') ? 
            currentLikes + 1 : currentLikes - 1;

        likeCount.textContent = FormatUtil.formatNumber(newCount);
        StorageUtil.set(`video_likes_${this.video.id}`, newCount);

        AnalyticsUtil.logEvent('video_like_toggled', {
            videoId: this.video.id,
            liked: likeButton.classList.contains('active')
        });
    }

    handleSaveClick() {
        const saveButton = document.getElementById('save-button');
        saveButton.classList.toggle('active');
        
        const savedVideos = StorageUtil.get('savedVideos') || [];
        if (saveButton.classList.contains('active')) {
            if (!savedVideos.includes(this.video.id)) {
                savedVideos.push(this.video.id);
            }
            saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        } else {
            const index = savedVideos.indexOf(this.video.id);
            if (index > -1) {
                savedVideos.splice(index, 1);
            }
            saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Save';
        }
        
        StorageUtil.set('savedVideos', savedVideos);
        AnalyticsUtil.logEvent('video_save_toggled', {
            videoId: this.video.id,
            saved: saveButton.classList.contains('active')
        });
    }

    handleCommentSubmit(e) {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const comment = textarea.value.trim();

        if (comment) {
            const newComment = {
                id: Date.now(),
                author: 'You',
                date: new Date().toISOString(),
                content: comment,
                likes: 0
            };

            const comments = StorageUtil.get(`video_comments_${this.video.id}`) || [];
            comments.unshift(newComment);
            StorageUtil.set(`video_comments_${this.video.id}`, comments);

            this.loadComments();
            textarea.value = '';

            AnalyticsUtil.logEvent('comment_added', {
                videoId: this.video.id,
                commentId: newComment.id
            });
        }
    }

    loadComments() {
        const commentsContainer = document.getElementById('comments-container');
        const comments = StorageUtil.get(`video_comments_${this.video.id}`) || this.generateFakeComments();
        
        commentsContainer.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
        });
    }

    createCommentElement(comment) {
        return DOMUtil.create('div', { className: 'comment' }, [
            DOMUtil.create('div', { className: 'comment-header' }, [
                DOMUtil.create('span', { className: 'comment-author' }, [comment.author]),
                DOMUtil.create('span', { className: 'comment-date' }, [
                    FormatUtil.formatDate(new Date(comment.date))
                ])
            ]),
            DOMUtil.create('div', { className: 'comment-content' }, [comment.content]),
            DOMUtil.create('div', { className: 'comment-actions' }, [
                DOMUtil.create('span', { 
                    className: 'comment-action',
                    onclick: () => this.handleCommentLike(comment.id)
                }, [
                    DOMUtil.create('i', { className: 'fas fa-thumbs-up' }),
                    ` ${comment.likes}`
                ]),
                DOMUtil.create('span', { className: 'comment-action' }, [
                    DOMUtil.create('i', { className: 'fas fa-reply' }),
                    ' Reply'
                ])
            ])
        ]);
    }

    generateFakeComments() {
        const fakeComments = [
            {
                id: 1,
                author: "Sarah Johnson",
                date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                content: "This lesson really helped me understand the concept better. The mini-story format makes it so much easier to remember new vocabulary!",
                likes: 45
            },
            {
                id: 2,
                author: "Michael Chen",
                date: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
                content: "AJ's teaching method is unique and effective. I've been studying English for years, but this approach feels different and more natural.",
                likes: 32
            },
            {
                id: 3,
                author: "Maria Garcia",
                date: new Date(Date.now() - 1209600000).toISOString(), // 2 weeks ago
                content: "The way the story builds up makes it easy to follow along. I found myself automatically understanding without translating in my head!",
                likes: 28
            }
        ];

        StorageUtil.set(`video_comments_${this.video.id}`, fakeComments);
        return fakeComments;
    }

    handleCommentLike(commentId) {
        const comments = StorageUtil.get(`video_comments_${this.video.id}`);
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes++;
            StorageUtil.set(`video_comments_${this.video.id}`, comments);
            this.loadComments();
        }
    }

    showError(message) {
        const errorElement = DOMUtil.create('div', {
            className: 'error-message'
        }, [message]);
        
        document.querySelector('.video-container').appendChild(errorElement);
    }
}

// Initialize the video page when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VideoPageController();
});
