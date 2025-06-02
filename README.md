# Mini CRM Platform

A modern, full-stack CRM solution that empowers businesses to manage customer relationships effectively. Built with React and Node.js, it features AI-powered campaign messaging, real-time analytics, and robust customer segmentation capabilities. Perfect for businesses looking to streamline their customer engagement and marketing efforts.

Key Highlights:
- 🎯 Smart customer segmentation
- 🤖 AI-powered message generation
- 📊 Real-time campaign analytics
- 🔄 Asynchronous data processing
- 🔐 Secure Google authentication

## 📚 Table of Contents

- [Mini CRM Platform](#mini-crm-platform)
  - [📚 Table of Contents](#-table-of-contents)
  - [🚀 Features](#-features)
  - [🏗 Architecture](#-architecture)
  - [🧠 Tech Stack](#-tech-stack)
  - [🌐 Live Demo](#-live-demo)
  - [💪 Getting Started](#-getting-started)
    - [Development (Docker)](#development-docker)
  - [⚙ Environment Variables](#-environment-variables)
    - [Backend (`/backend/.env`)](#backend-backendenv)
    - [Frontend (`/frontend/.env`)](#frontend-frontendenv)
  - [📘 API Documentation (Swagger)](#-api-documentation-swagger)
    - [Database \& Message Queue](#database--message-queue)
    - [Worker Process](#worker-process)
  - [📞 Contact \& Support](#-contact--support)
  - [📜 License](#-license)

## 🚀 Features

* **Dynamic Customer Segmentation:** Build targeted segments using flexible rules based on customer metrics (total spend, visits, etc.)
* **Campaign Management:** Create and track marketing campaigns with real-time delivery stats
* **AI-Powered Messaging:** Generate personalized campaign messages using Google's Gemini AI
* **Bulk Data Import:** Easy JSON-based import for customers and orders data
* **Real-time Campaign Stats:** Track sent and failed message counts for each campaign
* **Google Authentication:** Secure login via Google OAuth 2.0
* **Modern Dashboard:** Intuitive interface with real-time updates and responsive design
* **Async Processing:** Redis Streams for reliable background processing of:
  - Customer data ingestion
  - Order processing
  - Message delivery and status tracking

## 🏗 Architecture

```
[ Frontend (Vercel) ]  <--REST-->  [ Backend API (Render) ]
            |                              |
            |                              |--[ Redis Streams (pub/sub) consumers ]
      End User (browser)                   |
      |-> Customer ingest                  |
      |-> Order ingest                     |
      |-> Delivery Receipt ingest          |
                                           |
                              [ MongoDB Database ]
```

Redis Streams and consumer workers (Node.js) are used for background task processing and message queueing.

## 🧠 Tech Stack

**Frontend:**
* React 19 with Vite
* React Router v7 for navigation
* Tailwind CSS for styling
* Google OAuth integration (@react-oauth/google)
* JWT handling with jwt-decode
* React Icons for UI elements
* Axios for API calls

**Backend:**
* Node.js with Express
* MongoDB with Mongoose ODM
* Redis Streams for async processing
* JWT for authentication
* Google OAuth2 integration
* Google Gemini AI for message generation
* Joi for request validation
* Swagger/OpenAPI for API documentation
* CORS support
* Environment configuration with dotenv

**Development Tools:**
* ESLint for code quality
* Nodemon for development
* Vite for frontend builds
* Concurrently for running multiple processes

## 🌐 Live Demo

* **Frontend:** [https://mini-crm-platform-xeno.vercel.app](https://mini-crm-platform-xeno.vercel.app)
* **Backend API:** [https://mini-crm-plaform-qhsk.onrender.com](https://mini-crm-plaform-qhsk.onrender.com)
* **Swagger Docs:** [https://mini-crm-plaform-qhsk.onrender.com/api-docs](https://mini-crm-plaform-qhsk.onrender.com/api-docs)

## 💪 Getting Started

### Development (Docker)

1. **Clone the repository**

   ```bash
   git clone https://github.com/bansal-harsh-2504/Mini-CRM-Platform.git
   cd Mini-CRM-Platform
   ```

2. **Configure environment variables**

   * Copy `.env.sample` to `.env` in both `/backend` and `/frontend` and update values (see below).

3. **Build and start all services**

   ```bash
   docker-compose up --build
   ```

   * Frontend: [http://localhost:3000](http://localhost:3000)
   * Backend: [http://localhost:8000](http://localhost:8000)
   * MongoDB: Internal (see .env)
   * Redis: Internal for event and task queue

4. **Start background consumers** (in a separate terminal/window):

   ```bash
   # In /backend:
   node ./services/streamWorker.js
   ```

   Or use `npm run worker`. These are required for async creation and message delivery handling.

## ⚙ Environment Variables

### Backend (`/backend/.env`)

```
ENV=development
PORT=8000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
GEMINI_API_KEY=<your-google-gemini-api-key>
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
REDIS_URL=<your-redis-url>
BASE_URL_FRONTEND=http://localhost:5173
BASE_URL_BACKEND=http://localhost:8000
```

### Frontend (`/frontend/.env`)

```
VITE_BASE_URL_BACKEND=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

Update URLs as needed for production.

## 📘 API Documentation (Swagger)

Our API is fully documented using Swagger specification, available at `/api-docs` endpoint. The documentation includes:

**Core Endpoints:**
- **Authentication:** Google OAuth2.0 integration
- **Customers:** Async customer data ingestion
- **Orders:** Async order processing
- **Campaigns:** 
  - Campaign creation with segmentation rules
  - Campaign history and stats
  - Audience preview calculations
- **AI Integration:** Message suggestions via Gemini API
- **Vendor Integration:** Message delivery simulation and status tracking

**Authentication:**
- All endpoints (except auth) require JWT Bearer token
- Tokens are obtained through Google OAuth2.0 flow
- Token validation and refresh mechanisms included

**Response Format:**
```json
{
  "success": boolean,
  "data": {
    // Response data specific to each endpoint
  },
  "message": "Optional status message"
}
```

### Database & Message Queue
- **MongoDB:** Using MongoDB Atlas cloud database
  - Secure, scalable document storage
  - No self-hosting required
  - Connection via MongoDB Atlas URI in environment variables

- **Redis:** Required for async processing
  - Can use local Redis for development
  - For production, using Redis Cloud
  - Connection via Redis URL in environment variables

### Worker Process
The application uses a worker process for async operations:
```bash
# In /backend
# Start both API and worker
npm start

# Start worker separately (if needed)
npm run worker
```

The worker process (running on Render) handles:
- Customer data ingestion
- Order processing
- Campaign message delivery
- Status updates

## 📞 Contact & Support

* Developed by **Harsh Bansal**
* 📬 Email: [harshbansa.2032@gmail.com](mailto:harshbansal.2032@gmail.com)
* 💼 [Portfolio](https://harshbansal.vercel.app)
* 👥 [GitHub](https://github.com/bansal-harsh-2504)
* 🔗 [LinkedIn](https://linkedin.com/in/bansal-harsh1)

## 📜 License

MIT