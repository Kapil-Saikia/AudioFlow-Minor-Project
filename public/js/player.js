import { 
    musicData, 
    searchMusic, 
    addToRecentlyPlayed, 
    toggleFavorite, 
    getFavorites,
    createPlaylist,
    addToPlaylist,
    getPlaylists 
} from './musicData.js';

// Player State
let currentSong = null;
let isPlaying = false;
let audio = new Audio();
let currentPlaylist = musicData;
let currentPlaylistIndex = 0;
let isShuffled = false;
let repeatMode = 'none'; // none, one, all

// DOM Elements
const currentTrackImg = document.getElementById('current-track-img');
const currentTrackTitle = document.getElementById('current-track-title');
const currentTrackArtist = document.getElementById('current-track-artist');
const playPauseBtn = document.querySelector('.play-pause');
const prevBtn = document.querySelector('.prev-track');
const nextBtn = document.querySelector('.next-track');
const shuffleBtn = document.querySelector('.shuffle');
const repeatBtn = document.querySelector('.repeat');
const volumeSlider = document.querySelector('.volume-slider input');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const currentTimeEl = document.querySelector('.current-time');
const totalDurationEl = document.querySelector('.total-duration');
const searchInput = document.getElementById('search-input');
const musicGrid = document.getElementById('music-grid');
const tabLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const createPlaylistBtn = document.getElementById('create-playlist');

// Fetch user profile and update UI
async function fetchUserProfile() {
    try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.success) {
            document.getElementById('username').textContent = data.user.username;
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        window.location.href = '/login';
    }
}

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error logging out:', error);
        window.location.href = '/login';
    }
});

// Initialize player
function initializePlayer() {
    setupEventListeners();
    loadSettings();
    
    // Load initial songs
    populateMusicGrid(document.getElementById('music-grid'), musicData);
    
    // Initialize audio
    audio = new Audio();
    audio.volume = localStorage.getItem('volume') || 1;
    
    setupAudioHandlers();
}

// Event Listeners
function setupEventListeners() {
    // Playback Controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Progress Bar
    progressBar.addEventListener('click', handleProgressBarClick);
    
    // Volume Control
    volumeSlider.addEventListener('input', handleVolumeChange);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
    
    // Tab Navigation
    tabLinks.forEach(link => {
        link.addEventListener('click', () => handleTabChange(link.dataset.tab));
    });

    // Player bar favorite button
    document.querySelector('.player-bar .favorite-btn').addEventListener('click', (e) => {
        if (!currentSong) return;
        const isFavorite = toggleFavorite(currentSong.id);
        e.currentTarget.classList.toggle('active', isFavorite);
        // Refresh favorites tab if we're in it
        if (document.querySelector('#favorites-content').classList.contains('active')) {
            populateMusicGrid(document.querySelector('#favorites-content .music-grid'), getFavorites());
        }
    });

    // Create Playlist
    createPlaylistBtn?.addEventListener('click', handleCreatePlaylist);
}

// Audio Event Handlers
function setupAudioHandlers() {
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = formatTime(audio.duration);
    });
    
    // Add error handling
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        alert('Error loading the audio file. Please try another song.');
    });
}

// Playback Controls
function playSong(song) {
    if (currentSong && currentSong.id === song.id) {
        togglePlayPause();
        return;
    }

    currentSong = song;
    
    // Create new Audio instance for each song to prevent issues
    audio.pause();
    audio = new Audio();
    audio.src = song.audio;
    
    // Setup audio event listeners
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleSongEnd);
    audio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = formatTime(audio.duration);
    });
    
    // Set volume before playing
    audio.volume = volumeSlider.value;
    
    // Play the song
    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayerUI();
            addToRecentlyPlayed(song.id);
            currentPlaylistIndex = currentPlaylist.findIndex(s => s.id === song.id);
        })
        .catch(error => {
            console.error('Error playing audio:', error);
            alert('Error playing the song. Please try again.');
        });
}

function togglePlayPause() {
    if (!currentSong) return;
    
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
    isPlaying = !isPlaying;
    updatePlayerUI();
}

function playPrevious() {
    if (!currentSong) return;
    
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    
    let newIndex = currentPlaylistIndex - 1;
    if (newIndex < 0) newIndex = currentPlaylist.length - 1;
    playSong(currentPlaylist[newIndex]);
}

function playNext() {
    if (!currentSong) return;
    
    let newIndex = currentPlaylistIndex + 1;
    if (newIndex >= currentPlaylist.length) newIndex = 0;
    playSong(currentPlaylist[newIndex]);
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active');
    if (isShuffled) {
        currentPlaylist = [...musicData].sort(() => Math.random() - 0.5);
    } else {
        currentPlaylist = [...musicData];
    }
    if (currentSong) {
        currentPlaylistIndex = currentPlaylist.findIndex(song => song.id === currentSong.id);
    }
}

function toggleRepeat() {
    switch(repeatMode) {
        case 'none':
            repeatMode = 'one';
            repeatBtn.classList.add('active');
            repeatBtn.classList.add('repeat-one');
            break;
        case 'one':
            repeatMode = 'all';
            repeatBtn.classList.remove('repeat-one');
            break;
        case 'all':
            repeatMode = 'none';
            repeatBtn.classList.remove('active');
            break;
    }
}

// Progress & Volume Controls
function updateProgress() {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

function handleProgressBarClick(e) {
    const percent = e.offsetX / progressBar.offsetWidth;
    audio.currentTime = percent * audio.duration;
}

function handleVolumeChange(e) {
    const volume = e.target.value;
    audio.volume = volume;
    localStorage.setItem('volume', volume);
    document.querySelector('.volume-level').style.width = `${volume * 100}%`;
}

// UI Updates
function updatePlayerUI() {
    if (!currentSong) return;
    
    // Update play/pause button
    playPauseBtn.innerHTML = isPlaying ? 
        '<i class="fas fa-pause"></i>' : 
        '<i class="fas fa-play"></i>';
    
    // Update track info
    currentTrackImg.src = currentSong.cover;
    currentTrackTitle.textContent = currentSong.title;
    currentTrackArtist.textContent = currentSong.artist;
    
    // Update favorite button
    const isFavorite = getFavorites().some(song => song.id === currentSong.id);
    document.querySelector('.favorite-btn').classList.toggle('active', isFavorite);
}

// Music Grid
function populateMusicGrid(container, songs) {
    if (!container) return;
    container.innerHTML = '';
    
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <img src="${song.cover}" alt="${song.title}">
            <div class="card-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
                <p class="duration">${song.duration}</p>
            </div>
            <div class="card-actions">
                <button class="play-btn" title="Play">
                    <i class="fas fa-play"></i>
                </button>
                <button class="favorite-btn ${getFavorites().some(f => f.id === song.id) ? 'active' : ''}" title="Add to favorites">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="add-playlist-btn" title="Add to playlist">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.play-btn').addEventListener('click', () => playSong(song));
        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            const isFavorite = toggleFavorite(song.id);
            e.currentTarget.classList.toggle('active', isFavorite);
            // Refresh favorites tab if we're in it
            if (document.querySelector('#favorites-content').classList.contains('active')) {
                populateMusicGrid(document.querySelector('#favorites-content .music-grid'), getFavorites());
            }
        });
        card.querySelector('.add-playlist-btn').addEventListener('click', () => {
            showAddToPlaylistModal(song.id);
        });
        
        container.appendChild(card);
    });
}

// Search
function handleSearch(e) {
    const query = e.target.value.trim();
    const results = query ? searchMusic(query) : musicData;
    
    // Get the currently active tab content
    const activeTab = document.querySelector('.tab-content.active');
    
    // If we're in the home tab or search tab, show search results
    if (activeTab.id === 'home-content') {
        populateMusicGrid(document.getElementById('music-grid'), results);
    } else if (activeTab.id === 'search-content') {
        populateMusicGrid(document.querySelector('#search-content .music-grid'), results);
    } else if (activeTab.id === 'favorites-content') {
        // In favorites tab, filter search results to only show favorited songs
        const favResults = results.filter(song => getFavorites().some(f => f.id === song.id));
        populateMusicGrid(document.querySelector('#favorites-content .music-grid'), favResults);
    } else if (activeTab.id === 'recently-played-content') {
        // In recently played tab, filter search results to only show recent songs
        const recentIds = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
        const recentResults = results.filter(song => recentIds.includes(song.id));
        populateMusicGrid(document.querySelector('#recently-played-content .music-grid'), recentResults);
    }
}

// Tab Navigation
function handleTabChange(tab) {
    // Update active tab
    tabLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.tab === tab);
    });
    
    // Update visible content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tab}-content`);
    });
    
    // Clear search input when changing tabs
    searchInput.value = '';
    
    // Update content based on tab
    switch(tab) {
        case 'home':
            populateMusicGrid(document.getElementById('music-grid'), musicData);
            break;
        case 'favorites':
            populateMusicGrid(document.querySelector('#favorites-content .music-grid'), getFavorites());
            break;
        case 'search':
            populateMusicGrid(document.querySelector('#search-content .music-grid'), []);
            break;
        case 'recently-played':
            const recentSongs = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]')
                .map(id => musicData.find(song => song.id === id))
                .filter(Boolean);
            populateMusicGrid(document.querySelector('#recently-played-content .music-grid'), recentSongs);
            break;
        case 'playlists':
            displayPlaylists();
            break;
    }
}

// Playlist Management
function handleCreatePlaylist() {
    const name = prompt('Enter playlist name:');
    if (name) {
        createPlaylist(name);
        displayPlaylists();
    }
}

function displayPlaylists() {
    const playlists = getPlaylists();
    const playlistsGrid = document.querySelector('.playlists-grid');
    playlistsGrid.innerHTML = '';
    
    Object.entries(playlists).forEach(([name, songs]) => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        playlistCard.innerHTML = `
            <h3>${name}</h3>
            <p>${songs.length} songs</p>
            <button class="play-playlist-btn">
                <i class="fas fa-play"></i>
            </button>
        `;
        
        playlistCard.addEventListener('click', () => {
            currentPlaylist = songs.map(id => musicData.find(song => song.id === id)).filter(Boolean);
            if (currentPlaylist.length > 0) {
                playSong(currentPlaylist[0]);
            }
        });
        
        playlistsGrid.appendChild(playlistCard);
    });
}

function showAddToPlaylistModal(songId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add to Playlist</h3>
            <div class="playlist-list">
                ${Object.keys(getPlaylists()).map(name => `
                    <button class="playlist-option" data-name="${name}">${name}</button>
                `).join('')}
            </div>
            <button class="new-playlist-btn">Create New Playlist</button>
            <button class="close-modal-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.new-playlist-btn').addEventListener('click', () => {
        const name = prompt('Enter playlist name:');
        if (name) {
            createPlaylist(name);
            addToPlaylist(name, songId);
            modal.remove();
            if (document.querySelector('.tab-content.active').id === 'playlists-content') {
                displayPlaylists();
            }
        }
    });
    
    modal.querySelectorAll('.playlist-option').forEach(btn => {
        btn.addEventListener('click', () => {
            addToPlaylist(btn.dataset.name, songId);
            modal.remove();
        });
    });
}

// Utility Functions
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function loadSettings() {
    // Load volume
    const savedVolume = localStorage.getItem('volume') || 1;
    audio.volume = savedVolume;
    volumeSlider.value = savedVolume;
    document.querySelector('.volume-level').style.width = `${savedVolume * 100}%`;
}

function handleSongEnd() {
    switch(repeatMode) {
        case 'one':
            audio.currentTime = 0;
            audio.play();
            break;
        case 'all':
            playNext();
            break;
        case 'none':
            if (currentPlaylistIndex < currentPlaylist.length - 1) {
                playNext();
            }
            break;
    }
}

// Initialize the player
initializePlayer();

// Initialize
fetchUserProfile(); 