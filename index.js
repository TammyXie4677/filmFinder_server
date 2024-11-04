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

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use(bodyParser.json());
app.use(express.json());


// Serve React static files (adjust the path to match your setup)
app.use(express.static(path.join(__dirname, "../filmFinder_client/client/build")));

// API Routes
app.use('/api/auth', authRoutes); 
app.use('/movie', movieRouter); 
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
    const adminEmail = process.env.ADMIN_EMAIL; 
    const adminPassword = process.env.ADMIN_PASSWORD; 
    try {
        // Check if the admin account already exists
        const adminUser = await User.findOne({ where: { email: adminEmail } });

        if (!adminUser) {
            // Create the admin account if it doesn't exist
            const hashedPassword = await bcrypt.hash(adminPassword, 10); 
            await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                avatar: '', 
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

