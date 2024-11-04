// Install Stripe SDK: npm install stripe
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// Route to create a Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    const { totalPrice, bookingId, selectedSeats, showtimeId } = req.body; // Accept selectedSeats

    // Log the incoming request data for debugging
    console.log("Received request to create checkout session");
    console.log("Total Price:", totalPrice);
    console.log("Booking ID:", bookingId);
    console.log("Selected Seats:", selectedSeats); // Log selected seats
    console.log("Showtime ID:", showtimeId);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Movie Ticket Booking' },
                        unit_amount: totalPrice * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/payment-success?bookingId=${bookingId}&showtimeId=${showtimeId}&selectedSeats=${JSON.stringify(selectedSeats)}`,
            cancel_url: `http://localhost:3000/booking/${bookingId}&status=cancelled`,
            metadata: { bookingId, selectedSeats: JSON.stringify(selectedSeats) }, // Store seat numbers as JSON string
        });

        console.log("Stripe session created successfully:", session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'Unable to create Stripe session' });
    }
});




module.exports = router;
