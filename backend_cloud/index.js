const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Configure CORS
app.use(cors({
    origin: 'http://localhost:5173', // Vite's default port
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Configure body parser with increased limit for images
app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Cloudinary configuration
const cloudinaryConfig = {
    cloud_name: "dhuarpukj",
    api_key: "992613843971341",
    api_secret: "HZXzDRzzYmtY1-PGByP2PL81b8I"
};

cloudinary.config(cloudinaryConfig);

// Log Cloudinary configuration for debugging (remove in production)
console.log('Cloudinary Configuration:', {
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: '**********' // Hide secret in logs
});

app.post('/upload', async (req, res) => {
    try {
        console.log('Received upload request');
        const { file, location } = req.body;

        if (!file) {
            console.log('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate that the file is a base64 image
        if (!file.startsWith('data:image')) {
            console.log('Invalid file format');
            return res.status(400).json({ error: 'Invalid file format. Please upload an image.' });
        }

        // Log geotag info if present
        if (location && location.latitude && location.longitude) {
            console.log(`Geotagged location: Latitude ${location.latitude}, Longitude ${location.longitude}`);
        } else {
            console.log('No geotag provided.');
        }

        console.log('Attempting to upload to Cloudinary...');
        
        const uploadOptions = {
            resource_type: 'auto',
            folder: 'estate_platform',
            overwrite: true,
            invalidate: true
        };

        const result = await cloudinary.uploader.upload(file, uploadOptions);

        console.log('Upload successful, URL:', result.secure_url);
        return res.json({ 
            url: result.secure_url,
            publicId: result.public_id,
            location: location || null
        });
    } catch (error) {
        console.error('Upload Error Details:', {
            message: error.message,
            code: error.http_code,
            name: error.name,
            stack: error.stack
        });

        return res.status(500).json({ 
            error: error.message,
            details: error.http_code ? `Cloudinary Error ${error.http_code}` : 'Internal Server Error'
        });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
