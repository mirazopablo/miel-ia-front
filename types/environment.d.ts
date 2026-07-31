declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BACKEND_FUNNEL_URL?: string;
      X_APP_SECRET_TOKEN?: string;
      NEXT_PUBLIC_API_URL?: string;
    }
  }
}

export {};
