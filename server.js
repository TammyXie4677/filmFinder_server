// server.js
const express = require("express");
const app = express();
const { resolve } = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-10-28",
});

// Serve static files from the specified directory
app.use(express.static(process.env.STATIC_DIR));
app.use(express.json()); // Parse JSON requests

// Provide Stripe publishable key to the client
app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Create a payment intent
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      currency: "CAD",
      amount: amount, // Retrieve amount from request body
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: { message: error.message },
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
