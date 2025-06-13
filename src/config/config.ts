import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  jwt_secret: string;
  google_client_id?: string;
  google_client_secret?: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase",
  google_client_id: process.env.GOOGLE_CLIENT_ID || "",
  jwt_secret: process.env.JWT_SECRET || "defaultsecretkey",
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
};

export default config;
