const https = require('https');
const fs = require('fs');
const path = require('path');

const musicFiles = [
    {
        url: 'https://www.bensound.com/bensound-music/bensound-anewbeginning.mp3',
        filename: 'bensound-anewbeginning.mp3'
    },
    {
        url: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',
        filename: 'bensound-creativeminds.mp3'
    },
    {
        url: 'https://www.bensound.com/bensound-music/bensound-summer.mp3',
        filename: 'bensound-summer.mp3'
    },
    {
        url: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
        filename: 'bensound-acousticbreeze.mp3'
    },
    {
        url: 'https://www.bensound.com/bensound-music/bensound-energy.mp3',
        filename: 'bensound-energy.mp3'
    }
];

const downloadDir = path.join(__dirname, 'public', 'audio');

// Create the audio directory if it doesn't exist
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

musicFiles.forEach(file => {
    const filePath = path.join(downloadDir, file.filename);
    const fileStream = fs.createWriteStream(filePath);

    https.get(file.url, response => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded: ${file.filename}`);
        });
    }).on('error', err => {
        fs.unlink(filePath, () => {}); // Delete the file if there was an error
        console.error(`Error downloading ${file.filename}:`, err.message);
    });
}); 