declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET_KEY: string
      PORT?: string;
    }
  }
}

export {}