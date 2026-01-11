# Bus Travel Platform

A production-ready, full-stack Bus Travel Platform with community features, advanced notifications, internationalization, interactive route planning, dark mode, and comprehensive review system.

## 🚀 Features

### 1. Community & User-Generated Content
- **Verified Users Only**: Only verified users can create posts
- **Post Management**: Create posts with text and images
- **Social Interactions**: Like posts, comment on posts
- **Content Moderation**: Report posts for review
- **Community Forums**: Organized by Routes, Destinations, and Travel Tips
- **Trending Posts**: Algorithm-based trending posts based on engagement
- **Social Sharing**: Shareable post URLs

### 2. Advanced Notification System
- **Multi-Channel Notifications**: Email and Push notifications
- **Notification Types**:
  - Booking confirmation
  - Cancellation alerts
  - Schedule changes
  - Journey reminders
  - Promotions (opt-in)
- **User Preferences**: Granular control over notification channels
- **Localization**: Language-based notifications
- **Retry Logic**: Automatic retry for failed notifications
- **Notification History**: Complete log of all notifications

### 3. Internationalization (i18n)
- **Multi-Language Support**: English, Spanish, French
- **Persistent Language**: Saved in database and localStorage
- **Dynamic Switching**: Change language without page reload
- **Comprehensive Translation**: UI text, buttons, errors, validation messages
- **Fallback Support**: Defaults to English if translation missing

### 4. Interactive Route Planning Tool
- **Route Planning**: Select start location, destination, and waypoints
- **Interactive Maps**: Google Maps integration
- **Route Information**: Distance, ETA, traffic congestion
- **Alternate Routes**: Auto-suggest based on traffic
- **Route Comparison**: Compare routes by time, distance, and traffic
- **Saved Routes**: Save favorite routes to user profile
- **Live Traffic Updates**: Real-time traffic information

### 5. Dark Mode
- **Theme Toggle**: Instant light/dark mode switching
- **Persistent Preference**: Saved in database and localStorage
- **Global Application**: Applied across all components
- **Default Mode**: Light mode if no preference set

### 6. Route Rating & Review System
- **Verified Users Only**: Only verified users can review
- **Journey-Based**: Reviews only after journey completion
- **One Review Per Journey**: Prevents duplicate reviews
- **5-Star Rating System**: 1-5 star ratings
- **Minimum Content Length**: 50 characters required
- **Edit Window**: 24-hour edit window, then locked
- **Moderation**: Report reviews, auto-hide after multiple reports
- **Trusted Reviewers**: Highlighted based on upvotes
- **Statistics**: Average rating, recent reviews, rating distribution

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite) - Modern React framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **react-i18next** - Internationalization
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Google Maps API** - Map integration
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email notifications
- **Firebase Admin SDK** - Push notifications (optional)

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Maps API key
- Email account for notifications (Gmail recommended)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Ted Bus"
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Backend Configuration

1. Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-travel-platform?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

2. **MongoDB Atlas Setup**:
   - Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Get your connection string
   - Replace `<username>`, `<password>`, and `<cluster>` in the connection string

3. **Google Maps API Setup**:
   - Go to https://console.cloud.google.com/
   - Enable Maps JavaScript API and Directions API
   - Create an API key
   - Add the key to your `.env` file

4. **Email Setup** (Gmail):
   - Enable 2-Step Verification
   - Generate an App Password
   - Use the app password in `EMAIL_PASS`

### 4. Frontend Configuration

1. Create a `.env` file in the `frontend` directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
bus-travel-platform/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── user.controller.js   # User management
│   │   ├── post.controller.js   # Post operations
│   │   ├── notification.controller.js  # Notifications
│   │   ├── routePlanning.controller.js # Route planning
│   │   └── review.controller.js # Review system
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT authentication
│   ├── models/
│   │   ├── User.model.js        # User schema
│   │   ├── Post.model.js        # Post schema
│   │   ├── Comment.model.js     # Comment schema
│   │   ├── Like.model.js        # Like schema
│   │   ├── Report.model.js      # Report schema
│   │   ├── Notification.model.js # Notification schema
│   │   ├── NotificationPreference.model.js
│   │   ├── SavedRoute.model.js  # Saved routes
│   │   ├── Route.model.js       # Bus routes
│   │   ├── Journey.model.js     # User journeys
│   │   ├── Review.model.js      # Reviews
│   │   └── ReviewReport.model.js # Review reports
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── user.routes.js       # User endpoints
│   │   ├── post.routes.js       # Post endpoints
│   │   ├── notification.routes.js # Notification endpoints
│   │   ├── routePlanning.routes.js # Route planning endpoints
│   │   └── review.routes.js     # Review endpoints
│   ├── services/
│   │   └── notification.service.js # Notification service
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── community/       # Community components
│   │   │   ├── reviews/         # Review components
│   │   │   └── layout/         # Layout components
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx  # Auth state
│   │   │   └── ThemeContext.jsx # Theme state
│   │   ├── i18n/
│   │   │   ├── config.js        # i18n configuration
│   │   │   └── locales/        # Translation files
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── RoutePlanning.jsx
│   │   │   ├── Reviews.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Profile.jsx
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for authentication:

1. **Register**: Create a new account
2. **Login**: Get JWT token
3. **Protected Routes**: Require authentication
4. **Verified Users**: Special permissions for verified accounts

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post (verified users only)
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment on post
- `POST /api/posts/:id/report` - Report post

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

### Route Planning
- `POST /api/route-planning/plan` - Plan a route
- `POST /api/route-planning/save` - Save route (authenticated)
- `GET /api/route-planning/saved` - Get saved routes
- `POST /api/route-planning/compare` - Compare routes

### Reviews
- `GET /api/reviews/route/:routeId` - Get route reviews
- `POST /api/reviews` - Create review (verified users only)
- `PUT /api/reviews/:id` - Update review (within 24h)
- `POST /api/reviews/:id/upvote` - Upvote review
- `POST /api/reviews/:id/report` - Report review

## 🎨 Features in Detail

### Community Posts
- Create posts in categories: Routes, Destinations, Travel Tips
- Like and comment on posts
- Report inappropriate content
- Trending algorithm based on engagement

### Notifications
- Email notifications via Nodemailer
- Push notifications (Firebase FCM - requires setup)
- User preferences for each notification type
- Retry mechanism for failed notifications

### Route Planning
- Google Maps integration
- Route comparison
- Save favorite routes
- Traffic information

### Reviews
- Only after journey completion
- 24-hour edit window
- Moderation system
- Trusted reviewer badges

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables in your hosting platform
2. Update `FRONTEND_URL` to your frontend URL
3. Deploy the backend

### Frontend Deployment (Vercel/Netlify)

1. Set `VITE_GOOGLE_MAPS_API_KEY` in environment variables
2. Update API URLs if needed
3. Deploy the frontend

## 📝 Notes

- **Email Verification**: Currently simplified. In production, implement proper email verification flow.
- **Push Notifications**: Firebase Admin SDK setup required for push notifications.
- **Image Upload**: Currently supports image URLs. Implement file upload with Multer for production.
- **Geocoding**: Route planning uses coordinates. Implement address geocoding for better UX.

## 🤝 Contributing

This is a production-ready codebase following clean architecture principles:
- Separation of concerns (controllers, routes, models, services)
- Modular code structure
- Comprehensive error handling
- Code comments explaining logic

## 📄 License

This project is created for educational/internship purposes.

## 👨‍💻 Author

Built as a production-ready, internship-quality Bus Travel Platform.

---

**Note**: Remember to:
1. Change JWT_SECRET in production
2. Set up proper email verification
3. Configure Firebase for push notifications
4. Implement file upload for images
5. Add rate limiting for API endpoints
6. Set up proper error logging
7. Add unit and integration tests

