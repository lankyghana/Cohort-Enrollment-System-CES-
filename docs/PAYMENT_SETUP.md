# Payment & Paystack Setup

This document explains how to set up Paystack with the Laravel backend and how the enrollment flow works.

## Overview

- Client (browser) opens the Paystack inline widget using `VITE_PAYSTACK_PUBLIC_KEY`.
- After a successful payment, the client sends the transaction reference to a dedicated Laravel API endpoint (e.g., `/api/payments/verify`).
- The Laravel backend verifies the transaction with Paystack (server-side), creates an `enrollments` record, updates the payment status, and can send a confirmation email using Laravel's built-in mail capabilities.

## Required Environment Variables

### Backend (`backend/.env`)

- `PAYSTACK_SECRET_KEY` - Your Paystack secret key for server-side verification.
- `PAYSTACK_PUBLIC_KEY` - Your Paystack public key.
- `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` - Configuration for sending emails via Laravel Mail.

### Frontend (`.env`)

- `VITE_PAYSTACK_PUBLIC_KEY` - Your Paystack public key for the client-side widget.
- `VITE_API_BASE_URL` - The base URL for your Laravel backend (e.g., `http://localhost:8000`).

## API Endpoint for Verification

The backend exposes an endpoint, for example `/api/payments/verify`, which accepts a POST request with the following JSON body:
`{ "reference": "...", "course_id": "..." }`

The backend controller handles the logic for:
1.  Calling the Paystack API to verify the transaction details.
2.  Checking that the amount paid and currency match the course details.
3.  Ensuring the transaction reference has not already been processed (idempotency).
4.  Creating a new `enrollment` record for the user and course.
5.  Storing the payment details in the `payments` table.
6.  Returning a success or failure response to the client.

## Security Notes

- Never expose your `PAYSTACK_SECRET_KEY` in frontend code. It must only be used on the server.
- Use Laravel's policies and authorization to protect the verification endpoint and other sensitive routes.

## Troubleshooting

- If verification fails, check the Laravel application logs (`storage/logs/laravel.log`).
- Inspect the network response from the `/api/payments/verify` endpoint in your browser's developer tools.
- Check the Paystack dashboard for transaction details and potential errors.

## Testing Notes

- Use Paystack's test mode with test card details to simulate payments.
- Ensure your `.env` file in the `backend` directory contains your Paystack test keys.
- You can manually call the verification endpoint using an API client like Postman or Insomnia to test the backend logic independently of the frontend.


