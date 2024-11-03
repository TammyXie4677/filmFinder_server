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
const userRoutes = require('./routes/User');
const stripeRoutes = require('./routes/Stripe');

// Initialize Stripe
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: "2024-10-28",
//   });

const app = express();

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use(bodyParser.json());
app.use(express.json());

// Initialize Stripe
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: "2024-10-28",
//   });

// if (process.env.STATIC_DIR) {
//     app.use(express.static(process.env.STATIC_DIR));
// }

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/movie', movieRouter); // Movie routes
app.use('/uploads', express.static('public/uploads'));
app.use('/showtime', showtimeRouter);
app.use('/seats', seatsRouter);
app.use('/booking', bookingRoutes);
app.use('/api/user', userRoutes);
app.use('/payment', stripeRoutes);

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

// Stripe routes
app.get("/api/config", (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

app.post("/api/create-payment-intent", async (req, res) => {

    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
        currency: "cad",
        amount: amount, // Retrieve amount from request body
        automatic_payment_methods: { enabled: true },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });

});
