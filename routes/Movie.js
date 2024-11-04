const express = require('express');
const multer = require('multer');
const Movie = require('../models/Movie');
const router = express.Router();
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'public/uploads/'); // Save uploads in the 'public/uploads' folder
    },
    filename: (_, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter to accept only images
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5 MB
    fileFilter: (_, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error('File type not allowed'), false);
    },
});

// Function to delete a file
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting file: ${filePath}`, err);
        } else {
            console.log(`Successfully deleted file: ${filePath}`);
        }
    });
};

// Get all movies
router.get('/', async (_, res) => {
    try {
        const listOfMovies = await Movie.findAll();
        res.json(listOfMovies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get movie by ID
router.get('/byId/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new movie with cover image upload and compression
router.post('/', upload.single('cover_image'), async (req, res) => {
    const { title, description, genre, release_date, duration } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'Cover image is required.' });
    }

    const originalImagePath = req.file.path;
    const outputImagePath = `public/uploads/compressed-${req.file.filename}`;

    try {
        // Compress the image and store it
        await sharp(originalImagePath)
            .jpeg({ quality: 10 }) // Adjust the quality as needed (0-100)
            .toFile(outputImagePath);

        // Store the compressed image path in the database
        const newMovie = await Movie.create({
            title,
            description,
            genre,
            release_date,
            duration,
            cover_image: `uploads/compressed-${req.file.filename}`,
        });

        res.status(201).json(newMovie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a movie by ID and compress cover image
router.put('/:id', upload.single('cover_image'), async (req, res) => {
    const id = req.params.id;
    const { title, description, genre, release_date, duration } = req.body;

    try {
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        let cover_image = movie.cover_image; // Use the existing cover image by default

        // If a new image is provided, compress it and delete the old one
        if (req.file) {
            const originalImagePath = req.file.path;
            const outputImagePath = `public/uploads/compressed-${req.file.filename}`;

            // Delete the old cover image
            const oldCoverImagePath = path.join(__dirname, '..', movie.cover_image); // Get the full path of the old image
            deleteFile(oldCoverImagePath);

            await sharp(originalImagePath)
                .jpeg({ quality: 10 }) // Adjust the quality as needed (0-100)
                .toFile(outputImagePath);

            cover_image = `uploads/compressed-${req.file.filename}`;
        }

        // Update movie details
        const updatedMovie = await movie.update({
            title,
            description,
            genre,
            release_date,
            duration,
            cover_image,
        });

        res.json(updatedMovie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a movie by ID
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        // Delete the cover image
        const coverImagePath = path.join(__dirname, '..', movie.cover_image);
        deleteFile(coverImagePath);

        await movie.destroy(); // Delete the movie
        res.status(204).send(); // Send no content response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
