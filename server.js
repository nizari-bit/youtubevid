const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// To store all video details, including uploader name, likes, and dislikes
let uploadedVideos = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Serve upload page
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Serve display page
app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// Handle video submission
app.post('/upload', (req, res) => {
    const youtubeUrl = req.body.youtubeUrl;
    const videoTitle = req.body.videoTitle;
    const videoDescription = req.body.videoDescription;
    const uploaderName = req.body.uploaderName; // Capture uploader's name
    const videoId = extractVideoId(youtubeUrl);
    const timestamp = new Date().toLocaleString(); // Get current timestamp

    if (videoId) {
        uploadedVideos.push({
            id: videoId,
            title: videoTitle,
            description: videoDescription,
            uploader: uploaderName, // Store uploader's name
            timestamp: timestamp,
            likeCount: 0,  // Initialize with 0 likes and dislikes
            dislikeCount: 0
        });
        res.redirect('/upload'); // Redirect back to the upload page
    } else {
        res.status(400).send('Invalid YouTube URL.');
    }
});

// Provide the list of uploaded videos with details
app.get('/videos', (req, res) => {
    res.json({ videos: uploadedVideos });
});

// Update like/dislike count
app.post('/update-like-dislike', (req, res) => {
    const { videoId, type } = req.query;

    if (type !== 'like' && type !== 'dislike') {
        return res.status(400).json({ error: 'Invalid type' });
    }

    // Find the video by ID
    const video = uploadedVideos.find(v => v.id === videoId);

    if (!video) {
        return res.status(404).json({ error: 'Video not found' });
    }

    if (type === 'like') {
        video.likeCount++;
    } else if (type === 'dislike') {
        video.dislikeCount++;
    }

    res.status(200).json({ message: 'Like/Dislike updated successfully' });
});

// Extract video ID from a YouTube URL
function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/[^\/\n\s]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
