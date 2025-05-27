const musicData = [
    {
        id: 1,
        title: "Birds Of A Feather",
        artist: "Billie Eilish",
        album: "Pop",
        cover: "img/1.jpg",
        audio: "audio/1.mp3",
        duration: "3:45",
        genre: "Pop"
    },
    {
        id: 2,
        title: "Demons",
        artist: "Imagine Dragon",
        album: "Rock",
        cover: "img/2.jpg",
        audio: "audio/2.mp3",
        duration: "3:15",
        genre: "Rock"
    },
    {
        id: 3,
        title: "Apna Bana Le",
        artist: "Arijit Singh",
        album: "Bollywood",
        cover: "img/3.jpg",
        audio: "audio/3.mp3",
        duration: "4:12",
        genre: "Bollywood"
    },
    {
        id: 4,
        title: "Unstoppable",
        artist: "Sia",
        album: "Pop",
        cover: "img/4.jpg",
        audio: "audio/4.mp3",
        duration: "3:37",
        genre: "Pop"
    },
    {
        id: 5,
        title: "Zaalima",
        artist: "Arijit Singh",
        album: "Bollywood",
        cover: "img/5.jpg",
        audio: "audio/5.mp3",
        duration: "4:25",
        genre: "Bollywood"
    },
    {
        id: 6,
        title: "Kesariya",
        artist: "Arijit Singh",
        album: "Bollywood",
        cover: "img/6.jpg",
        audio: "audio/6.mp3",
        duration: "4:28",
        genre: "Bollywood"
    },
    {
        id: 7,
        title: "Shape Of You",
        artist: "Ed Sheeran",
        album: "Pop",
        cover: "img/7.jpg",
        audio: "audio/7.mp3",
        duration: "3:53",
        genre: "Pop"
    },
    {
        id: 8,
        title: "On My Way",
        artist: "Alan Walker",
        album: "Electronic",
        cover: "img/8.jpg",
        audio: "audio/8.mp3",
        duration: "3:13",
        genre: "Electronic"
    },
    {
        id: 9,
        title: "Manwa Lage",
        artist: "Arijit Singh, Shreya Ghoshal",
        album: "Bollywood",
        cover: "img/9.jpg",
        audio: "audio/9.mp3",
        duration: "4:32",
        genre: "Bollywood"
    },
    {
        id: 10,
        title: "Despacito",
        artist: "Justin Bieber",
        album: "Pop",
        cover: "img/10.jpg",
        audio: "audio/10.mp3",
        duration: "3:48",
        genre: "Pop"
    },
    {
        id: 11,
        title: "Satranga",
        artist: "Arijit Singh",
        album: "Bollywood",
        cover: "img/11.jpg",
        audio: "audio/11.mp3",
        duration: "4:15",
        genre: "Bollywood"
    },
    {
        id: 12,
        title: "WILDFLOWER",
        artist: "Billie Eilish",
        album: "Pop",
        cover: "img/12.jpg",
        audio: "audio/12.mp3",
        duration: "3:25",
        genre: "Pop"
    },
    {
        id: 13,
        title: "Raataan Lambiyan",
        artist: "Jubin Nautiyal, Asees Kaur",
        album: "Bollywood",
        cover: "img/13.jpg",
        audio: "audio/13.mp3",
        duration: "3:50",
        genre: "Bollywood"
    },
    {
        id: 14,
        title: "Tere Hawaale",
        artist: "Arijit Singh",
        album: "Bollywood",
        cover: "img/14.jpg",
        audio: "audio/14.mp3",
        duration: "5:03",
        genre: "Bollywood"
    },
    {
        id: 15,
        title: "Blue",
        artist: "Yung Kai",
        album: "Pop",
        cover: "img/15.jpg",
        audio: "audio/15.mp3",
        duration: "2:55",
        genre: "Pop"
    },
    {
        id: 16,
        title: "With You",
        artist: "AP Dhillon",
        album: "Punjabi",
        cover: "img/16.jpg",
        audio: "audio/16.mp3",
        duration: "3:30",
        genre: "Punjabi"
    },
    {
        id: 17,
        title: "No.1 Party Anthem",
        artist: "Arctic Monkeys",
        album: "Rock",
        cover: "img/17.png",
        audio: "audio/17.mp3",
        duration: "4:03",
        genre: "Rock"
    },
    {
        id: 18,
        title: "Softcore",
        artist: "The Neighbourhood",
        album: "Alternative",
        cover: "img/18.jpg",
        audio: "audio/18.mp3",
        duration: "3:45",
        genre: "Alternative"
    },
    {
        id: 19,
        title: "Die With A Smile",
        artist: "Lady Gaga, Bruno Mars",
        album: "Pop",
        cover: "img/19.jpg",
        audio: "audio/19.mp3",
        duration: "3:58",
        genre: "Pop"
    },
    {
        id: 20,
        title: "Angaaron",
        artist: "Shreya Ghoshal",
        album: "Bollywood",
        cover: "img/20.jpg",
        audio: "audio/20.mp3",
        duration: "4:18",
        genre: "Bollywood"
    }
];

// Search functionality
function searchMusic(query) {
    query = query.toLowerCase();
    return musicData.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query) ||
        song.genre.toLowerCase().includes(query)
    );
}

// Get recently played
let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
function addToRecentlyPlayed(songId) {
    recentlyPlayed = recentlyPlayed.filter(id => id !== songId);
    recentlyPlayed.unshift(songId);
    if (recentlyPlayed.length > 10) recentlyPlayed.pop();
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
}

// Favorites functionality
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
function toggleFavorite(songId) {
    const index = favorites.indexOf(songId);
    if (index === -1) {
        favorites.push(songId);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return favorites.includes(songId);
}

function getFavorites() {
    return musicData.filter(song => favorites.includes(song.id));
}

// Playlists functionality
function getPlaylists() {
    return JSON.parse(localStorage.getItem('playlists') || '{}');
}

function createPlaylist(name) {
    const playlists = getPlaylists();
    if (!playlists[name]) {
        playlists[name] = [];
        localStorage.setItem('playlists', JSON.stringify(playlists));
    }
    return playlists;
}

function addToPlaylist(playlistName, songId) {
    const playlists = getPlaylists();
    if (!playlists[playlistName].includes(songId)) {
        playlists[playlistName].push(songId);
        localStorage.setItem('playlists', JSON.stringify(playlists));
    }
}

export { 
    musicData, 
    searchMusic, 
    addToRecentlyPlayed, 
    toggleFavorite, 
    getFavorites,
    createPlaylist,
    addToPlaylist,
    getPlaylists
}; 