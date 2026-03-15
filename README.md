# AI-Powered CRM Email Intelligence System

A full-stack CRM application that uses AI to analyze emails, classify sentiment and priority, suggest format-specific auto-replies, and intelligently sort emails for action.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vite + React.js |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **AI Engine** | NLP Sentiment Analysis + Priority Classification |

## 📋 Features

### 🤖 AI-Powered Analysis
- **Sentiment Analysis**: Classifies emails as angry, happy, neutral, negative, or positive
- **Priority Classification**: Auto-assigns high, medium, or low priority based on content
- **Category Detection**: Identifies complaint, inquiry, feedback, support, billing, partnership emails
- **Auto-Reply Generation**: Creates contextual, sentiment-aware reply templates
- **Smart Sorting**: Prioritizes high-priority emails first, then medium, then low

### 🎨 HCI Design Principles
- Premium dark theme with glassmorphism effects
- Micro-animations and smooth transitions
- Intuitive sidebar navigation with badge counts
- Color-coded sentiment and priority indicators
- Responsive design for all screen sizes

### 🌐 Web Engineering
- RESTful API architecture
- MongoDB Atlas cloud database
- Proxy-based API routing
- Pagination and filtering
- Real-time search

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Atlas account

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Configure MongoDB Atlas

Edit `backend/.env` and replace with your MongoDB Atlas connection string:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/crm_email_intelligence?retryWrites=true&w=majority
PORT=5000
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This will populate the database with 50 realistic email samples, each analyzed by the AI engine.

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on http://localhost:5000

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emails` | Get all emails (with filters, pagination, sorting) |
| GET | `/api/emails/:id` | Get single email |
| POST | `/api/emails` | Create email (AI analyzes automatically) |
| PUT | `/api/emails/:id` | Update email |
| DELETE | `/api/emails/:id` | Delete email |
| POST | `/api/emails/:id/reply` | Mark as replied |
| POST | `/api/emails/:id/analyze` | Re-run AI analysis |
| POST | `/api/emails/:id/star` | Toggle star |
| GET | `/api/analytics` | Get dashboard analytics |

## 📁 Project Structure

```
├── frontend/                 # Vite + React Frontend
│   ├── src/
│   │   ├── components/       # Sidebar, TopBar, ComposeModal
│   │   ├── pages/            # Dashboard, EmailList, EmailDetail, Analytics
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Main app with routing
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Complete design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # Node.js + Express Backend
│   ├── config/               # MongoDB connection
│   ├── models/               # Email schema
│   ├── controllers/          # Request handlers
│   ├── routes/               # API routes
│   ├── services/             # AI analysis engine
│   ├── server.js             # Express server
│   ├── seed.js               # Database seeder
│   └── package.json
```

## 🎯 AI Analysis Pipeline

1. **Input** → Email received (subject + body)
2. **Sentiment Analysis** → NLP scores text from -1 to +1
3. **Priority Classification** → Keyword detection + sentiment weighting
4. **Category Detection** → Pattern matching for email type
5. **Auto-Reply Generation** → Template selection based on sentiment × category
6. **Tag Generation** → Automatic tagging for organization
7. **Smart Sort** → Emails ordered: High Priority → Medium → Low

---

Built with ❤️ for Web Engineering, HCI, and AI coursework.
