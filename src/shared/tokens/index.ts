import crypto from "crypto";
import type { StringValue } from "ms";

import jwt from "jsonwebtoken";
import config from "../../config/config";

export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateAccessToken = (payload: Object, expireTime?: number | StringValue): string => {
  if (!config.jwt_secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const expiresIn = expireTime || "3d";
  return jwt.sign(payload, config.jwt_secret, {
    expiresIn,
  });
};

export const generatePasswordRestToken = (resetCode: string): string => {
  return crypto.createHash("sha256").update(resetCode).digest("hex");
};
