# CRM MVP - Training Business Management System

A lightweight, full-stack CRM system designed specifically for training businesses. Built with React, Node.js/Express, and Prisma ORM with SQLite database for easy development and deployment.

## 🚀 Features

### Core Functionality
- **Student Management**: Complete CRUD operations for student profiles
- **Enrollment Tracking**: Manage course enrollments with batch and date tracking
- **Payment Management**: Track payments with multiple methods and status updates
- **Dashboard Analytics**: Real-time statistics and recent activity monitoring
- **CSV Import**: Bulk import students from Google Sheets or CSV files

### Technical Features
- **Responsive Design**: Mobile-friendly interface using TailwindCSS
- **RESTful API**: Clean, well-documented API endpoints
- **Type Safety**: Full TypeScript support on frontend
- **Database Migrations**: Prisma ORM for database management
- **CORS Enabled**: Ready for frontend-backend separation

## 🏗️ Architecture

```
crm-mvp/
├── backend/                 # Node.js/Express API server
│   ├── routes/             # API route handlers
│   ├── prisma/             # Database schema and migrations
│   ├── uploads/            # CSV upload directory
│   └── server.js           # Main server file
├── frontend/               # React/TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # API utilities and helpers
│   └── public/             # Static assets
└── README.md               # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **File Upload**: Multer
- **CSV Processing**: csv-parser
- **Environment**: dotenv

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crm-mvp
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push database schema (creates SQLite database)
npx prisma db push

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the development server
npm run dev
```

The frontend application will start on `http://localhost:5173`

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

The application uses the following main entities:

### Student
- `id`: Unique identifier
- `name`: Student full name
- `email`: Email address (unique)
- `phone`: Phone number (optional)
- `createdAt`: Registration timestamp
- `updatedAt`: Last modification timestamp

### Enrollment
- `id`: Unique identifier
- `courseName`: Name of the course
- `batch`: Batch identifier (optional)
- `startDate`: Course start date
- `studentId`: Reference to student
- `createdAt`: Enrollment timestamp

### Payment
- `id`: Unique identifier
- `amount`: Payment amount
- `date`: Payment date
- `method`: Payment method (CASH, CARD, BANK_TRANSFER, UPI, OTHER)
- `status`: Payment status (PENDING, PAID, OVERDUE)
- `studentId`: Reference to student
- `createdAt`: Record creation timestamp

## 🔌 API Endpoints

### Students API
- `GET /api/students` - Get all students with optional filtering
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/bulk-import` - Import students from CSV

### Enrollments API
- `GET /api/enrollments` - Get all enrollments
- `GET /api/enrollments/:id` - Get enrollment by ID
- `POST /api/enrollments` - Create new enrollment
- `PUT /api/enrollments/:id` - Update enrollment
- `DELETE /api/enrollments/:id` - Delete enrollment
- `GET /api/enrollments/courses/list` - Get unique course names
- `GET /api/enrollments/batches/list` - Get unique batch names

### Payments API
- `GET /api/payments` - Get all payments with filtering
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `PUT /api/payments/:id/status` - Update payment status
- `GET /api/payments/student/:studentId/summary` - Get payment summary for student

### Dashboard API
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activities` - Get recent activities
- `GET /api/dashboard/course-stats` - Get course enrollment statistics
- `GET /api/dashboard/payment-trends` - Get payment trends over time
- `GET /api/dashboard/students-with-outstanding` - Get students with outstanding payments

## 📱 Usage Guide

### Adding Students
1. Navigate to the Students page
2. Click "Add Student" button
3. Fill in the required information (name, email, optional phone)
4. Click "Save" to create the student record

### Bulk Import Students
1. Prepare a CSV file with columns: name, email, phone
2. Go to Students page and click "Import CSV"
3. Select your CSV file and upload
4. Review the import results

### Managing Enrollments
1. Go to Enrollments page
2. Click "New Enrollment" to add a student to a course
3. Select student, enter course name, batch (optional), and start date
4. Save the enrollment record

### Recording Payments
1. Navigate to Payments page
2. Click "Record Payment"
3. Select student, enter amount, date, payment method, and status
4. Save the payment record

### Dashboard Overview
The dashboard provides:
- Total students and recent additions
- Active enrollments and course statistics
- Payment summaries and outstanding amounts
- Recent activity feed
- Quick action buttons for common tasks

## 🚨 Known Issues

### TailwindCSS Configuration Issue
Currently, there is a PostCSS configuration issue with TailwindCSS that prevents the frontend from running properly. The error message indicates:

```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

**Temporary Solution**: The application structure and backend are fully functional. To resolve the frontend styling issue:

1. Install the correct TailwindCSS PostCSS plugin:
   ```bash
   npm install -D @tailwindcss/postcss
   ```

2. Update `postcss.config.js` to use the new plugin format

3. Alternatively, you can remove TailwindCSS temporarily and use regular CSS or another CSS framework

## 🔄 Database Migration

For production deployment with PostgreSQL:

1. Update the `DATABASE_URL` in `.env` to point to your PostgreSQL instance
2. Update `prisma/schema.prisma` to use PostgreSQL provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Set up environment variables in your deployment platform
2. Ensure PostgreSQL database is configured
3. Run database migrations during deployment
4. Set `NODE_ENV=production`

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set `VITE_API_URL` to your backend API URL
4. Configure redirects for SPA routing

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test  # Run API tests (when implemented)
```

### Frontend Testing
```bash
cd frontend
npm test  # Run component tests (when implemented)
```

## 📝 Development Notes

### Code Structure
- **Modular Design**: Each feature is separated into its own route/component
- **Type Safety**: Full TypeScript support with defined interfaces
- **Error Handling**: Comprehensive error handling on both frontend and backend
- **Responsive Design**: Mobile-first approach with TailwindCSS utilities

### Best Practices Implemented
- RESTful API design with proper HTTP status codes
- Input validation and sanitization
- CORS configuration for security
- Environment-based configuration
- Proper error messages and user feedback
- Clean code organization and separation of concerns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the Known Issues section above
2. Review the API documentation
3. Ensure all dependencies are properly installed
4. Verify environment variables are correctly set
5. Check that both backend and frontend servers are running

## 🔮 Future Enhancements

Potential features for future versions:
- User authentication and role-based access
- Email notifications for payment reminders
- Advanced reporting and analytics
- Integration with payment gateways
- Mobile app development
- Multi-tenant support for multiple training businesses
- Automated backup and restore functionality
- Advanced search and filtering options
- Export functionality for reports and data

---

**Built with ❤️ for training businesses worldwide**

