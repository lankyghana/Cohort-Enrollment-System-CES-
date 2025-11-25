# API Documentation

This document provides details on the custom API endpoints used in the Cohort Enrollment Platform, served by the Laravel backend.

## Authentication

Authentication is handled via Laravel Sanctum. The client must send a bearer token in the `Authorization` header for protected routes.

`Authorization: Bearer <api-token>`

## Endpoints

### `POST /api/verify-paystack`

This endpoint verifies a Paystack payment transaction and creates a course enrollment for the user.

**Method:** `POST`

**Authentication:** Required.

**Request Body:**

```json
{
  "reference": "string",
  "course_id": "string",
  "amount": "number"
}
```

- `reference` (string, required): The payment reference ID returned by Paystack after a transaction.
- `course_id` (string, required): The ID of the course the user is enrolling in.
- `amount` (number, required): The amount paid for the course. This should match the course price.

**Responses:**

- **200 OK:** The payment was successfully verified and the enrollment was created.
  ```json
  {
    "message": "Enrollment successful",
    "enrollment": { ... }
  }
  ```

- **400 Bad Request:** The request body is invalid or missing required fields.
  ```json
  {
    "error": "Invalid request body"
  }
  ```

- **401 Unauthorized:** The user is not authenticated.
  ```json
  {
    "error": "Unauthenticated."
  }
  ```

- **402 Payment Required:** The payment verification with Paystack failed.
  ```json
  {
    "error": "Payment verification failed"
  }
  ```

- **500 Internal Server Error:** An unexpected error occurred on the server.
  ```json
  {
    "error": "Internal server error"
  }
  ```
