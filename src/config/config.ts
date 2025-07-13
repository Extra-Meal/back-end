import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  jwt_secret: string;
  client_url: string;
  google_client_id?: string;
  google_client_secret?: string;
  google_refresh_token?: string;
  nodemailer_email?: string;
  nodemailer_password?: string;
  nodemailer_host?: string;
  cloudinary_cloud_name?: string;
  cloudinary_api_key?: string;
  cloudinary_api_secret?: string;
  cloudinary_url?: string;
  gemini_api_key?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase",
  google_client_id: process.env.GOOGLE_CLIENT_ID || "",
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
  google_refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
  jwt_secret: process.env.JWT_SECRET || "defaultsecretkey",
  client_url: process.env.CLIENT_URL || "https://extrameal.netlify.app",
  nodemailer_email: process.env.NODEMAILER_EMAIL || "",
  nodemailer_password: process.env.NODEMAILER_PASSWORD || "",
  nodemailer_host: process.env.NODEMAILER_HOST || "",
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY || "",
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinary_url: process.env.CLOUDINARY_URL,
  gemini_api_key: process.env.GEMINI_API_KEY || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export default config;
