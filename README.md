# 💼 Business Nexus – Frontend Project

A networking platform connecting **Entrepreneurs** and **Investors**. Built as part of the **DevelopersHub Internship**, this frontend project showcases role-based dashboards, profiles, collaboration requests, and a real-time-style chat interface.

---

## 🚀 Tech Stack
- ⚛️ **React.js** with Vite
- 🎨 **Tailwind CSS** for styling
- 🧭 **React Router** for routing
- 🔗 **Axios** for API integration (mock data)
- 🗂️ **GitHub** for version control

---

## 📁 Project Features

### ✅ Week 1 – Setup & Authentication
- Vite + Tailwind project setup
- Role-based Login & Register forms
- Routing for:
  - `/login`
  - `/register`
  - `/dashboard/investor`
  - `/dashboard/entrepreneur`
- Shared layout with Navbar/Sidebar

### ✅ Week 2 – Dashboards & Profiles
- **Investor Dashboard**: View entrepreneur list with pitch summary
- **Entrepreneur Dashboard**: View collaboration requests from investors
- Profile pages:
  - Entrepreneur: Bio, startup, funding need, pitch deck
  - Investor: Bio, interests, portfolio
- Mock API/data integration

### ✅ Week 3 – Communication & Polish
- 1-on-1 real-time-style chat UI
- Chat accessible from profile or dashboard
- Features:
  - Timestamps
  - Message alignment
  - Role-based user display (avatar, name)
- UI Enhancements:
  - Hover effects, transitions
  - Mobile responsiveness
  - Optional dark mode

---

## 📦 Folder Structure

```bash
business-nexus/
├── attached_assets/
├── client/              # Frontend source code (React)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       └── App.tsx
├── shared/
├── server/              # (Optional) Backend mock or placeholder
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
