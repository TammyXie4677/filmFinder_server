const express = require('express');
const multer = require('multer');
const Movie = require('../models/Movie');
const router = express.Router();
const sharp = require('sharp');


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
    const cover_image_path = req.file ? `uploads/${req.file.filename}` : null;

    if (cover_image_path) {
        const outputImagePath = `public/uploads/compressed-${req.file.filename}`;
        await sharp(req.file.path)
            .jpeg({ quality: 10 }) // Adjust the quality as needed (0-100)
            .toFile(outputImagePath);
    }

    try {
        const newMovie = await Movie.create({
            title,
            description,
            genre,
            release_date,
            duration,
            cover_image: cover_image_path ? `uploads/compressed-${req.file.filename}` : null,
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
    const newCoverImagePath = req.file ? `uploads/${req.file.filename}` : null;

    try {
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        // Use the existing cover image if no new one is provided
        const cover_image = newCoverImagePath || movie.cover_image;

        if (newCoverImagePath) {
            const outputImagePath = `public/uploads/compressed-${req.file.filename}`;
            await sharp(req.file.path)
                .jpeg({ quality: 10 }) // Adjust the quality as needed (0-100)
                .toFile(outputImagePath);
        }

        // Update movie details
        const updatedMovie = await movie.update({
            title,
            description,
            genre,
            release_date,
            duration,
            cover_image: newCoverImagePath ? `uploads/compressed-${req.file.filename}` : movie.cover_image,
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

        await movie.destroy(); // Delete the movie
        res.status(204).send(); // Send no content response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
