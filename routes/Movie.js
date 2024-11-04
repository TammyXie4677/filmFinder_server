const express = require('express');
const multer = require('multer');
const Movie = require('../models/Movie');
const router = express.Router();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid'); // For unique filenames

// Create an S3 client
const s3Client = new S3Client({
    region: "us-east-1", // Adjust your region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// Create a new movie with cover image upload to S3
router.post('/', upload.single('cover_image'), async (req, res) => {
    const { title, description, genre, release_date, duration } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'Cover image is required.' });
    }

    try {
        const fileContent = req.file.buffer; // Get file buffer from multer
        const fileName = `${uuidv4()}.${req.file.mimetype.split('/')[1]}`; // Create a unique file name

        const params = {
            Bucket: 'filmfinder-uploads',
            Key: fileName,
            Body: fileContent,
            ContentType: req.file.mimetype,
        };

        // Upload to S3
        const data = await s3Client.send(new PutObjectCommand(params));

        // Store the S3 URL in the database
        const newMovie = await Movie.create({
            title,
            description,
            genre,
            release_date,
            duration,
            cover_image: `https://filmfinder-uploads.s3.us-east-1.amazonaws.com/${fileName}`, // Use the S3 URL
        });

        res.status(201).json(newMovie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Update a movie by ID and upload new cover image to S3
router.put('/:id', upload.single('cover_image'), async (req, res) => {
    const id = req.params.id;
    const { title, description, genre, release_date, duration } = req.body;

    try {
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        let cover_image = movie.cover_image; // Use the existing cover image by default

        // If a new image is provided, upload it to S3
        if (req.file) {
            const fileContent = req.file.buffer; // Get file buffer from multer
            const fileName = `${uuidv4()}.${req.file.mimetype.split('/')[1]}`; // Create a unique file name

            const params = {
                Bucket: 'filmfinder-uploads',
                Key: fileName,
                Body: fileContent,
                ContentType: req.file.mimetype,
            };

            // Upload to S3
            await s3Client.send(new PutObjectCommand(params));

            cover_image = `https://filmfinder-uploads.s3.us-east-1.amazonaws.com/${fileName}`; // Use the new S3 URL
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
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a movie by ID
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const movie = await Movie.findByPk(id);
        if (!movie) return res.status(404).json({ error: "Movie not found" });

        // Optionally, you can delete the image from S3 if required
        // const deleteParams = {
        //     Bucket: 'filmfinder-uploads',
        //     Key: movie.cover_image.split('/').pop() // Extract the file name from the URL
        // };
        // await s3Client.send(new DeleteObjectCommand(deleteParams));

        await movie.destroy(); // Delete the movie
        res.status(204).send(); // Send no content response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
