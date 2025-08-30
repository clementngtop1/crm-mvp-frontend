# CRM MVP API Documentation

This document provides detailed information about the REST API endpoints available in the CRM MVP system.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. This is suitable for MVP development but should be implemented for production use.

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "data": {...},
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `404` - Not Found: Resource not found
- `500` - Internal Server Error: Server error

---

## Students API

### Get All Students

**GET** `/api/students`

Retrieve all students with optional filtering.

#### Query Parameters
- `search` (string, optional): Search by name, email, or phone
- `course` (string, optional): Filter by enrolled course
- `status` (string, optional): Filter by payment status (`paid`, `pending`, `overdue`)

#### Example Request
```bash
GET /api/students?search=john&course=javascript
```

#### Example Response
```json
[
  {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "enrollments": [
      {
        "id": "enr1234567890",
        "courseName": "JavaScript Fundamentals",
        "batch": "JS-2024-01",
        "startDate": "2024-02-01T00:00:00.000Z"
      }
    ],
    "payments": [
      {
        "id": "pay1234567890",
        "amount": 500.00,
        "date": "2024-01-15T00:00:00.000Z",
        "method": "CARD",
        "status": "PAID"
      }
    ]
  }
]
```

### Get Student by ID

**GET** `/api/students/:id`

Retrieve a specific student by their ID.

#### Path Parameters
- `id` (string, required): Student ID

#### Example Response
```json
{
  "id": "clx1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "enrollments": [...],
  "payments": [...]
}
```

### Create Student

**POST** `/api/students`

Create a new student record.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

#### Required Fields
- `name` (string): Student's full name
- `email` (string): Unique email address

#### Optional Fields
- `phone` (string): Phone number

#### Example Response
```json
{
  "id": "clx1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "enrollments": [],
  "payments": []
}
```

### Update Student

**PUT** `/api/students/:id`

Update an existing student record.

#### Path Parameters
- `id` (string, required): Student ID

#### Request Body
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "+1234567891"
}
```

### Delete Student

**DELETE** `/api/students/:id`

Delete a student record and all associated enrollments and payments.

#### Path Parameters
- `id` (string, required): Student ID

#### Example Response
```json
{
  "message": "Student deleted successfully"
}
```

### Bulk Import Students

**POST** `/api/students/bulk-import`

Import multiple students from a CSV file.

#### Request
- Content-Type: `multipart/form-data`
- Field name: `csvFile`

#### CSV Format
The CSV file should have the following columns:
- `name` (required): Student's full name
- `email` (required): Email address
- `phone` (optional): Phone number

#### Example CSV
```csv
name,email,phone
John Doe,john@example.com,+1234567890
Jane Smith,jane@example.com,+1234567891
Bob Johnson,bob@example.com,
```

#### Example Response
```json
{
  "message": "Bulk import completed",
  "imported": 2,
  "skipped": 1,
  "errors": [
    "Student with email john@example.com already exists"
  ]
}
```

---

## Enrollments API

### Get All Enrollments

**GET** `/api/enrollments`

Retrieve all enrollments with optional filtering.

#### Query Parameters
- `course` (string, optional): Filter by course name
- `batch` (string, optional): Filter by batch
- `studentId` (string, optional): Filter by student ID

#### Example Response
```json
[
  {
    "id": "enr1234567890",
    "courseName": "JavaScript Fundamentals",
    "batch": "JS-2024-01",
    "startDate": "2024-02-01T00:00:00.000Z",
    "studentId": "clx1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "student": {
      "id": "clx1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
]
```

### Create Enrollment

**POST** `/api/enrollments`

Enroll a student in a course.

#### Request Body
```json
{
  "courseName": "JavaScript Fundamentals",
  "batch": "JS-2024-01",
  "startDate": "2024-02-01T00:00:00.000Z",
  "studentId": "clx1234567890"
}
```

#### Required Fields
- `courseName` (string): Name of the course
- `startDate` (string): Course start date (ISO 8601 format)
- `studentId` (string): ID of the student to enroll

#### Optional Fields
- `batch` (string): Batch identifier

### Get Course List

**GET** `/api/enrollments/courses/list`

Get a list of unique course names.

#### Example Response
```json
[
  "JavaScript Fundamentals",
  "React Development",
  "Node.js Backend",
  "Python for Beginners"
]
```

### Get Batch List

**GET** `/api/enrollments/batches/list`

Get a list of unique batch identifiers.

#### Example Response
```json
[
  "JS-2024-01",
  "REACT-2024-01",
  "NODE-2024-01",
  "PY-2024-01"
]
```

---

## Payments API

### Get All Payments

**GET** `/api/payments`

Retrieve all payments with optional filtering.

#### Query Parameters
- `status` (string, optional): Filter by payment status (`PAID`, `PENDING`, `OVERDUE`)
- `method` (string, optional): Filter by payment method
- `studentId` (string, optional): Filter by student ID
- `dateFrom` (string, optional): Filter payments from date (ISO 8601 format)
- `dateTo` (string, optional): Filter payments to date (ISO 8601 format)

#### Example Response
```json
[
  {
    "id": "pay1234567890",
    "amount": 500.00,
    "date": "2024-01-15T00:00:00.000Z",
    "method": "CARD",
    "status": "PAID",
    "studentId": "clx1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "student": {
      "id": "clx1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
]
```

### Create Payment

**POST** `/api/payments`

Record a new payment.

#### Request Body
```json
{
  "amount": 500.00,
  "date": "2024-01-15T00:00:00.000Z",
  "method": "CARD",
  "status": "PAID",
  "studentId": "clx1234567890"
}
```

#### Required Fields
- `amount` (number): Payment amount (must be positive)
- `date` (string): Payment date (ISO 8601 format)
- `method` (string): Payment method (`CASH`, `CARD`, `BANK_TRANSFER`, `UPI`, `OTHER`)
- `studentId` (string): ID of the student making the payment

#### Optional Fields
- `status` (string): Payment status (`PENDING`, `PAID`, `OVERDUE`). Defaults to `PENDING`

### Update Payment Status

**PUT** `/api/payments/:id/status`

Update only the status of a payment.

#### Path Parameters
- `id` (string, required): Payment ID

#### Request Body
```json
{
  "status": "PAID"
}
```

#### Valid Status Values
- `PENDING`: Payment is pending
- `PAID`: Payment has been completed
- `OVERDUE`: Payment is overdue

### Get Student Payment Summary

**GET** `/api/payments/student/:studentId/summary`

Get a comprehensive payment summary for a specific student.

#### Path Parameters
- `studentId` (string, required): Student ID

#### Example Response
```json
{
  "totalAmount": 1500.00,
  "paidAmount": 1000.00,
  "pendingAmount": 500.00,
  "overdueAmount": 0.00,
  "paymentCount": 3,
  "lastPaymentDate": "2024-01-15T00:00:00.000Z",
  "payments": [...]
}
```

---

## Dashboard API

### Get Dashboard Statistics

**GET** `/api/dashboard/stats`

Get comprehensive dashboard statistics.

#### Example Response
```json
{
  "students": {
    "total": 150,
    "recentlyAdded": 5
  },
  "enrollments": {
    "total": 200,
    "active": 120,
    "recent": 8
  },
  "payments": {
    "totalAmount": 75000.00,
    "paidAmount": 65000.00,
    "pendingAmount": 8000.00,
    "overdueAmount": 2000.00,
    "totalPayments": 180,
    "paidPayments": 150,
    "pendingPayments": 25,
    "overduePayments": 5
  },
  "recent": {
    "enrollments": 8,
    "payments": 12
  }
}
```

### Get Recent Activities

**GET** `/api/dashboard/recent-activities`

Get recent activities across the system.

#### Query Parameters
- `limit` (number, optional): Maximum number of items to return per category. Defaults to 10.

#### Example Response
```json
{
  "students": [
    {
      "id": "clx1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "enrollments": [
    {
      "id": "enr1234567890",
      "courseName": "JavaScript Fundamentals",
      "batch": "JS-2024-01",
      "startDate": "2024-02-01T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "student": {
        "id": "clx1234567890",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "payments": [
    {
      "id": "pay1234567890",
      "amount": 500.00,
      "date": "2024-01-15T00:00:00.000Z",
      "method": "CARD",
      "status": "PAID",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "student": {
        "id": "clx1234567890",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Get Course Statistics

**GET** `/api/dashboard/course-stats`

Get enrollment statistics by course.

#### Example Response
```json
[
  {
    "courseName": "JavaScript Fundamentals",
    "enrollmentCount": 45
  },
  {
    "courseName": "React Development",
    "enrollmentCount": 32
  },
  {
    "courseName": "Node.js Backend",
    "enrollmentCount": 28
  }
]
```

### Get Payment Trends

**GET** `/api/dashboard/payment-trends`

Get payment trends over time.

#### Query Parameters
- `period` (string, optional): Time period for trends (`week`, `month`, `year`). Defaults to `month`.

#### Example Response
```json
[
  {
    "date": "2024-01-15",
    "totalAmount": 2500.00,
    "paidAmount": 2000.00,
    "pendingAmount": 500.00,
    "overdueAmount": 0.00,
    "count": 5
  },
  {
    "date": "2024-01-16",
    "totalAmount": 1800.00,
    "paidAmount": 1800.00,
    "pendingAmount": 0.00,
    "overdueAmount": 0.00,
    "count": 3
  }
]
```

### Get Students with Outstanding Payments

**GET** `/api/dashboard/students-with-outstanding`

Get students who have outstanding (pending or overdue) payments.

#### Example Response
```json
[
  {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "pendingAmount": 500.00,
    "overdueAmount": 200.00,
    "totalOutstanding": 700.00,
    "enrollments": [...],
    "outstandingPayments": [...]
  }
]
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": "Name and email are required"
}
```

#### 404 Not Found
```json
{
  "error": "Student not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Something went wrong!"
}
```

### Validation Rules

#### Students
- `name`: Required, non-empty string
- `email`: Required, valid email format, unique
- `phone`: Optional, string

#### Enrollments
- `courseName`: Required, non-empty string
- `startDate`: Required, valid ISO 8601 date
- `studentId`: Required, must reference existing student
- `batch`: Optional, string

#### Payments
- `amount`: Required, positive number
- `date`: Required, valid ISO 8601 date
- `method`: Required, one of: `CASH`, `CARD`, `BANK_TRANSFER`, `UPI`, `OTHER`
- `status`: Optional, one of: `PENDING`, `PAID`, `OVERDUE`
- `studentId`: Required, must reference existing student

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

## CORS Configuration

The API is configured to accept requests from any origin (`*`) for development purposes. For production, configure specific allowed origins.

## Health Check

**GET** `/api/health`

Check if the API is running.

#### Example Response
```json
{
  "status": "OK",
  "message": "CRM API is running"
}
```

---

This API documentation covers all available endpoints in the CRM MVP system. For additional support or questions, please refer to the main README.md file.

