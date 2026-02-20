# 🌊 Focus Flow

**Focus Flow** is a high-performance, premium task management application built with a modern tech stack. Designed for deep work and seamless organization, it features a terminal-inspired aesthetic with glassmorphism, fluid animations, and a powerful Go-based backend.

---

## ✨ Key Features

### 🚀 Performance & UX
- **Infinite Scroll**: Seamlessly browse through thousands of missions without lag.
- **Micro-Animations**: Powered by **Framer Motion** for a tactile, responsive feel.
- **Instant Search & Filter**: Real-time server-side searching for high efficiency.
- **Smart Notifications**: Elegant toast feedback for every action via **Sonner**.

### 🛠️ Task Management
- **Hierarchical Subtasks**: Break down complex objectives into bite-sized steps with progress tracking.
- **Custom Categories**: Organize your workflow with user-defined labels and curated color palettes.
- **Daily Focus Banner**: At-a-glance visibility of overdue missions and today's priorities.
- **Smart Deadlines**: Visual indicators for upcoming and overdue tasks.

### 📊 Analytics
- **Productivity Dashboard**: Real-time stats showing your efficiency rate and mission breakdown.
- **7-Day Activity Chart**: Visualize your productivity trends with an interactive bar chart.

### 🛡️ Secure & Reliable
- **JWT Authentication**: Secure user sessions with persistent login.
- **Optimized Backend**: PostgreSQL indexing and optimized SQL joins for sub-millisecond query responses.
- **Dark Mode First**: A sleek, slate-based dark theme optimized for eye comfort.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Components**: [Radix UI](https://www.radix-ui.com/)

### Backend
- **Language**: [Go](https://go.dev/) (Golang)
- **Web Framework**: [Fiber](https://gofiber.io/)
- **ORM**: [GORM](https://gorm.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Documentation**: [Swagger / Swag](https://github.com/swaggo/swag)

### Infrastructure
- **Monorepo Management**: [Turbo](https://turbo.build/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 📁 Project Structure

```text
task-management/
├── apps/
│   ├── api/          # Go Fiber Backend
│   └── web/          # React Frontend (Vite)
├── docs/             # PRD and Architecture Docs
├── package.json      # Workspace root
└── turbo.json        # Pipeline configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Go](https://go.dev/doc/install) (v1.21+)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- [PostgreSQL](https://www.postgresql.org/download/)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/focus-flow.git
   cd focus-flow
   ```

2. **Backend Configuration**
   - Navigate to `apps/api`
   - Create a `.env` file based on your PostgreSQL setup:
     ```env
     DB_HOST=localhost
     DB_USER=youruser
     DB_PASSWORD=yourpassword
     DB_NAME=focusflow
     DB_PORT=5432
     JWT_SECRET=your_secret_key
     ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author
**Adhy**
- GitHub: [@adhybaswe](https://github.com/adhybaswe)
