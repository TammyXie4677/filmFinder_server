// Install Stripe SDK: npm install stripe
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QH7GKFsjFK2S4k6lUm23LqwHOuMxa4zg7jAgK2kyo19RI1jE5lYj6ml1tUpMg4PfJtsJmIA19jw9aK8wZrKl5z300oCk0RBMx');


// Route to create a Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    const { totalPrice, bookingId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Movie Ticket Booking' },
                        unit_amount: totalPrice * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/booking-summary?bookingId=${bookingId}&status=success`,
            cancel_url: `http://localhost:3000/booking-summary?bookingId=${bookingId}&status=cancelled`,
            metadata: { bookingId }, // Add bookingId to metadata
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'Unable to create Stripe session' });
    }
});



module.exports = router;
