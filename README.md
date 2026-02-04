# Miel-IA Frontend | Intelligent Medical Diagnosis Interface

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **Modern web interface for the Miel-IA ecosystem, designed to assist medical professionals in the early detection of Guillain-Barré Syndrome through Machine Learning analysis of electromyography (EMG) data.**

<div align="center">
  <h3>🔗 Backend Repository</h3>
  <a href="https://github.com/mirazopablo/miel-ia">
    <img src="https://img.shields.io/badge/GO_TO_BACKEND-100000?style=for-the-badge&logo=github&logoColor=white" alt="Backend Repository" />
  </a>
</div>

---

## 🎓 Academic Context

<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/UM_logo.png" alt="Universidad de Mendoza Logo" width="150"/>
  <br/>
  <br/>
  <p>This project is part of the <strong>Final Integrative Project</strong> chair at the <strong>Universidad de Mendoza</strong> (School of Engineering).</p>
  <p>
    Developed under the supervision of <strong>Bio. Ignacio Bosch</strong>
    <br/>
    <a href="https://github.com/NachoBosch">
      <img src="https://img.shields.io/badge/GitHub-Supervisor-black?style=flat-square&logo=github" alt="Supervisor GitHub"/>
    </a>
  </p>
</div>

> [!NOTE]
> **Academic Repository**: This code is presented as part of an academic evaluation instance. For this reason, the repository does not accept external contributions (Pull Requests) and is maintained as a static reference of the work performed.

---

## 🌟 Key Features

The platform offers experiences tailored to different roles within the medical ecosystem:

### 🩺 Medical Dashboard (Doctor)
- **Advanced Risk Analysis**: Visualization of confidence levels and prediction risk using interactive charts.
- **Patient History**: Access to detailed historical data and diagnosis trends.
- **Study Management**: Efficient review and validation of EMG analysis results.
- **Explainability (XAI)**: Understanding the diagnosis logic through SHAP value visualizations.

### 🛡️ Admin Panel
- **User Management**: Access control and permissions for all system users.
- **System Configuration**: Management of global settings and audit logs.
- **Security Oversight**: Monitoring of system usage and role distribution.

### 🛠️ Technician Workspace
- **Data Ingestion**: Specific tools for uploading raw EMG data files.
- **Preprocessing**: Automated validation and preprocessing of input data before analysis.
- **Queue Management**: Monitoring of the processing status of uploaded studies.

### 🏥 Patient Portal
- **Secure Access**: Patients can retrieve results using a unique secure tracking code and their National ID (DNI).
- **Privacy First**: No account registration required, minimizing personal data storage.
- **Accessible Results**: Simplified medical reports that are easy to understand.

---

## 🚀 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | High-performance React framework with server-side rendering. |
| **UI Library** | **React 18** | Component-based library for building interactive interfaces. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for rapid design. |
| **Components** | **Shadcn/UI** | Accessible and customizable components based on Radix UI. |
| **State & API** | **Axios** | Efficient HTTP client for data management. |
| **Validation** | **Zod** | TypeScript-first schema declaration and validation. |
| **Forms** | **React Hook Form** | Performant forms with simple validation. |
| **Charts** | **Recharts** | Composable charting library for React. |

---

## ⚡ Getting Started

Follow these steps to configure the project locally.

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **Package Manager**: npm, pnpm, or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mirazopablo/miel-ia-front.git
    cd miel-ia-front
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory (copy from `.env-example`):
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```bash
miel-ia-front/
├── app/                    # Next.js App Router (Pages & Layouts)
│   ├── dashboard/          # Role-Protected Views
│   │   ├── admin/          # Administration
│   │   ├── doctor/         # Medical Analysis
│   │   └── technician/     # Data Processing
│   ├── studies/            # Public Patient Access
│   └── login/              # Authentication
├── components/             # React Components
│   ├── ui/                 # Base Components (Shadcn)
│   └── ...                 # Feature Components
├── lib/                    # Utilities and Helpers
├── public/                 # Static Assets
└── styles/                 # Global Styles
```

---

## 👨‍💻 Author

**Mirazo Pablo**
- 🔭 Computer Engineering Student
- 🐱 [GitHub Profile](https://github.com/mirazopablo)

---

<p align="center">
  Built with ❤️ for Medical Innovation
</p>
