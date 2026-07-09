declare module "bun" {
  interface Env {
    AWESOME: string;
    DATABASE_URL: string;
    DATABASE_USER: string;
    DATABASE_NAME: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    SECRET: string;
    CORS_ORIGIN_DEV: string;
  }
}
