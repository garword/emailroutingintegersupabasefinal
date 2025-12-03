// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'https://email-routing-manager.manulsinul99.workers.dev';

// Features
export const FEATURES = {
  useWorkerBackend: true,
} as const;
