# SafeVitals XR — Enterprise Spatial Workforce Command Center

<div align="center">
  <img src="https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&auto=format&fit=crop&q=80" alt="SafeVitals XR Banner" width="100%" style="border-radius: 12px; max-height: 280px; object-fit: cover;" />
  <br />
  <p><strong>A production-ready Enterprise Spatial Workforce Command Center, Time Tracking, and Operations Platform engineered for XR/VR engineering teams and modern high-performance organizations.</strong></p>
  <br />
</div>

---

## 📖 What is SafeVitals XR?

**SafeVitals XR** is a high-scale, enterprise-ready workforce operations management system. It provides real-time time & attendance tracking, workforce directory management, sprint task management via Kanban, leave request workflows, weekly shift reporting with file uploads, support desk ticketing, role-based access control (RBAC), and security audit trails.

The frontend is built with **Next.js 16 (App Router)** and connected directly to the **SafeVitals XR NestJS Backend API** (MongoDB with Mongoose, JWT Two-Factor Authentication, and Supabase Storage).

---

## ✨ Core Features & Modules

### 1. 🔐 Production Authentication & Two-Factor Verification
- **Secure Email/Password Login (`/login`)**: Authenticates against the backend API and initiates two-factor verification.
- **Two-Factor OTP Verification (`/verify-otp`)**: Verifies the dispatched 6-digit email security code to issue a secure JWT bearer session.
- **Account Invitation & Activation (`/activate-account`)**: Parses invitation tokens from URL query parameters to establish permanent employee credentials.
- **Password Recovery & Reset (`/forgot-password`, `/reset-password`)**: Dispatches password recovery tokens with token-verified reset actions.
- **Global Auth Interceptor (`apiClient.ts`)**: Automatically attaches JWT bearer tokens and safely handles 401 unauthenticated session expirations.

### 2. ⏱️ Time & Attendance Command Center (`/app/attendance` & `/app/dashboard`)
- **Server-Synchronized Punch Terminal**: Clock in, take breaks, end breaks, and clock out with live backend session sync.
- **Live Active Shift Counter**: Dynamic shift duration stopwatch synchronized with backend punch timestamps.
- **Workforce Presence Breakdown**: Real-time visualization of employees currently *Working*, *On Break*, *On Leave*, and *Suspended*.
- **Timesheet Export**: Download full organizational attendance history directly to formatted CSV spreadsheets.

### 3. 👥 Workforce Directory (`/app/employees`, `/app/employees/[id]`)
- **Dual View Modes**:
  - **Cards View**: Profile cards with employee avatar, position, contact info, department tag, and quick administrative actions.
  - **Table View**: High-density tabular layout with employee IDs, joining dates, and live status badges.
- **Search & Filters**: Real-time filtering by name, employee ID, position, email, department, and account status (*All*, *Active*, *Suspended*).
- **Employee Onboarding**: Modal for creating new employee records with department, team, and security role assignments.
- **Employee Details & Profile Management**: Complete profile management for reassigning departments, updating contact info, and suspending or deactivating accounts.

### 4. 📋 Tasks & Sprints Kanban Board (`/app/tasks`)
- **Interactive Kanban Columns**: *To Do*, *In Progress*, and *Done* sprint workflow columns.
- **Priority Indicators**: Urgent (Red), High (Amber), Medium (Blue), Low (Gray).
- **Status Transitions**: 1-click status transitions across Kanban stages persisted to backend `/api/tasks`.
- **Assignee Filters**: Toggle between *All Tasks* and *My Assigned Tasks*.

### 5. 🌴 Leave & Absence Tracker (`/app/leave`)
- **Dynamic Leave Balances**: Summaries of confirmed casual, medical/sick, and annual leaves calculated from server data.
- **Automatic Duration Calculator**: Date pickers calculate requested business days in real time.
- **Manager Approval Queue**: Real-time desk for managers and admins to review, approve, or reject employee leave requests with notes.

### 6. 📊 Weekly Shift Reports (`/app/reports`)
- **Weekly Deliverables Logging**: Document key deliverables worked on, completed milestones, blockers, and next-week sprint goals.
- **Supabase Cloud File Uploads**: Upload documents, incident logs, or spatial capture archives alongside weekly reports.
- **Manager Review Workflow**: Review queue for management to mark reports as *Approved* or *Needs Revision*.

### 7. 🎫 Support & Helpdesk Desk (`/app/tickets`)
- **Multi-Category Incident Tracking**: *XR Hardware*, *IT Support*, *Facilities*, and *HR & Personnel*.
- **Priority Matrix**: Low, Medium, High, and Urgent blocker classifications.
- **Resolution Workflow**: Action desk for resolving support tickets with audit logging.

### 8. 🛡️ Administration & Security Governance
- **Role-Based Access Control (`/app/roles`)**: Manage security roles and toggle granular permissions across employee, attendance, leave, task, and security modules.
- **Elevated Access Requests (`/app/access-requests`)**: Formal request and review queue for privileged hardware/software system credentials.
- **Security Audit Trail (`/app/audit`)**: Immutable server-recorded ledger of all administrative and security actions.
- **Departments & Teams (`/app/departments`, `/app/teams`, `/app/organization`)**: Manage departmental units, cross-functional squads, and organizational hierarchy.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) 16.3 (App Router with Turbopack) |
| **Library** | [React](https://react.dev/) 19 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5.x |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) 5 (Lightweight session persistence) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) Primitives & Lucide Icons |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) Toasts |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm** or **pnpm** / **yarn**
- **SafeVitals XR Backend**: Running locally on `http://localhost:4000` (or configured remote URL)

### 1. Installation
Clone the repository and install project dependencies:
```bash
cd "Safevital XR-frontend"
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Running in Development Mode
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Building for Production
```bash
npm run build
npm run start
```

---

## 📂 Directory Structure

```
Safevital XR-frontend/
├── src/
│   ├── app/                      # Next.js App Router (27 Pages & Layouts)
│   │   ├── app/                  # Authenticated Dashboard Application
│   │   │   ├── dashboard/        # Command Center, Live Punch Clock & KPIs
│   │   │   ├── employees/        # Directory (Cards & Table Views)
│   │   │   │   └── [id]/         # Employee Profile & Detail Page
│   │   │   ├── attendance/       # Timesheets & Shift Punch Terminal
│   │   │   ├── leave/            # Leave Allowance & Manager Approvals
│   │   │   ├── tasks/            # Kanban Tasks & Sprints Board
│   │   │   ├── reports/          # Weekly Reports with File Uploads
│   │   │   ├── tickets/          # Support & Helpdesk Desk
│   │   │   ├── departments/      # Department Structure & Management
│   │   │   ├── teams/            # Cross-Functional Teams & Squads
│   │   │   ├── schedules/        # Shift & Work Schedules
│   │   │   ├── organization/     # Company Hierarchy Tree
│   │   │   ├── roles/            # Role Matrix & Fine-Grained Permissions
│   │   │   ├── access-requests/  # Privileged Access Request Queue
│   │   │   ├── security/         # Security Policies & MFA Settings
│   │   │   ├── audit/            # Security Audit Trail Ledger
│   │   │   └── settings/         # System Preferences & Localization
│   │   ├── login/                # 2FA Authentication Login Page
│   │   ├── verify-otp/           # 6-Digit Two-Factor OTP Verification Page
│   │   ├── activate-account/     # Account Invitation & Password Setup Page
│   │   ├── forgot-password/      # Password Recovery Request Page
│   │   ├── reset-password/       # Password Reset with Token Page
│   │   ├── layout.tsx            # Root Layout with Theme & Query Providers
│   │   └── globals.css           # Tailwind v4 Design System & Global Styles
│   ├── components/               # Reusable UI Components
│   │   ├── auth/                 # AuthLayout, OTPInput Components
│   │   ├── employees/            # InviteEmployeeModal, CreateDialogs
│   │   ├── layout/               # Header, Sidebar, DashboardLayout, NetworkStatusBanner
│   │   ├── ui/                   # Button, Card, Table, Skeleton, Badge, Dialog, Dropdown, etc.
│   │   └── CommandPalette.tsx    # Global Quick Jump Palette (Cmd+K / Ctrl+K)
│   ├── stores/                   # Zustand Global Stores
│   │   ├── authStore.ts          # Session, Token, & Auth State
│   │   ├── appStore.ts           # Workforce Data Ingestion & API Action Dispatchers
│   │   └── layoutStore.ts        # Sidebar Collapse & Mobile Drawer State
│   ├── services/                 # Backend API Service Integrations
│   │   ├── authService.ts        # Login, Verify OTP, Resend, Reset, Setup Password
│   │   ├── employeeService.ts    # Employee Fetch, Create & Directory endpoints
│   │   ├── invitationService.ts  # Invitation Dispatch endpoints
│   │   └── orgService.ts         # Department, Team, and Position endpoints
│   ├── types/                    # TypeScript Entity & DTO Interfaces
│   └── lib/                      # Central Axios API Client & Permission Utilities
├── package.json
└── README.md
```

---

## 🔒 Security & Architecture Principles

- **Zero Client-Side Fabrication**: The frontend never invents, simulates, or fabricates business data. All displayed statistics and workforce entities come from the backend.
- **Ephemeral State**: Workforce records are managed in-memory via Zustand and refreshed on demand; authoritative data is never stored in `localStorage`.
- **JWT Authorization**: Requests automatically pass authenticated Bearer tokens in headers.
- **Graceful Error Handling**: Real backend validation errors and server messages are surfaced cleanly via toast notifications and non-blocking banners.

---

## 📄 License & Attribution

Property of **SafeVitals XR Inc.** Designed and engineered for high-performance spatial computing workforce operations.
