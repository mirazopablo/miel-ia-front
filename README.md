# Miel-IA Frontend - Intelligent Medical Diagnosis Interface

Miel-IA Frontend is the web interface for the **Miel-IA** eco-system, a medical diagnosis support system powered by Machine Learning. This application provides a modern, secure, and intuitive dashboard for doctors, researchers, and patients to visualize and manage electromyography (EMG) analysis for Guillain-Barré Syndrome detection.

Built with **Next.js 15**, **React 18**, and **Tailwind CSS**, it ensures a high-performance, responsive experience across all devices.

**Backend Repository**: [miel-ia](https://github.com/mirazopablo/miel-ia)

---

## Key Features

### Modern User Interface
- Responsive Design: Fully responsive layout optimized for desktop, tablets, and mobile devices.
- Shadcn/UI Components: Accessible and customizable components for a premium look and feel.
- Dark Mode: Native dark mode support for better readability in low-light environments.

### Role-Based Access Control (RBAC)
- Doctor Dashboard: access to patient studies, detailed risk analysis, and historical data.
- Admin Panel: User management and system configuration.
- Technician View: Upload and preprocess EMG data.

### Interactive Visualizations
- Data Charts: Visual representation of prediction confidence and risk levels using Recharts.
- Explainability: Friendly display of SHAP values to understand "why" a diagnosis was made.

### Patient Portal
- Direct Access: Patients can retrieve their study results safely using a unique tracking code and DNI.
- Privacy Focused: No registration required for patients, ensuring data minimization.

---

## Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| Framework | [Next.js 15](https://nextjs.org/) | The React Framework for the Web. |
| Library | [React 18](https://react.dev/) | Library for web and native user interfaces. |
| Language | [TypeScript](https://www.typescriptlang.org/) | Statically typed JavaScript. |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework. |
| UI Kit | [Shadcn/UI](https://ui.shadcn.com/) | Beautifully designed components. |
| State & API | [Axios](https://axios-http.com/) | Promise based HTTP client. |
| Forms | [React Hook Form](https://react-hook-form.com/) | Performant, flexible and extensible forms. |
| Validation | [Zod](https://zod.dev/) | TypeScript-first schema declaration and validation. |

---

## Installation and Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/mirazopablo/miel-ia-front.git
cd miel-ia-front
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```

### 3. Configure Environment
Rename `.env-example` to `.env` and configure your API URL:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Project Structure

```bash
miel-ia-front/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── dashboard/        # Authenticated views (Doctor, Admin, Technician)
│   ├── login/            # Authentication pages
│   └── studies/          # Public patient result views
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn primitive components
│   └── ...               # Application specific components
├── lib/                  # Utilities and helper functions
├── public/               # Static assets
└── styles/               # Global styles and Tailwind config
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Author

**Mirazo Pablo**
* Computer Engineering Student
* GitHub Profile:(https://github.com/mirazopablo)
