# 🚌 Bus Mitra – Smart Bus Information & Management System

**Bus Mitra** is a web-based bus information and management platform designed to make public transportation information more accessible, organized, and convenient for passengers.

The platform provides a user-friendly Client Panel for passengers and a dedicated Admin Panel for managing bus-related information through a centralized Backend Server.

---

## 🚀 Project Overview

Bus Mitra consists of three main modules:

### 1. Client Panel
A user-friendly interface for passengers to explore bus information.

**Features:**
- Search and explore bus routes.
- View bus stands and depots.
- Explore route stops and via stops.
- Suggest new routes.
- Contribute information about missing stops.
- View relevant bus information through a responsive interface.

### 2. Admin Panel
A dedicated dashboard for administrators to manage the platform.

**Features:**
- Secure Admin Login.
- Admin Dashboard with statistics.
- Manage bus routes.
- Manage bus stands.
- Manage depots.
- Manage bus timetables.
- Manage bus types.
- Review community reports.
- Review route suggestions.
- Manage via-stop suggestions.
- AI-assisted data import.
- Admin settings and activity management.

### 3. Backend Server
A centralized backend responsible for application data and business logic.

**Features:**
- REST API integration.
- Admin authentication.
- MongoDB database connectivity.
- Route and bus stand management.
- Timetable management.
- Community contribution management.
- Route and via-stop suggestions.
- Data validation and API handling.

---

## 🛠️ Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript |
| UI | CSS, HTML |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| API | REST API |
| Package Manager | npm |
| Version Control | Git, GitHub |

---

## 📂 Project Structure

```text
bus-mitra/
│
├── bus-mitra-admin/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── bus-mitra-client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── bus-mitra-server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   └── server.ts
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB

### Step 1: Clone Repository

```bash
git clone https://github.com/Saneed-Nayak/bus-mitra.git
cd bus-mitra
```

### Step 2: Setup Backend Server

```bash
cd bus-mitra-server
npm install
```

Configure your `.env` file using `.env.example` and provide your MongoDB connection string and other required environment variables.

Start the backend:

```bash
npm run dev
```

### Step 3: Setup Client Panel

Open a new terminal:

```bash
cd bus-mitra-client
npm install
npm run dev
```

### Step 4: Setup Admin Panel

Open another terminal:

```bash
cd bus-mitra-admin
npm install
npm run dev
```

---

## 🔐 Authentication

- Client Panel: Designed for public access without mandatory login.
- Admin Panel: Dedicated admin authentication.
- Backend: Handles authentication and protected administrative operations.

---

## 🎯 Project Objectives

- Make bus information easily accessible.
- Improve the passenger experience.
- Provide centralized bus information management.
- Enable community participation in improving transport information.
- Simplify administration through a dedicated dashboard.
- Build a responsive and user-friendly transportation platform.

---

## 🔮 Future Enhancements

- Live bus tracking.
- Real-time bus arrival updates.
- Interactive route maps.
- Mobile application.
- Advanced AI-based route recommendations.
- Improved public transport analytics.

---

## 👨‍💻 Developer

**Saneed Nayak**

GitHub: [@Saneed-Nayak](https://github.com/Saneed-Nayak)

---

## 📜 License

This project is developed for educational and development purposes.

---

⭐ If you find this project interesting, consider giving this repository a star!

**Bus Mitra – Making Public Transportation Information Smarter and Easier.** 🚌
