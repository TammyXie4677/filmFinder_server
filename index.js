require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./sequelize');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const movieRouter = require('./routes/Movie');
const showtimeRouter = require('./routes/Showtime');
const seatsRouter = require('./routes/Seat');
const bookingRoutes = require('./routes/Booking');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/Users');
const stripeRoutes = require('./routes/Stripe');

const app = express();

//test s3
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

(async () => {
    await
        s3.putObject({
            Bucket: 'filmfinder-uploads',
            Key: 'test.txt',
            Body: 'Hello world!',
        }, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log(data);
            }
        }).promise();
})();

const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // For unique filenames


// Configure Multer
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Route for image upload
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const fileContent = req.file.buffer; // Get file buffer from multer
        const fileName = `${uuidv4()}.${req.file.mimetype.split('/')[1]}`; // Create unique file name

        const params = {
            Bucket: 'filmfinder-uploads',
            Key: fileName,
            Body: fileContent,
            ContentType: req.file.mimetype,
            // Remove ACL line
        };

        // Upload to S3
        const data = await s3.upload(params).promise();
        res.status(200).send({ message: 'Upload successful', data });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Upload failed', error: err });
    }
});

//test s3 ends



// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(cors({
    origin: 'https://filmfinder-app-0f7b7b303a13.herokuapp.com',
}));

app.use(bodyParser.json());
app.use(express.json());


// Serve React static files (adjust the path to match your setup)
app.use(express.static(path.join(__dirname, "../filmFinder_client/client/build")));

// API Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/movie', movieRouter); // Movie routes
app.use('/uploads', express.static('public/uploads'));
app.use('/showtime', showtimeRouter);
app.use('/seats', seatsRouter);
app.use('/booking', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/payment', stripeRoutes);

// Catch-all route to handle React client-side routing (place this after all API routes)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../filmFinder_client/client/build", "index.html"));
});

const PORT = process.env.PORT || 5000;

async function createAdminAccount() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'; // Set your admin email
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminPassword123'; // Set a strong password

    try {
        // Check if the admin account already exists
        const adminUser = await User.findOne({ where: { email: adminEmail } });

        if (!adminUser) {
            // Create the admin account if it doesn't exist
            const hashedPassword = await bcrypt.hash(adminPassword, 10); // Use bcrypt to hash the password
            await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                avatar: '', // You can set a default avatar if needed
            });
            console.log('Admin account created successfully.');
        } else {
            console.log('Admin account already exists.');
        }
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
}

// Start the server after connecting to the database
connectDB().then(async () => {
    await createAdminAccount(); // Create admin account
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});

