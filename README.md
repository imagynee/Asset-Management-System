# Asset Management System (AMS)

A comprehensive web-based application for managing organizational assets, employee allocations, maintenance records, and vendor relationships.

## Overview

The Asset Management System is designed to streamline asset lifecycle management across organizations. It provides a centralized platform for tracking asset inventory, managing employee assignments[...]

## Key Features

- **Asset Management**: Register, track, and manage assets with unique identification tags
- **Asset Assignment & Allocation**: Assign assets to employees with detailed tracking and history
- **Asset Returns**: Manage asset returns with remarks and documentation
- **QR Code Integration**: Quick identification and tracking of assets
- **Maintenance Tracking**: Record and monitor maintenance activities, costs, and completion dates
- **Dashboard Analytics**: Real-time key statistics and asset overview
- **Admin Authentication**: Secure admin login via credentials
- **Admin Password Management**: Change admin password securely
- **Category Management**: Organize assets by categories (Computers, Laptops, Printers, etc.)
- **Department Management**: Track assets by organizational departments
- **Vendor Management**: Manage vendor information for warranty and maintenance services
- **Reports & Analytics**: Generate comprehensive reports on asset status and allocation
- **Audit Logging**: Track all system actions for transparency and compliance

## Tech Stack

### Frontend
- **React** (v19.0.0) - UI framework
- **Vite** (v6.2.3) - Build tool and dev server
- **Tailwind CSS** (v4.0.17) - Styling and responsive design
- **React Router** (v7.4.0) - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization and charts
- **Lucide React** - Icon library
- **Vercel Analytics** - User analytics tracking

### Backend
- **Node.js & Express** (v5.2.1) - Server framework
- **MongoDB & Mongoose** (v9.7.0) - NoSQL database and ODM
- **JWT** (jsonwebtoken v9.0.3) - Authentication tokens
- **Bcrypt** - Password hashing and security
- **Multer** (v2.1.1) - File upload handling
- **XLSX** (v0.18.5) - Excel file generation for reports
- **QRCode** (v1.5.4) - QR code generation
- **Nodemailer** (v7.0.11) - Email notifications
- **Express Validator** (v7.3.2) - Input validation
- **Express Session** - Session management
- **CORS** - Cross-origin resource sharing

### Database
- **MongoDB** - NoSQL database for data persistence

## System Architecture

### Database Schema ( using Mongoose )

The system uses the following core entities:

1. **Employee** - Employees and administrators
2. **Assets** - Physical assets tracked by unique tags
3. **Categories** - Asset classifications
4. **Vendors** - Service providers and suppliers
5. **Departments** - Organizational divisions
6. **Asset History** - Historical tracking of asset allocations, service and repair history

### API Routes

The backend provides RESTful endpoints organized by resource. For detailed API documentation, visit:
**[AMS API Documentation](https://documenter.getpostman.com/view/55948879/2sBXwvKU9z)**

Key endpoint categories:
- `/api/auth` - Authentication endpoints
- `/api/assets` - Asset CRUD and management
- `/api/employees` - Employee management
- `/api/departments` - Department management
- `/api/vendors` - Vendor management
- `/api/categories` - Asset category management
- `/api/returns` - Asset return management
- `/api/maintenance` - Maintenance record tracking
- `/api/dashboard` - Analytics and statistics
- `/api/reports` - Report generation and export

### Frontend Pages

- **Dashboard** - Overview and key metrics
- **Assets** - Asset list, detail view, and management
- **Employees** - Employee directory and asset allocation
- **Departments** - Department organization and management
- **Vendors** - Vendor information and service tracking
- **Categories** - Asset categorization
- **Returns** - Asset return history and management
- **Maintenance** - Service records and scheduling
- **Reports** - Data export and analytics
- **Settings** - User preferences and admin password management

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Authentication & validation middleware
│   ├── models/          # Data schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   ├── server.js        # Express app setup
│   ├── .env.example     # Environment variables template
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/         # API service calls
│   │   ├── components/  # Reusable React components
│   │   ├── context/     # Global state management
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Helper functions
│   │   ├── App.jsx      # Main app component
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.local       # Environment variables (not tracked)
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://username:password@host:port/database?options
   ADMIN_USERNAME=Admin
   ADMIN_PASSWORD=12345
   ```

   **Example `.env` file:**
   ```env
   PORT=5000
   MONGO_URI=mongodb://dibs_user:dib01@ac-fyralin-shard-00-00.dvzd3l0.mongodb.net:27017,ac-fyralin-shard-00-01.dvzd3l0.mongodb.net:27017,ac-fyralin-shard-00-02.dvzd3l0.mongodb.net:27017/?ssl=true[...]
   ADMIN_USERNAME=Admin
   ADMIN_PASSWORD=12345
   ```

3. Start the backend server:
   ```bash
   npm start
   ```
   The server will run on the specified PORT (default: 5000)

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   npm install
   ```

2. Create a `.env` file in the client directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`

4. Build for production:
   ```bash
   npm run build
   ```

## Authentication

The system uses **admin-only authentication**. The credentials are configured via environment variables in the backend:

- **Admin Username**: Configured via `ADMIN_USERNAME` in `.env`
- **Admin Password**: Configured via `ADMIN_PASSWORD` in `.env`

### Admin Features

- Change admin password securely through the Settings page
- Access to all system features and reports
- Full asset management capabilities
- User and vendor management

## API Documentation

For comprehensive details about all API endpoints, parameters, and response formats, refer to the official documentation:

🔗 **[AMS Postman API Documentation](https://documenter.getpostman.com/view/55948879/2sBXwvKU9z)**

This includes:
- Endpoint specifications
- Request/response examples


## Features in Detail

### Asset Lifecycle Management
- Create and register new assets with unique identification tags
- Track asset status (Available, Assigned, Maintenance, Disposed)
- Manage asset metadata (serial numbers, purchase dates, warranty info)
- Monitor asset current assignment

### Employee Asset Management
- Allocate assets to employees with assignment dates
- Track asset return history with tracking records
- View employee asset holdings and allocation history
- Generate allocation reports by employee or department

### Maintenance & Support
- Log maintenance activities with service dates and costs
- Track vendor service history and performance
- Monitor warranty expiration dates
- Schedule preventive maintenance

### Reporting & Analytics
- Dashboard with key asset statistics
- Generate Excel reports for exports
- Asset utilization analytics
- Department-wise asset distribution
- Maintenance cost tracking


## Environment Variables Reference

### Backend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://...` |
| `ADMIN_USERNAME` | Admin login username | `Admin` |
| `ADMIN_PASSWORD` | Admin login password | `12345` |

### Frontend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

## Production Deployment

### Frontend (Vercel)
1. Set `VITE_API_URL` environment variable to your backend URL
2. Update CORS in `server.js` to include Vercel URL
3. Deploy to Vercel

### Backend (Render)
1. Set environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://dibs_user:dib01@ac-fyralin-shard-00-00.dvzd3l0.mongodb.net:27017,ac-fyralin-shard-00-01.dvzd3l0.mongodb.net:27017,ac-fyralin-shard-00-02.dvzd3l0.mongodb.net:27017/?ssl=true&replicaSet=atlas-cwe79f-shard-0&authSource=admin&appName=ams
   ADMIN_USERNAME=Admin
   ADMIN_PASSWORD=12345
   ```
2. Update CORS in `server.js` to include Vercel frontend URL
3. Deploy to Render

## Future Enhancements

- QR Code Scanning for quick asset identification
- Mobile application for asset tracking
- Asset depreciation calculation
- Email notifications for maintenance alerts
- Advanced analytics dashboard with predictive insights
- Multi-location support
- Asset condition scoring system
- Role-based access control for multiple user types

## Support & Documentation

- **API Documentation**: [Postman API Docs](https://documenter.getpostman.com/view/55948879/2sBXwvKU9z)
- **Issues & Feedback**: Refer to the project repository

## License

ISC
